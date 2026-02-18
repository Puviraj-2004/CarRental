/**
 * Environment Variable Validation
 * Runs at startup — crashes the process if critical vars are missing.
 * Must be imported AFTER dotenv.config() but BEFORE any other module.
 *
 * NOTE: This module uses console.warn/error intentionally because it runs
 * BEFORE the Winston logger is initialised (logger depends on env being valid).
 */

interface EnvRule {
  key: string;
  required: boolean;          // true = always required
  requiredInProd?: boolean;   // true = required only in production
  description: string;
}

const rules: EnvRule[] = [
  // ── Always required ──────────────────────────────────────
  { key: 'DATABASE_URL',       required: true,  description: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET',         required: true,  description: 'JWT signing secret (min 32 chars)' },

  // ── Required in production ───────────────────────────────
  { key: 'FRONTEND_URL',      required: false, requiredInProd: true, description: 'Frontend origin for CORS' },
  { key: 'EMAIL_USER',        required: false, requiredInProd: true, description: 'SMTP sender email' },
  { key: 'EMAIL_PASS',        required: false, requiredInProd: true, description: 'SMTP sender password' },

  // ── Redis (required in production for OTP/CSRF/rate-limiting) ─
  // At least REDIS_URL or REDIS_HOST must be set in production
  { key: 'REDIS_URL',         required: false, description: 'Redis connection URL (alternative to REDIS_HOST)' },
  { key: 'REDIS_HOST',        required: false, description: 'Redis host (alternative to REDIS_URL)' },

  // ── Optional (gracefully degrade) ────────────────────────
  { key: 'GEMINI_API_KEY',        required: false, description: 'Google Gemini API key for OCR' },
  { key: 'GOOGLE_CLIENT_ID',      required: false, description: 'Google OAuth client ID' },
  { key: 'STRIPE_SECRET_KEY',     required: false, description: 'Stripe secret key' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret' },
  { key: 'CLOUDINARY_CLOUD_NAME', required: false, description: 'Cloudinary cloud name' },
  { key: 'CLOUDINARY_API_KEY',    required: false, description: 'Cloudinary API key' },
  { key: 'CLOUDINARY_API_SECRET', required: false, description: 'Cloudinary API secret' },
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
    } else if (isMissing) {
      warnings.push(`  ⚠ ${rule.key} — ${rule.description} (not set, feature may be disabled)`);
    }
  }

  // Special: In production, at least one Redis config must be present
  if (isProduction) {
    const hasRedis = (process.env.REDIS_URL || '').trim() || (process.env.REDIS_HOST || '').trim();
    if (!hasRedis) {
      errors.push('  ✖ REDIS_URL or REDIS_HOST — Redis is required in production for OTP, CSRF, and rate limiting');
    }
  }

  // Special: JWT_SECRET minimum length check
  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('  ✖ JWT_SECRET — Must be at least 32 characters for security');
  }

  // Print warnings (non-fatal)
  if (warnings.length > 0) {
    console.warn('┌─────────────────────────────────────────────┐');
    console.warn('│  ENV WARNINGS (non-fatal)                   │');
    console.warn('└─────────────────────────────────────────────┘');
    warnings.forEach((w) => console.warn(w));
    console.warn('');
  }

  // Print errors and crash
  if (errors.length > 0) {
    console.error('┌─────────────────────────────────────────────┐');
    console.error('│  FATAL: Missing required environment vars   │');
    console.error('└─────────────────────────────────────────────┘');
    errors.forEach((e) => console.error(e));
    console.error('');
    console.error('Copy .env.example to .env and fill in the required values.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}
