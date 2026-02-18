import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getRedisClient, isRedisConfigured } from '../utils/redisClient';
import logger from '../utils/logger';

// CSRF Protection for GraphQL APIs with Redis validation
// Production-ready implementation

const CSRF_TTL_SECONDS = 3600; // 1 hour
const csrfKey = (identifier: string) => `csrf:${identifier}`;

// In-memory fallback for development only
const csrfStore: Map<string, { token: string; expiresAt: number }> = new Map();

// Extract userId from JWT token in Authorization header
const extractUserIdFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

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

// Get client identifier (userId if authenticated, IP as fallback for login/register)
const getClientIdentifier = (req: Request): string => {
  const userId = extractUserIdFromRequest(req);
  if (userId) return userId;
  
  // Fallback to IP for unauthenticated requests (login, register)
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
};

export const csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET requests (queries)
  if (req.method === 'GET') {
    return next();
  }

  // Skip for GraphQL introspection in development
  if (process.env.NODE_ENV !== 'production' && req.body?.operationName === 'IntrospectionQuery') {
    return next();
  }

  // Check Origin header for GraphQL mutations
  const origin = req.headers.origin || req.headers.referer;
  const isDev = process.env.NODE_ENV !== 'production';
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    ...(isDev ? [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ] : []),
  ].filter(Boolean);

  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed as string))) {
    return res.status(403).json({
      error: 'Origin not allowed',
      code: 'CSRF_VIOLATION',
      message: 'Request origin is not permitted'
    });
  }

  // Check Content-Type for POST requests
  const isJson = req.is('application/json');
  const isMultipart = req.is('multipart/form-data');

  if (req.method === 'POST' && !isJson && !isMultipart) {
    return res.status(400).json({
      error: 'Invalid Content-Type',
      code: 'INVALID_CONTENT_TYPE',
      message: 'GraphQL requests must use application/json or multipart/form-data'
    });
  }

  // CSRF token validation for sensitive operations
  const operationName = req.body?.operationName;
  const sensitiveOperations = [
    'login',
    'register',
    'createPayment',
    'updateUser',
    'deleteUser',
    'adminAction',
    'createBooking',
    'cancelBooking',
    'updateBooking'
  ];

  const isSensitiveOperation = operationName && 
    sensitiveOperations.some(op => operationName.toLowerCase().includes(op.toLowerCase()));

  if (isSensitiveOperation) {
    const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];

    if (!csrfToken || typeof csrfToken !== 'string') {
      return res.status(403).json({
        error: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token required for sensitive operations'
      });
    }

    // Validate token against Redis/store
    const identifier = getClientIdentifier(req);
    const redis = getRedisClient();
    let storedToken: string | null = null;

    if (redis) {
      storedToken = await redis.get(csrfKey(identifier));
    } else {
      // Development fallback
      const record = csrfStore.get(identifier);
      if (record && record.expiresAt > Date.now()) {
        storedToken = record.token;
      } else if (record) {
        csrfStore.delete(identifier);
      }
    }

    if (!storedToken || storedToken !== csrfToken) {
      return res.status(403).json({
        error: 'Invalid or expired CSRF token',
        code: 'INVALID_CSRF_TOKEN',
        message: 'CSRF token validation failed'
      });
    }
  }

  next();
};

// Generate secure CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF token endpoint - stores token in Redis and returns to client
export const csrfTokenHandler = async (req: Request, res: Response) => {
  const identifier = getClientIdentifier(req);
  const token = generateCSRFToken();
  const redis = getRedisClient();

  try {
    if (redis) {
      // Store in Redis with 1 hour expiry
      await redis.set(csrfKey(identifier), token, 'EX', CSRF_TTL_SECONDS);
    } else {
      // Development fallback - in-memory store
      if (process.env.NODE_ENV === 'production' && !isRedisConfigured()) {
        logger.warn('CSRF: Redis not configured in production — using in-memory fallback');
      }
      csrfStore.set(identifier, {
        token,
        expiresAt: Date.now() + CSRF_TTL_SECONDS * 1000
      });
    }

    res.json({
      csrfToken: token,
      expiresIn: CSRF_TTL_SECONDS * 1000 // 1 hour in milliseconds
    });
  } catch (error) {
    logger.error('CSRF token generation error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      error: 'Failed to generate CSRF token',
      code: 'CSRF_GENERATION_ERROR'
    });
  }
};
