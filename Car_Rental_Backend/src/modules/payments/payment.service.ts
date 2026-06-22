import { BookingStatus, PaymentStatus } from '@prisma/client';

import { AppError, ErrorCode }    from '../../core/errors/AppError';
import { normalizePagination }    from '../../core/utils/pagination';
import type { PaginatedResult }   from '../../core/utils/pagination';
import { calculateRefund }        from '../../core/utils/refund';
import { env }                    from '../../config/env';
import { getStripeClient }        from '../../config/stripe';
import { securityLogger }         from '../../config/logger';
import { prisma }                 from '../../config/database';
import { paymentRepository }      from './payment.repository';
import type { PaymentWithMethod } from '../../prisma/types';

export class PaymentService {
  async getPaymentById(
    id:      string,
    userId:  string,
    isAdmin: boolean,
  ): Promise<PaymentWithMethod | null> {
    const payment = await paymentRepository.findById(id);
    if (!payment) return null;

    if (!isAdmin) {
      const booking = await prisma.booking.findUnique({
        where:  { id: payment.bookingId },
        select: { userId: true },
      });
      if (booking?.userId !== userId) {
        throw new AppError(
          'Access denied. You do not own this payment.',
          ErrorCode.FORBIDDEN,
        );
      }
    }

    return payment;
  }

  async getPaymentByBooking(
    bookingId: string,
    userId:    string,
    isAdmin:   boolean,
  ): Promise<PaymentWithMethod | null> {
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) return null;

    if (!isAdmin) {
      const booking = await prisma.booking.findUnique({
        where:  { id: bookingId },
        select: { userId: true },
      });
      if (booking?.userId !== userId) {
        throw new AppError(
          'Access denied. You do not own this booking.',
          ErrorCode.FORBIDDEN,
        );
      }
    }

