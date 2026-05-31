interface EnvRule {
  key: string;
  required: boolean;
  requiredInProd?: boolean;
  warnIfMissing?: boolean;
  description: string;
}

const rules: EnvRule[] = [
  { key: 'DATABASE_URL',    required: true, description: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET',      required: true, description: 'JWT signing secret (min 32 chars)' },
  { key: 'SEED_ADMIN_EMAIL',    required: true, description: 'Admin email for seeding' },
  { key: 'SEED_ADMIN_PASSWORD', required: true, description: 'Admin password for seeding' },

  { key: 'COMPANY_NAME',    required: true, description: 'Company display name' },
  { key: 'COMPANY_EMAIL',   required: true, description: 'Company contact email' },

  { key: 'FRONTEND_URL', required: false, requiredInProd: true, description: 'Frontend origin for CORS' },
  { key: 'RESEND_API_KEY', required: false, requiredInProd: true, description: 'Resend API key for transactional email' },

  { key: 'REDIS_URL',  required: false, description: 'Redis connection URL (alternative to REDIS_HOST)' },
  { key: 'REDIS_HOST', required: false, description: 'Redis host (alternative to REDIS_URL)' },

  { key: 'GEMINI_API_KEY',        required: false, warnIfMissing: true, description: 'Google Gemini API key (OCR disabled if absent)' },
  { key: 'GOOGLE_CLIENT_ID',      required: false, warnIfMissing: true, description: 'Google OAuth client ID (Google login disabled if absent)' },
  { key: 'STRIPE_SECRET_KEY',     required: false, warnIfMissing: true, description: 'Stripe secret key (payments disabled if absent)' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, warnIfMissing: true, description: 'Stripe webhook secret (webhook disabled if absent)' },
  { key: 'CLOUDINARY_URL', required: false, warnIfMissing: true, description: 'Cloudinary URL (uploads disabled if absent)' },
];

export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const value = (process.env[rule.key] || '').trim();
    const isMissing = !value;

    if (rule.required && isMissing) {
      errors.push(`  ✖ ${rule.key} — ${rule.description}`);
    } else if (rule.requiredInProd && isProduction && isMissing) {
      errors.push(`  ✖ ${rule.key} — ${rule.description} (required in production)`);
    } else if (rule.warnIfMissing && !isProduction && isMissing) {
      warnings.push(`  ⚠ ${rule.key} — ${rule.description}`);
    }
  }

  if (isProduction) {
    const hasRedis =
      (process.env.REDIS_URL || '').trim() ||
      (process.env.REDIS_HOST || '').trim();
    if (!hasRedis) {
      errors.push('  ✖ REDIS_URL or REDIS_HOST — required in production for rate limiting and CSRF');
    }
  }

  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('  ✖ JWT_SECRET — must be at least 32 characters');
  }

  if (warnings.length > 0) {
    console.warn('┌─────────────────────────────────────────────┐');
    console.warn('│  ENV WARNINGS — optional features not set   │');
    console.warn('└─────────────────────────────────────────────┘');
    warnings.forEach((w) => console.warn(w));
    console.warn('');
  }

  if (errors.length > 0) {
    console.error('┌─────────────────────────────────────────────┐');
    console.error('│  FATAL: Missing required environment vars   │');
    console.error('└─────────────────────────────────────────────┘');
    errors.forEach((e) => console.error(e));
    console.error('');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

export const env = {
  nodeEnv:     (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  port:        parseInt(process.env.PORT || '4000', 10),
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').trim(),
  backendUrl:  (process.env.BACKEND_URL  || 'http://localhost:4000').trim(),
  logLevel:    process.env.LOG_LEVEL || 'debug',

  appTimezone: (process.env.APP_TIMEZONE || 'Europe/Paris').trim(),
  appLocale:   (process.env.APP_LOCALE   || 'fr-FR').trim(),
  appCurrency: (process.env.APP_CURRENCY || 'EUR').trim(),

  companyName:    (process.env.COMPANY_NAME    || '').trim(),
  companyEmail:   (process.env.COMPANY_EMAIL   || '').trim(),

  databaseUrl: process.env.DATABASE_URL || '',
  seedAdminEmail:    (process.env.SEED_ADMIN_EMAIL    || '').trim(),
  seedAdminPassword: (process.env.SEED_ADMIN_PASSWORD || '').trim(),

  jwtSecret: (process.env.JWT_SECRET || '').trim(),

  redisUrl:      (process.env.REDIS_URL      || '').trim(),
  redisHost:     (process.env.REDIS_HOST     || '').trim(),
  redisPort:     parseInt(process.env.REDIS_PORT     || '6379', 10),
  redisPassword: (process.env.REDIS_PASSWORD || '').trim(),

  cloudinaryCloudName: (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/"/g, '').trim(),
  cloudinaryApiKey:    (process.env.CLOUDINARY_API_KEY    || '').replace(/"/g, '').trim(),
  cloudinaryApiSecret: (process.env.CLOUDINARY_API_SECRET || '').replace(/"/g, '').trim(),
  cloudinaryUrl:       (process.env.CLOUDINARY_URL        || '').trim(),

  stripeSecretKey:     (process.env.STRIPE_SECRET_KEY     || '').trim(),
  stripeWebhookSecret: (process.env.STRIPE_WEBHOOK_SECRET || '').trim(),
  mockStripe:          (process.env.MOCK_STRIPE || '').toLowerCase() === 'true',

  googleClientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),

  resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
  resendFrom:   (process.env.RESEND_FROM || 'onboarding@resend.dev').trim(),

  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
    // Booking timing
  reservationHoldMinutes:         parseInt(process.env.RESERVATION_HOLD_MINUTES          || '60',   10),
  paymentExpiryHours:             parseInt(process.env.PAYMENT_EXPIRY_HOURS              || '24',   10),
  cancellationWindowHours:        parseInt(process.env.CANCELLATION_WINDOW_HOURS         || '24',   10),

  // Refund policy
  fullRefundMinHours:             parseInt(process.env.FULL_REFUND_MIN_HOURS             || '72',   10),
  partialRefundMinHours:          parseInt(process.env.PARTIAL_REFUND_MIN_HOURS          || '24',   10),
  partialRefundPct:               parseFloat(process.env.PARTIAL_REFUND_PCT              || '0.80'),

} as const;

export type Env = typeof env;
