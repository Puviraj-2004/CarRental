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
const rotatedKey = (token: string) => `rotated:rt:${token}`; // <-- Added: Cache key for grace period [1]

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

// ── Refresh token ─────────────────────────────────────────────────────────────

export const generateRefreshToken = async (userId: string, role: Role): Promise<string> => {
  const token   = crypto.randomBytes(32).toString('hex');
  const payload = JSON.stringify({ userId, role });
  const redis   = getRedisClient();

  if (redis && redis.status === 'ready') {
    try {
      await redis.set(refreshKey(token), payload, 'EX', REFRESH_TOKEN_TTL_SECONDS);
      return token;
    } catch (err) {
      console.error('Upstash Redis set failed, falling back to PostgreSQL:', err);
    }
  }

  if (env.nodeEnv === 'production') {
    await prisma.refreshToken.create({
      data: {
        token: token,
        userId: userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });
  } else {
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

  // Step 1: Query Upstash Redis with Grace-Period check [1]
  if (redis && redis.status === 'ready') {
    try {
      // Try to fetch from the active store first
      const raw = await redis.get(refreshKey(oldToken));
      if (raw) {
        payload = JSON.parse(raw) as { userId: string; role: Role };
        
        // Move to the rotated grace-period cache with a 60-second TTL [1]
        await redis.set(rotatedKey(oldToken), raw, 'EX', GRACE_PERIOD_SECONDS);
        // Evict from active store immediately [1]
        await redis.del(refreshKey(oldToken));
      } else {
        // Fallback: Check if the token was rotated within the last 60 seconds (concurrency check) [1]
        const rotatedRaw = await redis.get(rotatedKey(oldToken));
        if (rotatedRaw) {
          payload = JSON.parse(rotatedRaw) as { userId: string; role: Role };
        }
      }
    } catch (err) {
      console.error('Upstash Redis get failed during rotation, checking fallback:', err);
    }
  }

  // Step 2: Fallback query to PostgreSQL/Memory with Soft-Expiry Grace Period [1]
  if (!payload) {
    if (env.nodeEnv === 'production') {
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      if (dbToken && dbToken.expiresAt > new Date()) {
        payload = { userId: dbToken.userId, role: dbToken.user.role };
        
        // Instead of immediate deletion, set a short 60s expiration to handle parallel requests [1]
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
      await redis.del(rotatedKey(token)); // Clear grace period key [1]
    } catch (err) {
      console.error('Upstash Redis delete failed during revoke:', err);
    }
  }

  if (env.nodeEnv === 'production') {
    try {
      // In production, delete all traces from DB
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