import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { getRedisClient, isRedisConfigured } from './redisClient';
import { AppError, ErrorCode } from '../errors/AppError';

interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = (() => {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret) {
    throw new AppError('JWT_SECRET is required', ErrorCode.CONFIGURATION_ERROR);
  }
  return secret;
})();

const isProduction = process.env.NODE_ENV === 'production';

type OTPRecord = { code: string; expiresAt: number; attemptsLeft: number };
type PendingRegistrationRecord = { fullName: string; password: string; phoneNumber?: string; registeredAt: number };

// Fallback stores (development ONLY - not used in production)
const otpStore: Map<string, OTPRecord> = new Map();
const pendingRegistrations: Map<string, PendingRegistrationRecord> = new Map();

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes as per requirement
const PENDING_REG_TTL_SECONDS = 15 * 60;

const otpKey = (email: string) => `otp:${email.toLowerCase()}`;
const pendingRegKey = (email: string) => `pending_reg:${email.toLowerCase()}`;

// Helper: Ensure Redis is available in production
const requireRedisInProduction = (): void => {
  if (isProduction && !isRedisConfigured()) {
    throw new AppError('Redis is required for OTP storage in production', ErrorCode.INTERNAL_SERVER_ERROR);
  }
};

const safeJsonParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

// 1. Generate JWT Token
export const generateToken = (userId: string, role: string = 'USER'): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// 2. Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new AppError('Invalid or Expired Token', ErrorCode.UNAUTHENTICATED);
  }
};

// 3. Hash Password (Secure)
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 4. Compare Password (Login)
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// 5. Generate OTP (6-digit)
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 6. Store OTP with expiration (5 minutes)
export const storeOTP = async (email: string, otp: string): Promise<{ expiresAt: string }> => {
  requireRedisInProduction();
  
  const normalizedEmail = email.toLowerCase();
  const expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;
  const record: OTPRecord = { code: otp, expiresAt, attemptsLeft: 5 };

  const redis = getRedisClient();
  if (redis) {
    await redis.set(otpKey(normalizedEmail), JSON.stringify(record), 'EX', OTP_TTL_SECONDS);
  } else if (!isProduction) {
    // Development fallback only
    otpStore.set(normalizedEmail, record);
  }

  return { expiresAt: new Date(expiresAt).toISOString() };
};

// 7. Verify OTP
export const verifyOTPCode = async (email: string, otp: string): Promise<{ valid: boolean; message: string }> => {
  requireRedisInProduction();
  
  const normalizedEmail = email.toLowerCase();
  const redis = getRedisClient();

  let stored: OTPRecord | null = null;
  if (redis) {
    stored = safeJsonParse<OTPRecord>(await redis.get(otpKey(normalizedEmail)));
  } else if (!isProduction) {
    stored = otpStore.get(normalizedEmail) || null;
  }

  if (!stored) {
    throw new AppError('Invalid or expired OTP', ErrorCode.BAD_USER_INPUT);
  }

  if (stored.expiresAt < Date.now()) {
    if (redis) await redis.del(otpKey(normalizedEmail));
    else if (!isProduction) otpStore.delete(normalizedEmail);
    throw new AppError('Invalid or expired OTP', ErrorCode.BAD_USER_INPUT);
  }

  if (stored.attemptsLeft <= 0) {
    if (redis) await redis.del(otpKey(normalizedEmail));
    else if (!isProduction) otpStore.delete(normalizedEmail);
    throw new AppError('Too many failed attempts. Please request a new OTP.', ErrorCode.BAD_USER_INPUT);
  }

  if (stored.code !== otp) {
    const next: OTPRecord = { ...stored, attemptsLeft: stored.attemptsLeft - 1 };
    const remainingSeconds = Math.max(1, Math.ceil((next.expiresAt - Date.now()) / 1000));
    if (redis) {
      await redis.set(otpKey(normalizedEmail), JSON.stringify(next), 'EX', remainingSeconds);
    } else if (!isProduction) {
      otpStore.set(normalizedEmail, next);
    }
    throw new AppError(`Invalid OTP. ${next.attemptsLeft} attempts remaining.`, ErrorCode.BAD_USER_INPUT);
  }

  // OTP is valid - delete from Redis to prevent reuse
  if (redis) await redis.del(otpKey(normalizedEmail));
  else if (!isProduction) otpStore.delete(normalizedEmail);
  return { valid: true, message: 'OTP verified successfully.' };
};

// 8. Clear OTP
export const clearOTP = async (email: string): Promise<void> => {
  requireRedisInProduction();
  
  const normalizedEmail = email.toLowerCase();
  const redis = getRedisClient();
  if (redis) {
    await redis.del(otpKey(normalizedEmail));
  } else if (!isProduction) {
    otpStore.delete(normalizedEmail);
  }
};

// 9. Store pending registration (valid until OTP expires)
export const storePendingRegistration = async (email: string, fullName: string, hashedPassword: string, phoneNumber?: string): Promise<void> => {
  requireRedisInProduction();
  
  const normalizedEmail = email.toLowerCase();
  const record: PendingRegistrationRecord = {
    fullName,
    password: hashedPassword,
    phoneNumber,
    registeredAt: Date.now(),
  };

  const redis = getRedisClient();
  if (redis) {
    await redis.set(pendingRegKey(normalizedEmail), JSON.stringify(record), 'EX', PENDING_REG_TTL_SECONDS);
  } else if (!isProduction) {
    pendingRegistrations.set(normalizedEmail, record);
  }
};

// 10. Get pending registration (and validate it hasn't expired)
export const getPendingRegistration = async (email: string): Promise<{ fullName: string; password: string; phoneNumber?: string } | null> => {
  requireRedisInProduction();
  
  const normalizedEmail = email.toLowerCase();
  const redis = getRedisClient();

  let pending: PendingRegistrationRecord | null = null;
  if (redis) {
    pending = safeJsonParse<PendingRegistrationRecord>(await redis.get(pendingRegKey(normalizedEmail)));
  } else if (!isProduction) {
    pending = pendingRegistrations.get(normalizedEmail) || null;
  }

  if (!pending) return null;

  // Safety check (TTL should handle this, but keep as defense-in-depth)
  if (Date.now() - pending.registeredAt > PENDING_REG_TTL_SECONDS * 1000) {
    if (redis) await redis.del(pendingRegKey(normalizedEmail));
    else if (!isProduction) pendingRegistrations.delete(normalizedEmail);
    return null;
  }

  return {
    fullName: pending.fullName,
    password: pending.password,
    phoneNumber: pending.phoneNumber,
  };
};

// 11. Clear pending registration
export const clearPendingRegistration = async (email: string): Promise<void> => {
  requireRedisInProduction();
  
  const normalizedEmail = email.toLowerCase();
  const redis = getRedisClient();
  if (redis) {
    await redis.del(pendingRegKey(normalizedEmail));
  } else if (!isProduction) {
    pendingRegistrations.delete(normalizedEmail);
  }
};