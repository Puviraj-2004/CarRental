import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import type Stripe from 'stripe';

import { env } from './config/env';
import { prisma } from './config/database';
import logger, { securityLogger } from './config/logger';
import { getStripeClient } from './config/stripe';
import { isCloudinaryConfigured } from './config/cloudinary';
import { getRedisClient } from './config/redis';

import { formatGraphQLError } from './core/errors/GraphQLError';
import { verifyToken } from './core/utils/jwt';
import { apiLimiter } from './core/middleware/rateLimit.middleware';

import { typeDefs, resolvers } from './graphql/schema';
import { GraphQLContext } from './graphql/context';
import { createDataLoaders } from './graphql/loaders/index';

export interface AppBundle {
  app:        express.Express;
  httpServer: http.Server;
  apollo:     ApolloServer<GraphQLContext>;
}

export async function buildApp(): Promise<AppBundle> {
  const isDev = env.nodeEnv === 'development';

  const app        = express();
  const httpServer = http.createServer(app);

  app.set('trust proxy', 1);

  // ─── Stripe webhook ───────────────────────────────────────────────────────
  // Must be registered BEFORE bodyParser.json() — Stripe requires the raw body.
  app.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response): Promise<void> => {
      securityLogger.info('Stripe webhook received');
      try {
        if (env.mockStripe) {
          securityLogger.info('Mock Stripe mode — returning 204');
          res.status(204).send();
          return;
        }

        const stripe = getStripeClient();
        if (!stripe || !env.stripeWebhookSecret) {
          throw new Error('Stripe is not configured');
        }

        const sig = req.headers['stripe-signature'];
        if (!sig) throw new Error('Missing Stripe-Signature header');

        const event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig,
          env.stripeWebhookSecret,
        );
        securityLogger.info('Webhook event received', { type: event.type });

        // ── checkout.session.completed ───────────────────────────────────────
        if (event.type === 'checkout.session.completed') {
          const session   = event.data.object as Stripe.Checkout.Session;
          const bookingId = session.metadata?.bookingId;

          if (bookingId) {
            const paymentRef = session.payment_intent ?? session.id;
            await prisma.payment.upsert({
              where:  { bookingId },
              update: { status: PaymentStatus.PAID, stripeId: String(paymentRef) },
              create: {
                bookingId,
                amount:   (session.amount_total ?? 0) / 100,
                status:   PaymentStatus.PAID,
                stripeId: String(paymentRef),
              },
            });
            await prisma.booking.update({
              where: { id: bookingId },
              data:  { status: BookingStatus.CONFIRMED },
            });
            securityLogger.info('Booking confirmed via webhook', { bookingId });
          }
        }

        // ── charge.refunded / charge.refund.updated ──────────────────────────
        if (
          event.type === 'charge.refunded' ||
          event.type === 'charge.refund.updated'
        ) {
          const charge          = event.data.object as Stripe.Charge;
          const bookingId       = charge.metadata?.bookingId;
          const paymentIntentId = typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;

          let payment = bookingId
            ? await prisma.payment.findUnique({ where: { bookingId } })
            : null;

          if (!payment && paymentIntentId) {
            payment = await prisma.payment.findFirst({
              where: { stripeId: paymentIntentId },
            });
          }

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data:  { status: PaymentStatus.REFUNDED },
            });
            try {
              await prisma.booking.update({
                where: { id: payment.bookingId },
                data:  { status: BookingStatus.CANCELLED },
              });
              securityLogger.info('Booking cancelled for refund', {
                bookingId: payment.bookingId,
              });
            } catch (err) {
              securityLogger.warn('Could not cancel booking on refund', {
                error: err instanceof Error ? err.message : String(err),
              });
            }
          } else {
            securityLogger.warn('Refund event: payment not found', {
              chargeId: charge.id,
            });
          }
        }

        securityLogger.info('Webhook processed successfully');
        res.json({ received: true });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        securityLogger.error('Webhook processing error', { error: msg });
        res.status(400).json({ error: msg });
      }
    },
  );

  // ─── Apollo Server ────────────────────────────────────────────────────────
  const apollo = new ApolloServer<GraphQLContext>({
    csrfPrevention: true,
    typeDefs,
    resolvers,
    plugins:       [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: isDev,
    formatError:   formatGraphQLError,
  });

  await apollo.start();
  logger.info('Apollo Server ready');

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc:     ["'self'"],
          scriptSrc:      ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc:       ["'self'", "'unsafe-inline'"],
          imgSrc:         ["'self'", 'data:', 'https:'],
          fontSrc:        ["'self'"],
          connectSrc:     ["'self'"],
          mediaSrc:       ["'self'"],
          objectSrc:      ["'none'"],
          frameSrc:       ["'none'"],
          baseUri:        ["'self'"],
          formAction:     ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      xFrameOptions:       { action: 'deny' },
      xContentTypeOptions: true,
      hidePoweredBy:       true,
    }),
  );

  // ── Rate limiting ─────────────────────────────────────────────────────────
  app.use('/graphql', apiLimiter);

  // ── Request logging ───────────────────────────────────────────────────────
  app.use((req: Request, _res: Response, next) => {
    if (req.path === '/graphql') {
      logger.debug('GraphQL request', {
        operation: (req.body as { operationName?: string } | undefined)?.operationName ?? 'unnamed',
        method:    req.method,
        ip:        req.ip,
      });
    }
    next();
  });

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors<cors.CorsRequest>({
      origin: [
        env.frontendUrl,
        ...(isDev
          ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
          : []),
      ].filter(Boolean),
      credentials:    true,
      methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    }),
  );

  // ── File uploads ──────────────────────────────────────────────────────────
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }));

  // ── Body parser ───────────────────────────────────────────────────────────
  app.use(bodyParser.json());

  // ── Health checks ─────────────────────────────────────────────────────────
  app.get('/health', async (_req, res) => {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const redis = getRedisClient();
      let redisStatus = 'not_configured';
      if (redis) {
        try {
          redisStatus = (await redis.ping()) === 'PONG' ? 'healthy' : 'degraded';
        } catch {
          redisStatus = 'unhealthy';
        }
      }
      const mem = process.memoryUsage();
      res.json({
        status:    'healthy',
        uptime:    Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - start,
        components: {
          database: { status: 'healthy' },
          redis:    { status: redisStatus },
        },
        memory: {
          heapUsedMB:  Math.round(mem.heapUsed  / 1024 / 1024),
          heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        },
      });
    } catch (err) {
      res.status(503).json({
        status:  'unhealthy',
        message: err instanceof Error ? err.message : 'Health check failed',
      });
    }
  });

  app.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'alive', uptime: Math.round(process.uptime()) });
  });

  // ── Diagnostics (dev only) ────────────────────────────────────────────────
  if (isDev) {
    app.get('/diag/cloudinary', (_req, res) => {
      res.json({
        configured: isCloudinaryConfigured(),
        cloudName:  env.cloudinaryCloudName ?? null,
      });
    });
  }

  // ── GraphQL handler ───────────────────────────────────────────────────────
  app.use(
    '/graphql',
    /**
     * Apollo bundles its own @types/express, producing two incompatible
     * RequestHandler types at the app.use() call site (TS2352/TS2769).
     * The double cast (value → unknown → RequestHandler) is the correct
     * TypeScript-sanctioned pattern for unrelated structural types and is
     * intentionally isolated to this single line.
     */
    (expressMiddleware(apollo, {
      context: async ({ req }: { req: Request }): Promise<GraphQLContext> => {
        const context: GraphQLContext = {
          prisma,
          req:     req as unknown as Request,
          loaders: createDataLoaders(),
        };

        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded = verifyToken(token);
            context.userId = decoded.userId;
            context.role   = decoded.role;
          } catch {
            // Invalid token — request continues as unauthenticated
          }
        }

        return context;
      },
    }) as unknown) as express.RequestHandler,
  );

  return { app, httpServer, apollo };
}