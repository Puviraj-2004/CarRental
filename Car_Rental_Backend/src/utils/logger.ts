/**
 * Structured Logger — Winston-based, production-grade logging.
 *
 * Features:
 *   • JSON structured output in production (machine-parseable)
 *   • Colourised human-readable output in development
 *   • Daily-rotated file transport with automatic compression & retention
 *   • Separate error log file for quick triage
 *   • Child loggers via logger.child({ service: 'payment' })
 *   • Drop-in replacement for the old SecurityLogger API
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// ─── Configuration ───────────────────────────────────────────────────────────

const LOG_DIR = path.join(process.cwd(), 'logs');
const isDev = (process.env.NODE_ENV || 'development') !== 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

// ─── Formats ─────────────────────────────────────────────────────────────────

/** JSON format used for file transports & production console */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/** Pretty format for development console */
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, event, ...rest }) => {
    const svc = service ? `[${service}]` : '';
    const evt = event ? `(${event})` : '';
    const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    return `${timestamp} ${level} ${svc}${evt} ${message}${extra}`;
  }),
);

// ─── Transports ──────────────────────────────────────────────────────────────

const transports: winston.transport[] = [];

// Console — always active
transports.push(
  new winston.transports.Console({
    format: isDev ? devFormat : jsonFormat,
  }),
);

// Combined daily-rotated file (all levels)
transports.push(
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
    format: jsonFormat,
  }),
);

// Error-only daily-rotated file
transports.push(
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '60d',
    zippedArchive: true,
    level: 'error',
    format: jsonFormat,
  }),
);

// Security-specific daily-rotated file (written by the security child logger)
const securityTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  zippedArchive: true,
  format: jsonFormat,
});

// ─── Root Logger ─────────────────────────────────────────────────────────────

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'car-rental-api' },
  transports,
  // Prevent Winston from crashing the process on transport errors
  exitOnError: false,
});

// ─── Child Loggers ───────────────────────────────────────────────────────────

/** Security child — logs to the extra security file as well */
const securityChild = logger.child({ service: 'security' });
securityChild.add(securityTransport);

// ─── Backwards-compatible securityLogger facade ──────────────────────────────
// All existing `securityLogger.info/warn/error(msg, data)` calls work unchanged.

export const securityLogger = {
  info: (message: string, data?: Record<string, any>) => {
    securityChild.info(message, data);
  },
  warn: (message: string, data?: Record<string, any>) => {
    securityChild.warn(message, data);
  },
  error: (message: string, data?: Record<string, any>) => {
    securityChild.error(message, data);
  },
};

// ─── Backwards-compatible logSecurityEvent facade ────────────────────────────

export const logSecurityEvent = {
  loginSuccess: (data: { userId: string; email: string; ip?: string; userAgent?: string }) => {
    securityChild.info('User login successful', { event: 'LOGIN_SUCCESS', ...data });
  },
  loginFailure: (data: { email: string; attemptCount: number; ip?: string; userAgent?: string }) => {
    securityChild.warn('Login attempt failed', { event: 'LOGIN_FAILURE', ...data });
  },
  accountLocked: (data: { email: string; ip?: string; lockoutDuration: number }) => {
    securityChild.warn('Account locked due to failed attempts', { event: 'ACCOUNT_LOCKED', ...data });
  },
  registrationSuccess: (data: { userId: string; email: string; ip?: string }) => {
    securityChild.info('User registration successful', { event: 'REGISTRATION_SUCCESS', ...data });
  },
  registrationFailure: (data: { email?: string; reason: string; ip?: string }) => {
    securityChild.warn('User registration failed', { event: 'REGISTRATION_FAILURE', ...data });
  },
  rateLimitExceeded: (data: { endpoint: string; ip: string; userAgent?: string; limit: number; windowMs: number }) => {
    securityChild.warn('Rate limit exceeded', { event: 'RATE_LIMIT_EXCEEDED', ...data });
  },
  suspiciousActivity: (data: { type: string; ip: string; details: any }) => {
    securityChild.warn('Suspicious activity detected', { event: 'SUSPICIOUS_ACTIVITY', ...data });
  },
  adminAction: (data: { action: string; adminId: string; targetId?: string; ip?: string }) => {
    securityChild.info('Admin action performed', { event: 'ADMIN_ACTION', ...data });
  },
};

// ─── Default export ──────────────────────────────────────────────────────────

export default logger;
