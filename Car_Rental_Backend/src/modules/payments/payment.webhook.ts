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

  // Store the PaymentIntent ID (pi_...) for future capture/refund operations
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? session.id;

  const rawMethod = session.payment_method_types?.[0] || 'card';

  const paymentMethod = await prisma.paymentMethod.upsert({
    where: { name: rawMethod },
    update: {},
    create: { name: rawMethod },
  });

  // Verify booking is still in a valid state before updating
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });

  if (!booking || booking.status === 'CANCELLED' || booking.status === 'REJECTED' || booking.status === 'EXPIRED') {
    securityLogger.warn('Webhook received for booking in terminal state, skipping', {
      bookingId,
      currentStatus: booking?.status,
    });
    return;
  }

  // Immediate capture — payment is complete, mark as PAID and confirm booking
  await prisma.payment.upsert({
    where: { bookingId },
    update: {
      status: 'PAID',
      stripeId: paymentIntentId,
      paymentMethodId: paymentMethod.id,
    },
    create: {
      bookingId,
      amount: (session.amount_total ?? 0) / 100,
      status: 'PAID',
      stripeId: paymentIntentId,
      paymentMethodId: paymentMethod.id,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
  });

  securityLogger.info('Payment captured and booking confirmed', { bookingId, paymentIntentId });
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

    // Only transition to CANCELLED if booking is in a cancellable state
    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      select: { status: true },
    });

    const cancellableOnRefund = ['RESERVED', 'CONFIRMED', 'ONGOING'];
    if (booking && cancellableOnRefund.includes(booking.status)) {
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
      securityLogger.info('Refund processed but booking status unchanged (already in terminal state)', {
        bookingId: payment.bookingId,
        currentStatus: booking?.status,
      });
    }
  } else {
    securityLogger.warn('Refund event: payment not found', { chargeId: charge.id });
  }
}