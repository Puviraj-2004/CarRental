import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import { getRedisClient, isRedisConfigured } from '../../config/redis';
import { env } from '../../config/env';
import logger from '../../config/logger';

const isProd = env.nodeEnv === 'production';

/**
 * Build a Redis-backed store with self-healing fail-open protections [1].
 * Fall back to Express in-memory store at startup if Redis is unreachable [1].
 */
const createStore = () => {
  if (isRedisConfigured()) {
    const redis = getRedisClient();
    // Only instantiate RedisStore if the connection is established and ready [1]
    if (redis && redis.status === 'ready') {
      return new RedisStore({
        sendCommand: async (...args: string[]): Promise<RedisReply> => {
          // If the connection drops during active runtime, fail-open [1]
          if (redis.status !== 'ready') {
            logger.debug('Redis rate-limiter: connection is offline mid-request. Failing open.');
            return [1, 0] as unknown as RedisReply;
          }

          try {
            const command = args[0];
            const commandArgs = args.slice(1);
            return await (redis.call(command, ...commandArgs) as Promise<RedisReply>);
          } catch (err) {
            logger.warn('Redis rate-limiter: command failed during active outage. Failing open.', {
              error: err instanceof Error ? err.message : String(err)
            });
            return [1, 0] as unknown as RedisReply;
          }
        },
      });
    }
  }
  return undefined; // express-rate-limit falls back to standard in-memory
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