    return payment;
  }

  getMyPayments(
    userId:      string,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<PaymentWithMethod>> {
    return paymentRepository.findPaginatedByUser(
      userId,
      normalizePagination(pagination),
    );
  }

  getAllPayments(
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<PaymentWithMethod>> {
    return paymentRepository.findPaginated(normalizePagination(pagination));
  }

  // ── Checkout: Configured for Manual Capture Hold [1.1.5, 1.2.1] ─────────────────
  async createCheckoutSession(
    bookingId: string,
    userId:    string,
    isAdmin:   boolean,
  ): Promise<{ url: string; sessionId: string }> {
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: {
        car:       { include: { model: { include: { brand: true } } } },
        user:      true,
        documents: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }
    if (!isAdmin && booking.userId !== userId) {
      throw new AppError(
        'Access denied. You do not own this booking.',
        ErrorCode.FORBIDDEN,
      );
    }
    if (booking.status !== BookingStatus.RESERVED) {
      throw new AppError(
        `Cannot create a payment for a booking with status "${booking.status}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const existing = await paymentRepository.findByBookingId(bookingId);
    if (existing?.status === PaymentStatus.PAID) {
      throw new AppError(
        'This booking has already been paid.',
        ErrorCode.ALREADY_EXISTS,
      );
    }

    if (!isAdmin) {
      if (!booking.documents) { 
        throw new AppError(
          'Please attach identity documents to this booking before proceeding to payment.',
          ErrorCode.BAD_USER_INPUT,
        );
      }
    }

    const totalPrice = Number(booking.totalPrice);
    const carLabel   = `${booking.car.model.brand.name} ${booking.car.model.name}`;

    // Mock Hold setup [1.1.5]
    if (env.mockStripe) {
      securityLogger.info('Mock Stripe: placing authorization hold', { bookingId });
      
      await paymentRepository.upsertByBookingId(bookingId, {
        amount:   totalPrice,
        status:   PaymentStatus.PENDING,
        stripeId: `mock_session_${bookingId}`,
      });
      
      return {
        url:       `${env.frontendUrl}/payment/mock?bookingId=${bookingId}`,
        sessionId: `mock_session_${bookingId}`,
      };
    }

    const stripe = getStripeClient();
    if (!stripe) {
      throw new AppError(
        'Payment service is not configured.',
        ErrorCode.CONFIGURATION_ERROR,
      );
    }

    // Configures checkout session to authorization-hold mode [1.1.5, 1.2.1]
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       booking.user?.email ?? undefined,
      payment_intent_data: {
        capture_method: 'manual', // <-- Holds money without debiting [1.1.5, 1.2.1]
        metadata:       { bookingId },
      },
      line_items: [
        {
          price_data: {
            currency:     env.appCurrency.toLowerCase(),
            unit_amount:  Math.round(totalPrice * 100),
            product_data: {
              name:        `Car rental — ${carLabel}`,
              description: `${booking.numberOfDays} day(s) · ${booking.startDate.toLocaleDateString('fr-FR')} → ${booking.endDate.toLocaleDateString('fr-FR')}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata:    { bookingId },
      success_url: `${env.frontendUrl}/booking/${bookingId}/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${env.frontendUrl}/booking/${bookingId}/cancel?bookingId=${bookingId}`,
    });

    if (!session.url) {
      throw new AppError(
        'Failed to create Stripe checkout session.',
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
    }

    await paymentRepository.upsertByBookingId(bookingId, {
      amount:   totalPrice,
      status:   PaymentStatus.PENDING,
      stripeId: session.id,
    });

    securityLogger.info('Stripe checkout authorization session created', {
      bookingId,
      sessionId: session.id,
    });

    return { url: session.url, sessionId: session.id };
  }

  // ── Mock Finalize: Updated to match real auth hold sequence [1.1.5] ──────
  async mockFinalizePayment(bookingId: string, success: boolean) {
    if (!env.mockStripe) {
      throw new AppError('Mock payment is only allowed in development.', ErrorCode.BAD_USER_INPUT);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }

    // Hold state remains PENDING capture [1.1.5]
    const status = success ? PaymentStatus.PENDING : PaymentStatus.FAILED;

    const payment = await paymentRepository.upsertByBookingId(bookingId, {
      amount: Number(booking.totalPrice),
      status,
      stripeId: `mock_charge_success_${bookingId}`
    });

    if (success) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.RESERVED } // Still reserved until admin reviews [1.1.5]
      });
      securityLogger.info('Mock hold authorized: waiting for verification', { bookingId });
    }

    return payment;
  }

  // ── Capture Payment: Executes capture once admin approves booking [1.1.2, 1.1.5] ──
  async capturePayment(bookingId: string): Promise<PaymentWithMethod> {
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) {
      throw new AppError('No payment record found for this booking.', ErrorCode.NOT_FOUND);
    }

    if (payment.status === PaymentStatus.PAID) {
      return payment; // Already captured
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError(`Cannot capture payment with status "${payment.status}".`, ErrorCode.BAD_USER_INPUT);
    }

    const stripeId = payment.stripeId;
    if (!stripeId) {
      throw new AppError('No Stripe transaction ID found.', ErrorCode.BAD_USER_INPUT);
    }

    if (env.mockStripe) {
      securityLogger.info('Mock Stripe: capturing payment hold', { bookingId });
      return paymentRepository.update(payment.id, { status: PaymentStatus.PAID });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      throw new AppError('Payment service is not configured.', ErrorCode.CONFIGURATION_ERROR);
    }

    // Officially debits funds [1.1.5]
    await stripe.paymentIntents.capture(stripeId);
    securityLogger.info('Stripe payment hold captured successfully', { bookingId, stripeId });

    return paymentRepository.update(payment.id, { status: PaymentStatus.PAID });
  }

  // ── Cancel/Void Hold: Instantly releases hold if not captured yet [1.1.2, 1.1.5, 1.1.6] ──
  async cancelOrVoidPayment(bookingId: string): Promise<PaymentWithMethod | null> {
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) return null;

    if (payment.status === PaymentStatus.PENDING) {
      const stripeId = payment.stripeId;
      if (!stripeId) return null;

      if (env.mockStripe) {
        securityLogger.info('Mock Stripe: voiding authorization hold', { bookingId });
        return paymentRepository.update(payment.id, { status: PaymentStatus.FAILED });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        throw new AppError('Payment service is not configured.', ErrorCode.CONFIGURATION_ERROR);
      }

      await stripe.paymentIntents.cancel(stripeId);
      securityLogger.info('Stripe authorization hold voided successfully', { bookingId, stripeId });

      return paymentRepository.update(payment.id, { status: PaymentStatus.FAILED });
    }

    if (payment.status === PaymentStatus.PAID) {
      return this.refundForRejection(bookingId);
    }

    return payment;
  }

  // ── User Cancellation: Automatically handles hold releasing vs date-based refunds [1.1.2, 1.1.6] ──
  async cancelAndRefund(
    bookingId: string,
    userId:    string,
    isAdmin:   boolean,
  ): Promise<PaymentWithMethod | null> {
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) return null;

    // SCENARIO A: Release pre-auth hold instantly at 0 cost [1.1.5, 1.1.6]
    if (payment.status === PaymentStatus.PENDING) {
      const stripeId = payment.stripeId;
      if (!stripeId) return null;

      if (env.mockStripe) {
        securityLogger.info('Mock Stripe: voiding user hold on cancellation', { bookingId });
        return paymentRepository.update(payment.id, { status: PaymentStatus.FAILED });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        throw new AppError('Payment service is not configured.', ErrorCode.CONFIGURATION_ERROR);
      }

      await stripe.paymentIntents.cancel(stripeId);
      securityLogger.info('Stripe hold voided instantly for user cancellation', { bookingId, stripeId });

      return paymentRepository.update(payment.id, { status: PaymentStatus.FAILED });
    }

    // SCENARIO B: Apply date-proximity refund parameters on already captured funds [1.1.2]
    if (payment.status === PaymentStatus.PAID) {
      const booking = await prisma.booking.findUnique({
        where:  { id: bookingId },
        select: { startDate: true },
      });
      if (!booking) return null;

      const { policy, refundAmount } = calculateRefund(
        Number(payment.amount),
        booking.startDate,
      );

      securityLogger.info('Cancellation refund policy applied', {
        bookingId,
        policy,
        refundAmount,
        userId,
        isAdmin,
      });

      if (policy === 'NONE') {
        return paymentRepository.update(payment.id, {
          status: PaymentStatus.REFUNDED,
        });
      }

      if (env.mockStripe) {
        securityLogger.info('Mock Stripe: cancellation refund', {
          bookingId,
          policy,
          refundAmount,
          userId,
          isAdmin,
        });
        return paymentRepository.update(payment.id, {
          status: PaymentStatus.REFUNDED,
        });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        throw new AppError(
          'Payment service is not configured.',
          ErrorCode.CONFIGURATION_ERROR,
        );
      }

      let paymentIntentId = payment.stripeId ?? '';
      if (payment.stripeId?.startsWith('cs_')) {
        const session = await stripe.checkout.sessions.retrieve(
          payment.stripeId,
        );
        paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? '';
      }

      if (!paymentIntentId) {
        throw new AppError(
          'Could not resolve PaymentIntent for this payment.',
          ErrorCode.INTERNAL_SERVER_ERROR,
        );
      }

      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount:         Math.round(refundAmount * 100),
        metadata:       { bookingId, policy, initiatedBy: userId, isAdmin: String(isAdmin) },
      });

      securityLogger.info('Stripe cancellation refund issued', {
        bookingId,
        policy,
        refundAmount,
        paymentIntentId,
        userId,
      });

      return paymentRepository.update(payment.id, {
        status: PaymentStatus.REFUNDED,
      });
    }

    return payment;
  }

  async refundForRejection(bookingId: string): Promise<PaymentWithMethod | null> {
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment || payment.status !== PaymentStatus.PAID) return null;

    if (env.mockStripe) {
      securityLogger.info('Mock Stripe: rejection refund', { bookingId });
      return paymentRepository.update(payment.id, {
        status: PaymentStatus.REFUNDED,
      });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      throw new AppError(
        'Payment service is not configured.',
        ErrorCode.CONFIGURATION_ERROR,
      );
    }

    if (!payment.stripeId) {
      throw new AppError(
        'No Stripe payment ID found for this payment.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    let paymentIntentId = payment.stripeId;
    if (payment.stripeId.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(
        payment.stripeId,
      );
      paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? '';
    }

    if (!paymentIntentId) {
      throw new AppError(
        'Could not resolve PaymentIntent for this payment.',
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      metadata:       { bookingId, reason: 'admin_rejection' },
    });

    securityLogger.info('Stripe rejection refund issued', {
      bookingId,
      paymentIntentId,
    });

    return paymentRepository.update(payment.id, {
      status: PaymentStatus.REFUNDED,
    });
  }

  async refundPayment(
    paymentId: string,
    isAdmin:   boolean,
  ): Promise<PaymentWithMethod> {
    if (!isAdmin) {
      throw new AppError(
        'Only admins can issue refunds.',
        ErrorCode.FORBIDDEN,
      );
    }

    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found.', ErrorCode.NOT_FOUND);
    }
    if (payment.status !== PaymentStatus.PAID) {
      throw new AppError(
        `Cannot refund a payment with status "${payment.status}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    if (env.mockStripe) {
      securityLogger.info('Mock Stripe: fake refund', { paymentId });
      return paymentRepository.update(paymentId, {
        status: PaymentStatus.REFUNDED,
      });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      throw new AppError(
        'Payment service is not configured.',
        ErrorCode.CONFIGURATION_ERROR,
      );
    }

    if (!payment.stripeId) {
      throw new AppError(
        'No Stripe payment ID found for this payment.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    let paymentIntentId = payment.stripeId;
    if (payment.stripeId.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(
        payment.stripeId,
      );
      paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? '';
    }

    if (!paymentIntentId) {
      throw new AppError(
        'Could not resolve PaymentIntent for this payment.',
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      metadata:       { bookingId: payment.bookingId },
    });

    securityLogger.info('Stripe refund issued', { paymentId, paymentIntentId });

    return paymentRepository.update(paymentId, {
      status: PaymentStatus.REFUNDED,
    });
  }
}

export const paymentService = new PaymentService();