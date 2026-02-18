import Redis from 'ioredis';
import logger from './logger';

let redis: Redis | null = null;

const isDev = (process.env.NODE_ENV || 'development') === 'development';

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

export const getRedisClient = () => {
  if (redis) return redis;

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    if (isDev) return null;
    return null;
  }

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    // Keep process alive; callers decide fallback/behavior
    if (isDev) {
      logger.warn('Redis error', { error: err?.message || String(err) });
    }
  });

  return redis;
};
