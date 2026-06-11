import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../errors/AppError';
import { getRedisClient } from '../../config/redis';
import { prisma } from '../../config/database'; // ✅ Corrected import path based on your config

interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ── Refresh-token constants ───────────────────────────────────────────────────
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const refreshKey = (token: string) => `rt:${token}`;

/** Dev-only in-memory fallback (Only used in local development if Upstash/Redis is unavailable). */
const devStore = new Map<string, { userId: string; role: Role; expiresAt: number }>();

// ── Access token ──────────────────────────────────────────────────────────────

/**
 * Issues a short-lived cryptographically signed access token (15-minute expiry).
 * The long-lived session is safely maintained via a separate refresh token.
 */
export const generateToken = (userId: string, role: Role): string =>
  jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: '15m' });

/**
 * Validates the incoming access token signature and expiration state.
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JWTPayload;
  } catch {
    throw new AppError('Invalid or expired token.', ErrorCode.UNAUTHENTICATED);
  }
};

// ── Refresh token ─────────────────────────────────────────────────────────────

/**
 * Generates an opaque refresh token. Stores it primarily in Upstash Redis,
 * with an automated fallback write to PostgreSQL (Prisma) if Redis goes offline.
 */
export const generateRefreshToken = async (userId: string, role: Role): Promise<string> => {
  const token   = crypto.randomBytes(32).toString('hex');
  const payload = JSON.stringify({ userId, role });
  const redis   = getRedisClient();

  // Primary persistent store: Upstash Redis (Checked for 'ready' status matching ioredis config)
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(refreshKey(token), payload, 'EX', REFRESH_TOKEN_TTL_SECONDS);
      return token;
    } catch (err) {
      console.error('Upstash Redis set failed, falling back to PostgreSQL:', err);
    }
  }

  // Fault Tolerance: Save to PostgreSQL if Redis is unreachable in production
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
 * Validates and rotates a refresh token using a single-use mechanism.
 * Queries Redis first, falling back to PostgreSQL if the token was generated during a downtime window.
 */
export const rotateRefreshToken = async (
  oldToken: string,
): Promise<{ userId: string; role: Role; newRefreshToken: string }> => {
  const redis = getRedisClient();
  let payload: { userId: string; role: Role } | null = null;

  // Step 1: Attempt retrieval and instant revocation from Upstash Redis
  if (redis && redis.status === 'ready') {
    try {
      const raw = await redis.get(refreshKey(oldToken));
      if (raw) {
        payload = JSON.parse(raw) as { userId: string; role: Role };
        await redis.del(refreshKey(oldToken)); // Enforce single-use constraint (Rotation)
      }
    } catch (err) {
      console.error('Upstash Redis get failed during rotation, checking PostgreSQL fallback:', err);
    }
  }

  // Step 2: Fallback query to PostgreSQL if token was missed or Redis was down
  if (!payload) {
    if (env.nodeEnv === 'production') {
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      // Verify record existence and enforce expiration threshold
      if (dbToken && dbToken.expiresAt > new Date()) {
        payload = { userId: dbToken.userId, role: dbToken.user.role };
        await prisma.refreshToken.delete({ where: { token: oldToken } }); // Enforce single-use constraint
      }
    } else {
      const record = devStore.get(oldToken);
      if (record && record.expiresAt > Date.now()) {
        payload = { userId: record.userId, role: record.role };
        devStore.delete(oldToken);
      }
    }
  }

  // Deny access if token is invalid, expired, or previously reused
  if (!payload) {
    throw new AppError('Invalid or expired refresh token.', ErrorCode.UNAUTHENTICATED);
  }

  // Step 3: Issue a fresh token pair to continue the valid session smoothly
  const newRefreshToken = await generateRefreshToken(payload.userId, payload.role);
  return { ...payload, newRefreshToken };
};

/**
 * Revokes a session refresh token immediately during explicit user logout.
 * Cleanses both Redis and PostgreSQL states to mitigate session replay vectors.
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  const redis = getRedisClient();
  
  // Clean up Redis active cache state
  if (redis && redis.status === 'ready') {
    try {
      await redis.del(refreshKey(token));
    } catch (err) {
      console.error('Upstash Redis delete failed during revoke:', err);
    }
  }

  // Clean up PostgreSQL backup state
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