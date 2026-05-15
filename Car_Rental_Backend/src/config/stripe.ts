import Stripe from 'stripe';
import { env } from './env';
import logger from './logger';

// ─── Singleton Stripe client ──────────────────────────────────────────────────
// In mock mode (MOCK_STRIPE=true) the client is null — payment service must
// handle that case and return a fake successful response.

let stripe: Stripe | null = null;

if (!env.mockStripe) {
  if (env.stripeSecretKey) {
    stripe = new Stripe(env.stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
    logger.info('Stripe: client initialised');
  } else {
    logger.warn('Stripe: STRIPE_SECRET_KEY not set — payments will be disabled');
  }
} else {
  logger.info('Stripe: running in MOCK mode — no real charges will be made');
}

export const getStripeClient = (): Stripe | null => stripe;

export const isStripeConfigured = (): boolean => !env.mockStripe && !!stripe;

export { env as stripeEnv };
