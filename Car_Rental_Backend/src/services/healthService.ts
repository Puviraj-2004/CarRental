import prisma from '../utils/database';
import { getRedisClient, isRedisConfigured } from '../utils/redisClient';
import logger from '../utils/logger';

export interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'not_configured';
  latencyMs?: number;
  message?: string;
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  version: string;
  memoryUsage: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    percentUsed: number;
  };
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
  };
}

const toMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err: any) {
    logger.error('Health check: database unreachable', { error: err.message });
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: 'Database connection failed',
    };
  }
}

async function checkRedis(): Promise<ComponentHealth> {
  if (!isRedisConfigured()) {
    return { status: 'not_configured', message: 'Redis is not configured' };
  }

  const client = getRedisClient();
  if (!client) {
    return { status: 'unhealthy', message: 'Redis client unavailable' };
  }

  const start = Date.now();
  try {
    const pong = await client.ping();
    if (pong === 'PONG') {
      return { status: 'healthy', latencyMs: Date.now() - start };
    }
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: `Unexpected PING response: ${pong}`,
    };
  } catch (err: any) {
    logger.error('Health check: redis unreachable', { error: err.message });
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: 'Redis connection failed',
    };
  }
}

function deriveOverallStatus(
  components: HealthReport['components']
): HealthReport['status'] {
  const statuses = Object.values(components).map((c) => c.status);

  // If database is down, the whole service is unhealthy
  if (components.database.status === 'unhealthy') return 'unhealthy';

  // If any configured component is unhealthy, service is degraded
  if (statuses.some((s) => s === 'unhealthy')) return 'degraded';

  return 'healthy';
}

export async function getHealthReport(): Promise<HealthReport> {
  const [database, redis] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const mem = process.memoryUsage();
  const components = { database, redis };

  return {
    status: deriveOverallStatus(components),
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    memoryUsage: {
      heapUsedMB: toMB(mem.heapUsed),
      heapTotalMB: toMB(mem.heapTotal),
      rssMB: toMB(mem.rss),
      percentUsed: Math.round((mem.heapUsed / mem.heapTotal) * 100),
    },
    components,
  };
}
