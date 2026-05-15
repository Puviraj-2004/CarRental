import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../errors/AppError';
import { getRedisClient } from '../../config/redis';

interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ── Refresh-token constants ───────────────────────────────────────────────────

const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const refreshKey = (token: string) => `rt:${token}`;

/** Dev-only in-memory fallback (never used in production — Redis is enforced). */
const devStore = new Map<string, { userId: string; role: Role; expiresAt: number }>();

// ── Access token ──────────────────────────────────────────────────────────────

/**
 * Issues a short-lived access token (15 minutes).
 * The long-lived session is maintained via a separate refresh token.
 */
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

/**
 * Generates a cryptographically-secure opaque refresh token,
 * stores `{ userId, role }` in Redis (or dev in-memory map) with a 30-day TTL,
 * and returns the token string.
 */
export const generateRefreshToken = async (userId: string, role: Role): Promise<string> => {
  const token   = crypto.randomBytes(32).toString('hex');
  const payload = JSON.stringify({ userId, role });
  const redis   = getRedisClient();

  if (redis) {
    await redis.set(refreshKey(token), payload, 'EX', REFRESH_TOKEN_TTL_SECONDS);
  } else {
    if (env.nodeEnv === 'production') {
      throw new AppError(
        'Redis is required for refresh tokens in production.',
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
    devStore.set(token, { userId, role, expiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000 });
  }

  return token;
};

/**
 * Atomically validates and rotates a refresh token:
 * — looks up the old token in Redis / dev store
 * — deletes it immediately (single-use, prevents reuse)
 * — issues a new refresh token
 *
 * Throws UNAUTHENTICATED if the token is missing or expired.
 */
export const rotateRefreshToken = async (
  oldToken: string,
): Promise<{ userId: string; role: Role; newRefreshToken: string }> => {
  const redis = getRedisClient();
  let payload: { userId: string; role: Role } | null = null;

  if (redis) {
    const raw = await redis.get(refreshKey(oldToken));
    if (raw) {
      payload = JSON.parse(raw) as { userId: string; role: Role };
      await redis.del(refreshKey(oldToken));
    }
  } else {
    const record = devStore.get(oldToken);
    if (record && record.expiresAt > Date.now()) {
      payload = { userId: record.userId, role: record.role };
      devStore.delete(oldToken);
    }
  }

  if (!payload) {
    throw new AppError('Invalid or expired refresh token.', ErrorCode.UNAUTHENTICATED);
  }

  const newRefreshToken = await generateRefreshToken(payload.userId, payload.role);
  return { ...payload, newRefreshToken };
};

/**
 * Revokes a refresh token (logout).
 * Silent no-op if the token is already gone.
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  const redis = getRedisClient();
  if (redis) {
    await redis.del(refreshKey(token));
  } else {
    devStore.delete(token);
  }
};

// ── Password helpers ──────────────────────────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, 10);

export const comparePasswords = async (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);
