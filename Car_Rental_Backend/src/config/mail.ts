/**
 * config/mail.ts
 *
 * Single place for all outbound email.
 * Uses Resend (https://resend.com) — no SMTP config needed, just an API key.
 *
 * Without a verified domain: use RESEND_FROM=onboarding@resend.dev
 *   → only delivers to your own Resend account email (dev/testing only).
 * With a verified domain:    use RESEND_FROM=noreply@yourdomain.com
 *   → delivers to anyone (production).
 *
 * Usage:
 *   import { sendEmail } from '../config/mail';
 *   await sendEmail({ to: 'user@example.com', subject: 'OTP', html: '<p>123456</p>' });
 */

import { Resend } from 'resend';
import { env } from './env';
import logger from './logger';

// ─── Client ──────────────────────────────────────────────────────────────────

let resend: Resend | null = null;

if (env.resendApiKey) {
  resend = new Resend(env.resendApiKey);
  logger.info('Mail: Resend client initialised', { from: env.resendFrom });
} else {
  logger.warn('Mail: RESEND_API_KEY not set — emails will be logged to console in dev, silently skipped in prod');
}

export const isMailConfigured = (): boolean => !!resend;

// ─── Send helper ─────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  if (!resend) {
    if (env.nodeEnv === 'development') {
      logger.debug('Mail (dev fallback — no Resend key): email not sent', {
        to: options.to,
        subject: options.subject,
      });
    }
    return;
  }

  const { error } = await resend.emails.send({
    from: env.resendFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.replyTo ? { reply_to: options.replyTo } : {}),
  });

  if (error) {
    logger.error('Mail: failed to send email', { to: options.to, subject: options.subject, error });
    throw new Error(`Email send failed: ${error.message}`);
  }
};

