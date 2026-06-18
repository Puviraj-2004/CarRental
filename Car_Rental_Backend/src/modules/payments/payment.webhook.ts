import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { getStripeClient } from '../../config/stripe';
import { env } from '../../config/env';
import { securityLogger } from '../../config/logger';

export async function handleStripeWebhook(req: Request, res: Response, prisma: PrismaClient): Promise<void> {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).json({ error: 'Missing Stripe signature' });
    return;
  }

  const stripe = getStripeClient();
  if (!stripe || !env.stripeWebhookSecret) {
    securityLogger.error('Stripe webhook called but Stripe not configured');
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.stripeWebhookSecret);
  } catch (err) {
    securityLogger.error('Webhook signature verification failed', { error: err });
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  securityLogger.info('Webhook event received', { type: event.type });

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, prisma);
      break;
    case 'charge.refunded':
    case 'charge.refund.updated':
      await handleChargeRefunded(event.data.object as Stripe.Charge, prisma);
      break;
    default:
      securityLogger.info(`Unhandled webhook event type: ${event.type}`);
  }

  res.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, prisma: PrismaClient) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const paymentRef = session.payment_intent ?? session.id;
  const rawMethod = session.payment_method_types?.[0] || 'card';

  // Find or create the payment method
  const paymentMethod = await prisma.paymentMethod.upsert({
    where: { name: rawMethod },
    update: {},
    create: { name: rawMethod },
  });

  // Updated: Strictly uses Unchecked scalar properties (paymentMethodId) to prevent schema conflicts [1]
  await prisma.payment.upsert({
    where: { bookingId },
    update: { 
      status: 'PAID', 
      stripeId: String(paymentRef),
      paymentMethodId: paymentMethod.id // <-- Uses raw scalar foreign key [1]
    },
    create: {
      bookingId, 
      amount: (session.amount_total ?? 0) / 100,
      status: 'PAID',
      stripeId: String(paymentRef),
      paymentMethodId: paymentMethod.id, // <-- Uses raw scalar foreign key [1]
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
  });

  securityLogger.info('Booking confirmed via webhook', { bookingId });
}

async function handleChargeRefunded(charge: Stripe.Charge, prisma: PrismaClient) {
  const bookingId = charge.metadata?.bookingId;
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

  let payment = bookingId ? await prisma.payment.findUnique({ where: { bookingId } }) : null;
  if (!payment && paymentIntentId) {
    payment = await prisma.payment.findFirst({ where: { stripeId: paymentIntentId } });
  }

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });
    try {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      });
      securityLogger.info('Booking cancelled for refund', { bookingId: payment.bookingId });
    } catch (err) {
      securityLogger.warn('Could not cancel booking on refund', { error: err });
    }
  } else {
    securityLogger.warn('Refund event: payment not found', { chargeId: charge.id });
  }
}