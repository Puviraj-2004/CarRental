import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import { getRedisClient, isRedisConfigured } from '../../config/redis';
import { env } from '../../config/env';

const isProd = env.nodeEnv === 'production';

/**
 * Build a Redis-backed store when Redis is available.
 * Falls back to the default in-memory store in development or when Redis is not configured.
 */
const createStore = () => {
  if (isRedisConfigured()) {
    const redis = getRedisClient();
    if (redis) {
      return new RedisStore({
        sendCommand: async (...args: string[]): Promise<RedisReply> => {
          const command = args[0];
          const commandArgs = args.slice(1);
          return redis.call(command, ...commandArgs) as Promise<RedisReply>;
        },
      });
    }
  }
  return undefined; // express-rate-limit falls back to in-memory
};

const keyFromRequest = (req: Request): string =>
  req.ip || req.socket?.remoteAddress || 'unknown';

// ─── General API limiter ──────────────────────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 500,
  message: {
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '900',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: createStore(),
  keyGenerator: keyFromRequest,
});

// ─── Auth limiter (login / verify-otp) ───────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 5 : 10,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '900',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: createStore(),
  keyGenerator: keyFromRequest,
});

// ─── Password reset limiter ───────────────────────────────────────────────────
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 3 : 5,
  message: {
    error: 'Too many password reset requests, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    retryAfter: '3600',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: createStore(),
  keyGenerator: keyFromRequest,
});

// ─── Registration limiter ─────────────────────────────────────────────────────
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 5 : 10,
  message: {
    error: 'Too many registration attempts, please try again later.',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    retryAfter: '3600',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: createStore(),
  keyGenerator: keyFromRequest,
});

// ─── Upload limiter ───────────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 20 : 50,
  message: {
    error: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: '3600',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: createStore(),
  keyGenerator: keyFromRequest,
});

// ─── Admin operation limiter ──────────────────────────────────────────────────
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 50 : 100,
  message: {
    error: 'Too many admin operations, please try again later.',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED',
    retryAfter: '900',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: createStore(),
  keyGenerator: keyFromRequest,
});