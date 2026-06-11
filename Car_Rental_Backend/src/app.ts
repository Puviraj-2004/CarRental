import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { env } from './config/env';
import { prisma } from './config/database';
import logger from './config/logger';
import { isCloudinaryConfigured } from './config/cloudinary';
import { getRedisClient } from './config/redis';

import { formatGraphQLError } from './core/errors/GraphQLError';
import { verifyToken } from './core/utils/jwt';
import { apiLimiter } from './core/middleware/rateLimit.middleware';

import { typeDefs, resolvers } from './graphql/schema';
import { GraphQLContext } from './graphql/context';
import { createDataLoaders } from './graphql/loaders/index';
import { handleStripeWebhook } from './modules/payments/payment.webhook';

export interface AppBundle {
  app: express.Express;
  httpServer: http.Server;
  apollo: ApolloServer<GraphQLContext>;
}

export async function buildApp(): Promise<AppBundle> {
  const isDev = env.nodeEnv === 'development';

  const app = express();
  const httpServer = http.createServer(app);

  app.set('trust proxy', 1);

  // ─── Cookie parser ─────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── Stripe webhook (must be BEFORE bodyParser.json) ──────────────────────
  app.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      await handleStripeWebhook(req, res, prisma);
    }
  );

  // ─── Apollo Server ────────────────────────────────────────────────────────
  const apollo = new ApolloServer<GraphQLContext>({
    csrfPrevention: true,
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: isDev,
    formatError: formatGraphQLError,
  });

  await apollo.start();
  logger.info('Apollo Server ready');

  // ─── Verify database connection ───────────────────────────────────────────
  try {
    await prisma.$connect();
    logger.info('Database connection established');
  } catch (err) {
    logger.error('Failed to connect to database', { error: err });
    throw new Error('Database unavailable – cannot start server');
  }

  // ─── Security headers (Helmet) ────────────────────────────────────────────
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
    })
  );

  // ─── Rate limiting ────────────────────────────────────────────────────────
  app.use('/graphql', apiLimiter);

  // ─── Request logging ──────────────────────────────────────────────────────
  app.use((req: Request, _res: Response, next) => {
    if (req.path === '/graphql') {
      logger.debug('GraphQL request', {
        operation: (req.body as { operationName?: string } | undefined)?.operationName ?? 'unnamed',
        method: req.method,
        ip: req.ip,
      });
    }
    next();
  });

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.use(
    cors<cors.CorsRequest>({
      origin: [
        env.frontendUrl,
        ...(isDev
          ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
          : []),
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    })
  );

  // ─── File uploads ─────────────────────────────────────────────────────────
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }));

  // ─── Body parser ──────────────────────────────────────────────────────────
  app.use(bodyParser.json());

  // ─── Health checks ────────────────────────────────────────────────────────
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
        status: 'healthy',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - start,
        components: {
          database: { status: 'healthy' },
          redis: { status: redisStatus },
        },
        memory: {
          heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        },
      });
    } catch (err) {
      res.status(503).json({
        status: 'unhealthy',
        message: err instanceof Error ? err.message : 'Health check failed',
      });
    }
  });

  app.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'alive', uptime: Math.round(process.uptime()) });
  });

  // ─── Diagnostics (dev only) ───────────────────────────────────────────────
  if (isDev) {
    app.get('/diag/cloudinary', (_req, res) => {
      res.json({
        configured: isCloudinaryConfigured(),
        cloudName: env.cloudinaryCloudName ?? null,
      });
    });
  }

  // ─── GraphQL handler ──────────────────────────────────────────────────────
  app.use(
    '/graphql',
    (expressMiddleware(apollo, {
      context: async ({ req, res }: { req: Request; res: Response }) => {
        const context: GraphQLContext = {
          prisma,
          req: req as unknown as Request,
          res,
          loaders: createDataLoaders(),
        };

        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded = verifyToken(token);
            context.userId = decoded.userId;
            context.role = decoded.role;
          } catch (err) {
            console.error('❌ JWT Verification failed on backend:', err);
          }
        }
        return context;
      },
    }) as unknown) as express.RequestHandler
  );

  return { app, httpServer, apollo };
}