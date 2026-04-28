import Redis from 'ioredis';
import logger from './logger';

let redis: Redis | null = null;

const getRedisUrl = () => {
  const url = (process.env.REDIS_URL || '').trim();
  if (url) return url;

  const host = (process.env.REDIS_HOST || '').trim();
  if (!host) return '';

  const port = parseInt((process.env.REDIS_PORT || '6379').trim(), 10);
  const password = (process.env.REDIS_PASSWORD || '').trim();

  const auth = password ? `:${encodeURIComponent(password)}@` : '';
  return `redis://${auth}${host}:${port}`;
};

export const isRedisConfigured = () => {
  return !!getRedisUrl();
};

export const getRedisClient = (): Redis | null => {
  // Return existing healthy client
  if (redis && redis.status === 'ready') return redis;

  // If we have a dead/closed client, destroy it and start fresh
  if (redis && (redis.status === 'end' || redis.status === 'close')) {
    logger.warn('Redis: previous client is dead, resetting');
    try { redis.disconnect(); } catch { /* ignore */ }
    redis = null;
  }

  // No URL configured — Redis is intentionally absent
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  // Don't recreate if a connection attempt is already in progress
  if (redis) return redis;

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        if (times > 3) {
          // Permanent failure — schedule cleanup and return null to stop retrying
          logger.error('Redis: max retries exceeded, falling back to in-memory mode');
          setImmediate(() => {
            if (redis) {
              try { redis.disconnect(); } catch { /* ignore */ }
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

    redis.on('error', (err: Error) => {
      // Log at debug level to prevent log spam on transient errors
      logger.debug('Redis connection error', { message: err.message });
    });

    redis.on('ready', () => {
      logger.info('Redis: connection established');
    });

    redis.on('end', () => {
      logger.warn('Redis: connection ended, client reset to null');
      redis = null;
    });

    return redis;
  } catch (err) {
    logger.error('Redis: failed to create client', {
      message: err instanceof Error ? err.message : String(err),
    });
    redis = null;
    return null;
  }
};