import Stripe from 'stripe';
import { env } from './env';
import logger from './logger';

let stripe: Stripe | null = null;

if (env.stripeSecretKey) {
  stripe = new Stripe(env.stripeSecretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
  logger.info('Stripe: client initialised');
} else {
  logger.warn('Stripe: STRIPE_SECRET_KEY not set - payments will be disabled');
}

export const getStripeClient = (): Stripe | null => stripe;

export const isStripeConfigured = (): boolean => !!stripe;

export { env as stripeEnv };
