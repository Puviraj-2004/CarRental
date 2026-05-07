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
  required: boolean;        // true = always required, crashes if missing
  requiredInProd?: boolean; // true = required only in production, crashes if missing
  warnIfMissing?: boolean;  // true = print a warning but never crash (opt-in noise)
  description: string;
}

const rules: EnvRule[] = [
  // ── Always required — crash if missing ───────────────────
  { key: 'DATABASE_URL', required: true,  description: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET',   required: true,  description: 'JWT signing secret (min 32 chars)' },

  // ── Required in production — crash if missing ────────────
  { key: 'FRONTEND_URL', required: false, requiredInProd: true, description: 'Frontend origin for CORS' },
  { key: 'EMAIL_USER',   required: false, requiredInProd: true, description: 'SMTP sender email' },
  { key: 'EMAIL_PASS',   required: false, requiredInProd: true, description: 'SMTP sender password' },

  // ── Redis — crash in production if neither is set ────────
  // Checked separately below; individual keys are silent when absent
  { key: 'REDIS_URL',  required: false, description: 'Redis connection URL (alternative to REDIS_HOST)' },
  { key: 'REDIS_HOST', required: false, description: 'Redis host (alternative to REDIS_URL)' },

  // ── Truly optional — warn only in development ────────────
  // In production these are silently absent when the feature is disabled.
  // They produce no output unless NODE_ENV !== 'production'.
  { key: 'GEMINI_API_KEY',        required: false, warnIfMissing: true, description: 'Google Gemini API key (OCR disabled if absent)' },
  { key: 'GOOGLE_CLIENT_ID',      required: false, warnIfMissing: true, description: 'Google OAuth client ID (Google login disabled if absent)' },
  { key: 'STRIPE_SECRET_KEY',     required: false, warnIfMissing: true, description: 'Stripe secret key (payments disabled if absent)' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, warnIfMissing: true, description: 'Stripe webhook secret (webhook disabled if absent)' },
  { key: 'CLOUDINARY_CLOUD_NAME', required: false, warnIfMissing: true, description: 'Cloudinary cloud name (image uploads disabled if absent)' },
  { key: 'CLOUDINARY_API_KEY',    required: false, warnIfMissing: true, description: 'Cloudinary API key (image uploads disabled if absent)' },
  { key: 'CLOUDINARY_API_SECRET', required: false, warnIfMissing: true, description: 'Cloudinary API secret (image uploads disabled if absent)' },
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
      // Only warn about optional features in development.
      // In production, intentionally-disabled features produce no log noise.
      warnings.push(`  ⚠ ${rule.key} — ${rule.description}`);
    }
  }

  // Special: In production, at least one Redis config must be present
  if (isProduction) {
    const hasRedis =
      (process.env.REDIS_URL || '').trim() ||
      (process.env.REDIS_HOST || '').trim();
    if (!hasRedis) {
      errors.push(
        '  ✖ REDIS_URL or REDIS_HOST — Redis is required in production for OTP, CSRF, and rate limiting',
      );
    }
  }

  // Special: JWT_SECRET minimum length
  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('  ✖ JWT_SECRET — Must be at least 32 characters for security');
  }

  // Print warnings — dev only, non-fatal
  if (warnings.length > 0) {
    console.warn('┌─────────────────────────────────────────────┐');
    console.warn('│  ENV WARNINGS — optional features not set   │');
    console.warn('└─────────────────────────────────────────────┘');
    warnings.forEach((w) => console.warn(w));
    console.warn('');
  }

  // Print errors and crash — all environments
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