import crypto from 'crypto';
import { getRedisClient } from '../../config/redis';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../errors/AppError';

const OTP_TTL_SECONDS         = 5  * 60; // 5 minutes
const PENDING_REG_TTL_SECONDS = 15 * 60; // 15 minutes

const otpKey        = (email: string) => `otp:${email.toLowerCase()}`;
const pendingRegKey = (email: string) => `pending_reg:${email.toLowerCase()}`;

// ─── In-memory fallbacks (development only) ──────────────────────────────────
type OTPRecord    = { code: string; expiresAt: number; attemptsLeft: number };
type PendingRecord = { fullName: string; password: string; phoneNumber?: string; registeredAt: number };

const otpStore             = new Map<string, OTPRecord>();
const pendingRegistrations = new Map<string, PendingRecord>();

const requireRedisInProduction = (): void => {
  if (env.nodeEnv === 'production' && !getRedisClient()) {
    throw new AppError(
      'Redis is required for OTP storage in production.',
      ErrorCode.INTERNAL_SERVER_ERROR,
    );
  }
};

const safeJsonParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
};

// ─── OTP ─────────────────────────────────────────────────────────────────────

/** Returns a cryptographically secure 6-digit OTP string. */
export const generateOTP = (): string =>
  crypto.randomInt(100000, 1000000).toString();

export const storeOTP = async (
  email: string,
  otp: string,
): Promise<{ expiresAt: string }> => {
  requireRedisInProduction();
  const normalized = email.toLowerCase();
  const expiresAt  = Date.now() + OTP_TTL_SECONDS * 1000;
  const record: OTPRecord = { code: otp, expiresAt, attemptsLeft: 5 };

  const redis = getRedisClient();
  if (redis) {
    await redis.set(otpKey(normalized), JSON.stringify(record), 'EX', OTP_TTL_SECONDS);
  } else {
    otpStore.set(normalized, record);
  }
  return { expiresAt: new Date(expiresAt).toISOString() };
};

export const verifyOTPCode = async (
  email: string,
  otp: string,
): Promise<{ valid: boolean; message: string }> => {
  requireRedisInProduction();
  const normalized = email.toLowerCase();
  const key        = otpKey(normalized);
  const redis      = getRedisClient();

  let stored: OTPRecord | null = null;
  if (redis) {
    stored = safeJsonParse<OTPRecord>(await redis.get(key));
  } else {
    stored = otpStore.get(normalized) ?? null;
  }

  if (!stored) {
    throw new AppError('Invalid or expired OTP.', ErrorCode.BAD_USER_INPUT);
  }

  if (stored.expiresAt < Date.now()) {
    if (redis) await redis.del(key); else otpStore.delete(normalized);
    throw new AppError('Invalid or expired OTP.', ErrorCode.BAD_USER_INPUT);
  }

  if (stored.attemptsLeft <= 0) {
    if (redis) await redis.del(key); else otpStore.delete(normalized);
    throw new AppError('Too many failed attempts. Please request a new OTP.', ErrorCode.BAD_USER_INPUT);
  }

  if (stored.code !== otp) {
    const next: OTPRecord = { ...stored, attemptsLeft: stored.attemptsLeft - 1 };
    const remainingSeconds = Math.max(1, Math.ceil((next.expiresAt - Date.now()) / 1000));
    if (redis) {
      await redis.set(key, JSON.stringify(next), 'EX', remainingSeconds);
    } else {
      otpStore.set(normalized, next);
    }
    throw new AppError(
      `Invalid OTP. ${next.attemptsLeft} attempt${next.attemptsLeft === 1 ? '' : 's'} remaining.`,
      ErrorCode.BAD_USER_INPUT,
    );
  }

  // Valid — delete immediately to prevent reuse
  if (redis) await redis.del(key); else otpStore.delete(normalized);
  return { valid: true, message: 'OTP verified successfully.' };
};

export const clearOTP = async (email: string): Promise<void> => {
  requireRedisInProduction();
  const normalized = email.toLowerCase();
  const redis = getRedisClient();
  if (redis) await redis.del(otpKey(normalized));
  else otpStore.delete(normalized);
};

// ─── Pending Registration ─────────────────────────────────────────────────────

export const storePendingRegistration = async (
  email: string,
  fullName: string,
  hashedPassword: string,
  phoneNumber?: string,
): Promise<void> => {
  requireRedisInProduction();
  const normalized = email.toLowerCase();
  const record: PendingRecord = {
    fullName,
    password: hashedPassword,
    phoneNumber,
    registeredAt: Date.now(),
  };

  const redis = getRedisClient();
  if (redis) {
    await redis.set(pendingRegKey(normalized), JSON.stringify(record), 'EX', PENDING_REG_TTL_SECONDS);
  } else {
    pendingRegistrations.set(normalized, record);
  }
};

export const getPendingRegistration = async (
  email: string,
): Promise<{ fullName: string; password: string; phoneNumber?: string } | null> => {
  requireRedisInProduction();
  const normalized = email.toLowerCase();
  const redis = getRedisClient();

  let pending: PendingRecord | null = null;
  if (redis) {
    pending = safeJsonParse<PendingRecord>(await redis.get(pendingRegKey(normalized)));
  } else {
    pending = pendingRegistrations.get(normalized) ?? null;
  }

  if (!pending) return null;

  // Defense-in-depth: TTL handles expiry, but verify manually as a fallback
  if (Date.now() - pending.registeredAt > PENDING_REG_TTL_SECONDS * 1000) {
    if (redis) await redis.del(pendingRegKey(normalized));
    else pendingRegistrations.delete(normalized);
    return null;
  }

  return {
    fullName:    pending.fullName,
    password:    pending.password,
    phoneNumber: pending.phoneNumber,
  };
};

export const clearPendingRegistration = async (email: string): Promise<void> => {
  requireRedisInProduction();
  const normalized = email.toLowerCase();
  const redis = getRedisClient();
  if (redis) await redis.del(pendingRegKey(normalized));
  else pendingRegistrations.delete(normalized);
};
