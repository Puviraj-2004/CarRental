import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from './env';

const LOG_DIR = path.join(process.cwd(), 'logs');
const isDev = env.nodeEnv !== 'production';
const LOG_LEVEL = env.logLevel || (isDev ? 'debug' : 'info');

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

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

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isDev ? devFormat : jsonFormat,
  }),
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
    format: jsonFormat,
  }),
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
];

const securityTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  zippedArchive: true,
  format: jsonFormat,
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'car-rental-api' },
  transports,
  exitOnError: false,
});

const securityChild = logger.child({ service: 'security' });
securityChild.add(securityTransport);

export const securityLogger = {
  info:  (message: string, data?: Record<string, unknown>) => securityChild.info(message, data),
  warn:  (message: string, data?: Record<string, unknown>) => securityChild.warn(message, data),
  error: (message: string, data?: Record<string, unknown>) => securityChild.error(message, data),
};

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
  suspiciousActivity: (data: { type: string; ip: string; details: unknown }) => {
    securityChild.warn('Suspicious activity detected', { event: 'SUSPICIOUS_ACTIVITY', ...data });
  },
  adminAction: (data: { action: string; adminId: string; targetId?: string; ip?: string }) => {
    securityChild.info('Admin action performed', { event: 'ADMIN_ACTION', ...data });
  },
};

export default logger;
