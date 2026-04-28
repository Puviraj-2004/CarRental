import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getRedisClient, isRedisConfigured } from '../utils/redisClient';
import logger from '../utils/logger';

const CSRF_TTL_SECONDS = 3600; // 1 hour
const csrfKey = (identifier: string) => `csrf:${identifier}`;

// In-memory fallback (used when Redis is unavailable)
const csrfStore: Map<string, { token: string; expiresAt: number }> = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractUserIdFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
};

/**
 * Returns a stable identifier for the requester.
 * Prefers authenticated userId; falls back to IP.
 * Trust proxy must be enabled on the Express app for x-forwarded-for to be safe.
 */
const getClientIdentifier = (req: Request): string => {
  const userId = extractUserIdFromRequest(req);
  if (userId) return `user:${userId}`;

  // req.ip is already normalised by Express when trust proxy is set
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
};

/**
 * Read a token from Redis if the client is healthy, otherwise read from
 * the in-memory fallback store.  Never throws — returns null on any failure.
 */
const readToken = async (identifier: string): Promise<string | null> => {
  const redis = getRedisClient();

  if (redis && redis.status === 'ready') {
    try {
      return await redis.get(csrfKey(identifier));
    } catch (err) {
      logger.warn('CSRF: Redis read failed, falling back to in-memory', {
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // In-memory fallback
  const record = csrfStore.get(identifier);
  if (record && record.expiresAt > Date.now()) return record.token;
  return null;
};

/**
 * Write a token to Redis if healthy, otherwise write to in-memory store.
 * Never throws — logs and returns false on failure.
 */
const writeToken = async (identifier: string, token: string): Promise<boolean> => {
  const redis = getRedisClient();

  if (redis && redis.status === 'ready') {
    try {
      await redis.set(csrfKey(identifier), token, 'EX', CSRF_TTL_SECONDS);
      return true;
    } catch (err) {
      logger.warn('CSRF: Redis write failed, falling back to in-memory', {
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // In-memory fallback
  if (process.env.NODE_ENV === 'production' && !isRedisConfigured()) {
    logger.warn('CSRF: Redis not configured in production — using in-memory fallback');
  }

  csrfStore.set(identifier, {
    token,
    expiresAt: Date.now() + CSRF_TTL_SECONDS * 1000,
  });
  return true;
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export const csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET requests (queries)
  if (req.method === 'GET') return next();

  // Skip for GraphQL introspection in development
  if (process.env.NODE_ENV !== 'production' && req.body?.operationName === 'IntrospectionQuery') {
    return next();
  }

  // Origin check
  const origin = req.headers.origin || req.headers.referer;
  const isDev = process.env.NODE_ENV !== 'production';
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    ...(isDev
      ? [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
        ]
      : []),
  ].filter(Boolean);

  if (origin && !allowedOrigins.some((allowed) => origin.startsWith(allowed as string))) {
    return res.status(403).json({
      error: 'Origin not allowed',
      code: 'CSRF_VIOLATION',
      message: 'Request origin is not permitted',
    });
  }

  // Content-Type check
  const isJson = req.is('application/json');
  const isMultipart = req.is('multipart/form-data');

  if (req.method === 'POST' && !isJson && !isMultipart) {
    return res.status(400).json({
      error: 'Invalid Content-Type',
      code: 'INVALID_CONTENT_TYPE',
      message: 'GraphQL requests must use application/json or multipart/form-data',
    });
  }

  // CSRF token validation for sensitive operations
  const operationName = req.body?.operationName || 'UnnamedOperation';
  const sensitiveOperations = [
    'login',
    'register',
    'createPayment',
    'updateUser',
    'deleteUser',
    'adminAction',
    'createBooking',
    'cancelBooking',
    'updateBooking',
  ];

  const isSensitiveOperation =
    operationName &&
    sensitiveOperations.some((op) =>
      operationName.toLowerCase().includes(op.toLowerCase())
    );

  if (isSensitiveOperation) {
    const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];

    if (!csrfToken || typeof csrfToken !== 'string') {
      return res.status(403).json({
        error: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token required for sensitive operations',
      });
    }

    const identifier = getClientIdentifier(req);
    const storedToken = await readToken(identifier);

    if (!storedToken || storedToken !== csrfToken) {
      return res.status(403).json({
        error: 'Invalid or expired CSRF token',
        code: 'INVALID_CSRF_TOKEN',
        message: 'CSRF token validation failed',
      });
    }
  }

  next();
};

// ─── Token endpoint ───────────────────────────────────────────────────────────

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const csrfTokenHandler = async (req: Request, res: Response) => {
  const identifier = getClientIdentifier(req);
  const token = generateCSRFToken();

  try {
    await writeToken(identifier, token);

    res.json({
      csrfToken: token,
      expiresIn: CSRF_TTL_SECONDS * 1000,
    });
  } catch (error) {
    logger.error('CSRF token generation error', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: 'Failed to generate CSRF token',
      code: 'CSRF_GENERATION_ERROR',
    });
  }
};