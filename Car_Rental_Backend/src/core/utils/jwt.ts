import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../errors/AppError';
import { getRedisClient } from '../../config/redis';
import { prisma } from '../../config/database';

interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ── Refresh-token constants ───────────────────────────────────────────────────
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const GRACE_PERIOD_SECONDS = 60; // 60-second window to handle parallel requests [1]

const refreshKey = (token: string) => `rt:${token}`;
const rotatedKey = (token: string) => `rotated:rt:${token}`;

// Lua script for atomic token rotation: GET + SET rotated + DEL active in one round-trip
const ROTATE_LUA = `
local active_key = KEYS[1]
local rotated_key = KEYS[2]
local grace_ttl = tonumber(ARGV[1])

local payload = redis.call('GET', active_key)
if not payload then
  -- Check if already rotated (concurrent request within grace period)
  local rotated = redis.call('GET', rotated_key)
  return rotated
end

-- Atomically move to rotated key and delete active
redis.call('SET', rotated_key, payload, 'EX', grace_ttl)
redis.call('DEL', active_key)
return payload
`;

/** Dev-only in-memory fallback */
const devStore = new Map<string, { userId: string; role: Role; expiresAt: number }>();

// ── Access token ──────────────────────────────────────────────────────────────

export const generateToken = (userId: string, role: Role): string =>
  jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: '15m' });

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JWTPayload;
  } catch {
    throw new AppError('Invalid or expired token.', ErrorCode.UNAUTHENTICATED);
  }
};

// ── Refresh token (Write-Through Pattern) ──────────────────────────────────────

export const generateRefreshToken = async (userId: string, role: Role): Promise<string> => {
  const token   = crypto.randomBytes(32).toString('hex');
  const payload = JSON.stringify({ userId, role });
  const redis   = getRedisClient();

  // 1. Primary write to high-speed Redis cache (if online) [1]
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(refreshKey(token), payload, 'EX', REFRESH_TOKEN_TTL_SECONDS);
    } catch (err) {
      console.error('Upstash Redis set failed during write-through:', err);
    }
  }

  // 2. Durable Fallback write-through (Always active to prevent cache-miss outages) [1]
  if (env.nodeEnv === 'production') {
    await prisma.refreshToken.create({
      data: {
        token: token,
        userId: userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });
  } else {
    // Local development runtime fallback
    devStore.set(token, { userId, role, expiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000 });
  }

  return token;
};

/**
 * Validates and rotates a refresh token using a single-use mechanism with a 60s grace period [1].
 */
export const rotateRefreshToken = async (
  oldToken: string,
): Promise<{ userId: string; role: Role; newRefreshToken: string }> => {
  const redis = getRedisClient();
  let payload: { userId: string; role: Role } | null = null;

  // Step 1: Atomic rotation via Lua script (prevents race conditions)
  if (redis && redis.status === 'ready') {
    try {
      const raw = await redis.eval(
        ROTATE_LUA,
        2,
        refreshKey(oldToken),
        rotatedKey(oldToken),
        String(GRACE_PERIOD_SECONDS),
      ) as string | null;

      if (raw) {
        payload = JSON.parse(raw) as { userId: string; role: Role };
      }
    } catch (err) {
      console.error('Redis rotation failed, checking fallback:', err);
    }
  }

  // Step 2: Fallback query to PostgreSQL/Memory (Always has the backup now!) [1]
  if (!payload) {
    if (env.nodeEnv === 'production') {
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      if (dbToken && dbToken.expiresAt > new Date()) {
        payload = { userId: dbToken.userId, role: dbToken.user.role };
        
        // Soft expiration to handle parallel requests [1]
        const graceExpiry = new Date(Date.now() + GRACE_PERIOD_SECONDS * 1000);
        await prisma.refreshToken.update({
          where: { token: oldToken },
          data: { expiresAt: graceExpiry },
        });
      }
    } else {
      const record = devStore.get(oldToken);
      if (record && record.expiresAt > Date.now()) {
        payload = { userId: record.userId, role: record.role };
        
        // Soft-expiry on in-memory dev fallback [1]
        devStore.set(oldToken, {
          userId: record.userId,
          role: record.role,
          expiresAt: Date.now() + GRACE_PERIOD_SECONDS * 1000,
        });
      }
    }
  }

  if (!payload) {
    throw new AppError('Invalid or expired refresh token.', ErrorCode.UNAUTHENTICATED);
  }

  // Step 3: Issue a fresh token pair to continue the valid session [1]
  const newRefreshToken = await generateRefreshToken(payload.userId, payload.role);
  return { ...payload, newRefreshToken };
};

/**
 * Revokes a session refresh token immediately during explicit user logout [1].
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  const redis = getRedisClient();
  
  if (redis && redis.status === 'ready') {
    try {
      await redis.del(refreshKey(token));
      await redis.del(rotatedKey(token)); 
    } catch (err) {
      console.error('Upstash Redis delete failed during revoke:', err);
    }
  }

  if (env.nodeEnv === 'production') {
    try {
      await prisma.refreshToken.deleteMany({ where: { token } });
    } catch (err) {
      console.error('PostgreSQL DB delete failed during revoke:', err);
    }
  } else {
    devStore.delete(token);
  }
};

// ── Password helpers ──────────────────────────────────────────────────────────
export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 10);
export const comparePasswords = async (plain: string, hashed: string): Promise<boolean> => bcrypt.compare(plain, hashed);