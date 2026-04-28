import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { DateTimeResolver } from 'graphql-scalars';
import dotenv from 'dotenv';
import path from 'path';

// Load env before any other imports
dotenv.config();

// Validate environment variables immediately after loading .env
import { validateEnv } from './utils/envValidation';
validateEnv();

import prisma from './utils/database';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './utils/auth';
import { expirationService } from './services/expirationService';
import { BookingStatus } from '@prisma/client';
import { apiLimiter } from './middleware/rateLimiter';
import logger, { securityLogger } from './utils/logger';
import { csrfProtection, csrfTokenHandler } from './middleware/csrfProtection';
import { createDataLoaders } from './utils/dataLoaders';
import { getHealthReport } from './services/healthService';

async function startServer() {
  logger.info('Initializing Car Rental Backend');

  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  const app = express();
  const httpServer = http.createServer(app);

  // ─── Trust proxy ───────────────────────────────────────────────────────────
  // Required so req.ip reflects the real client IP when running behind a
  // reverse proxy (nginx, ALB, etc.) and so CSRF IP-based identifiers are
  // correct.  Set to 1 to trust exactly one proxy hop.
  app.set('trust proxy', 1);

  // --- STRIPE CONFIGURATION ---
  const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let stripe: any = null;
  if (!isMockStripe && stripeSecretKey) {
    try {
      const Stripe = require('stripe');
      stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    } catch (e) {
      securityLogger.warn('Stripe module initialization failed');
    }
  }

  // 🚀 STRIPE WEBHOOK - MUST BE FIRST BEFORE ALL MIDDLEWARE
  app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    securityLogger.info('Stripe webhook received');
    try {
      if (isMockStripe) {
        securityLogger.info('Mock Stripe mode - returning 204');
        return res.status(204).send();
      }
      if (!stripe || !stripeWebhookSecret) throw new Error('Stripe not configured');

      const sig = req.headers['stripe-signature'];
      if (!sig) throw new Error('No Stripe signature');

      const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
      securityLogger.info('Webhook event received', { eventType: event.type });

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const bookingId = session?.metadata?.bookingId;
        securityLogger.info('Payment completed', { bookingId });

        if (bookingId) {
          const paymentIdentifier = session.payment_intent || session.id;

          await prisma.payment.upsert({
            where: { bookingId },
            update: { status: 'SUCCEEDED', stripeId: paymentIdentifier },
            create: {
              bookingId,
              amount: session.amount_total / 100,
              status: 'SUCCEEDED',
              stripeId: paymentIdentifier,
            },
          });
          securityLogger.info('Payment record created/updated', { bookingId });

          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CONFIRMED },
          });
          securityLogger.info('Booking confirmed via webhook', { bookingId });
        }
      }

      if (event.type === 'charge.refunded' || event.type === 'charge.refund.updated') {
        const charge = event.data.object as any;
        const bookingId = charge?.metadata?.bookingId;
        const paymentIntentId = charge?.payment_intent;

        securityLogger.info('Refund event detected', { bookingId, paymentIntentId });

        let payment: any = null;
        if (bookingId) {
          payment = await prisma.payment.findUnique({ where: { bookingId } });
        }
        if (!payment && paymentIntentId) {
          payment = await prisma.payment.findFirst({ where: { stripeId: paymentIntentId } });
        }

        if (payment) {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED' } });
          securityLogger.info('Payment marked REFUNDED', { paymentId: payment.id });

          try {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: BookingStatus.CANCELLED },
            });
            securityLogger.info('Booking cancelled for refunded payment', { bookingId: payment.bookingId });
          } catch (e) {
            const errMsg = e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e);
            securityLogger.warn('Could not update booking on refund', { error: errMsg });
          }
        } else {
          securityLogger.warn('Refund event: payment not found', { chargeId: charge.id });
        }
      }

      securityLogger.info('Webhook processed successfully');
      return res.json({ received: true });
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : String(error);
      securityLogger.error('Webhook processing error', { error: msg });
      return res.status(400).json({ error: msg });
    }
  });

  // --- APOLLO SERVER SETUP ---
  const server = new ApolloServer({
    csrfPrevention: false,

    typeDefs: [
      `scalar DateTime`,
      ...(Array.isArray(typeDefs) ? typeDefs : [typeDefs]),
    ],
    resolvers: {
      DateTime: DateTimeResolver,
      ...(resolvers as any),
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: isDev,
  });

  await server.start();
  logger.info('Apollo Server ready');

  // 1. SECURITY HEADERS
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      xFrameOptions: { action: 'deny' },
      xContentTypeOptions: true,
      hidePoweredBy: true,
    }),
  );

  // 2. RATE LIMITING
  app.use('/graphql', apiLimiter);

  // 3. LOGGING — operationName always populated (P2 fix already present)
  app.use((req: Request, _res: Response, next) => {
    if (req.path === '/graphql') {
      const opName = req.body?.operationName || 'UnnamedOperation';
      logger.info(`GraphQL Request: ${opName}`, {
        method: req.method,
        ip: req.ip,
        operation: opName,
      });
    }
    next();
  });

  // 4. CORS
  app.use(
    cors<cors.CorsRequest>({
      origin: [
        process.env.FRONTEND_URL || '',
        ...(isDev
          ? [
              'http://localhost:3000',
              'http://localhost:3001',
              'http://127.0.0.1:3000',
            ]
          : []),
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Apollo-Require-Preflight',
        'x-csrf-token',
      ],
    }),
  );

  // 5. UPLOADS
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // 6. CSRF
  app.use('/graphql', csrfProtection);
  app.get('/csrf-token', csrfTokenHandler);

  // 7. GENERAL MIDDLEWARE
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 8. HEALTH CHECK
  app.get('/health', async (_req, res) => {
    try {
      const report = await getHealthReport();
      const statusCode =
        report.status === 'healthy' ? 200
        : report.status === 'degraded' ? 200
        : 503;
      res.status(statusCode).json(report);
    } catch {
      res.status(503).json({ status: 'unhealthy', message: 'Health check failed' });
    }
  });

  // 8b. LIVENESS PROBE (lightweight, no dependency checks)
  app.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'alive', uptime: Math.round(process.uptime()) });
  });

  // 9. DIAGNOSTICS
  app.get('/diag/cloudinary', (_req, res) => {
    try {
      const raw = process.env.CLOUDINARY_CLOUD_NAME;
      const cloudLib = require('./utils/cloudinary');
      const effective = cloudLib?.default?.config?.().cloud_name || null;
      res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
    } catch (e: any) {
      res.status(500).json({ error: 'Cloudinary diagnostic failed' });
    }
  });

  // 10. GRAPHQL HANDLER
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const context: any = { prisma, req, loaders: createDataLoaders() };
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded: any = verifyToken(token);
            if (decoded) {
              context.userId = decoded.userId;
              context.role = decoded.role;
            }
          } catch {
            // Context remains Guest
          }
        }
        return context;
      },
    }) as any,
  );

  const PORT = process.env.PORT || 4000;
  logger.info('Attempting to listen', { port: PORT });

  await new Promise<void>((resolve) => httpServer.listen({ port: Number(PORT) }, resolve));

  logger.info('Server ready', { url: `http://localhost:${PORT}/graphql` });

  // START BACKGROUND SERVICES
  expirationService.startExpirationService();

  // GRACEFUL SHUTDOWN
  const gracefulShutdown = async (signal: string) => {
    logger.info('Graceful shutdown initiated', { signal });

    httpServer.close(async () => {
      logger.info('HTTP server closed');

      try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
      } catch (err) {
        logger.error('Error disconnecting Prisma', {
          error: err instanceof Error ? err.message : String(err),
        });
      }

      logger.info('Graceful shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((error) => {
  logger.error('CRITICAL ERROR DURING STARTUP', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});