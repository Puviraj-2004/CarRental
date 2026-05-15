import Redis from 'ioredis';
import { env } from './env';
import logger from './logger';

// ─── Build connection URL ─────────────────────────────────────────────────────

const getRedisUrl = (): string => {
  if (env.redisUrl) return env.redisUrl;
  if (!env.redisHost) return '';
  const auth = env.redisPassword ? `:${encodeURIComponent(env.redisPassword)}@` : '';
  return `redis://${auth}${env.redisHost}:${env.redisPort}`;
};

export const isRedisConfigured = (): boolean => !!getRedisUrl();

// ─── Singleton client ─────────────────────────────────────────────────────────

let redis: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (redis && redis.status === 'ready') return redis;

  if (redis && (redis.status === 'end' || redis.status === 'close')) {
    logger.warn('Redis: previous client is dead, resetting');
    try { redis.disconnect(); } catch { /* ignore */ }
    redis = null;
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  if (redis) return redis;

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Redis: max retries exceeded, falling back to in-memory mode');
          setImmediate(() => {
            if (redis) {
              try { redis!.disconnect(); } catch { /* ignore */ }
              redis = null;
            }
          });
          return null;
        }
        const delay = Math.min(times * 200, 2000);
        logger.warn(`Redis: retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
    });

    redis.on('error',  (err: Error) => logger.debug('Redis connection error', { message: err.message }));
    redis.on('ready',  ()           => logger.info('Redis: connection established'));
    redis.on('end',    ()           => { logger.warn('Redis: connection ended'); redis = null; });

    return redis;
  } catch (err) {
    logger.error('Redis: failed to create client', {
      message: err instanceof Error ? err.message : String(err),
    });
    redis = null;
    return null;
  }
};
