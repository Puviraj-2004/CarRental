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

export const getRedisClient = () => {
  if (redis) return redis;

  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, 
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.error('Redis: Max retries reached. Moving to fallback mode.');
        return null; 
      }
      return Math.min(times * 100, 2000);
    }
  });

  redis.on('error', (err) => {
    logger.debug('Redis error', { message: err.message });
  });

  return redis;
};
