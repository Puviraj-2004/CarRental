import { BookingStatus, BookingType, PaymentStatus } from '@prisma/client';

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

const getRefundStatus = (
  paidAmount: number,
  refundedAmount: number,
): PaymentStatus =>
  refundedAmount >= paidAmount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

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

  async getRefundPreview(
    bookingId: string,
    userId:    string,
    isAdmin:   boolean,
  ) {
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: { payment: true },
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
    if (!booking.payment) {
      return null;
    }

    return calculateRefund(
      Number(booking.payment.amount),
      booking.startDate,
    );
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
    
    // Allow retry: delete previous PENDING payment so user can create a new session [1]
    if (existing?.status === PaymentStatus.PENDING) {
      await prisma.payment.delete({ where: { id: existing.id } });
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

    // Mock payment setup
    if (env.mockStripe) {
      securityLogger.info('Mock Stripe: immediate payment', { bookingId });

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

    // Immediate capture — funds are charged when customer completes checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       booking.user?.email ?? undefined,
      payment_intent_data: {
        metadata: { bookingId },
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

  async adminRecordBookingPayment(input: {
    bookingId: string;
    paymentMethodId: string;
    amount: number;
    adminId: string;
  }): Promise<PaymentWithMethod> {
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      select: { id: true, type: true },
    });

    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }
    if (booking.type === BookingType.COURTESY) {
      throw new AppError('Courtesy bookings do not require payment.', ErrorCode.BAD_USER_INPUT);
    }
    if (input.amount <= 0) {
      throw new AppError('Payment amount must be greater than zero.', ErrorCode.BAD_USER_INPUT);
    }

    const method = await prisma.paymentMethod.findUnique({
      where: { id: input.paymentMethodId },
    });
    if (!method) {
      throw new AppError('Payment method not found.', ErrorCode.NOT_FOUND);
    }

    const payment = await paymentRepository.upsertByBookingId(input.bookingId, {
      amount: input.amount,
      status: PaymentStatus.PAID,
      paymentMethodId: input.paymentMethodId,
    });

    securityLogger.info('Admin recorded booking payment', {
      bookingId: input.bookingId,
      paymentId: payment.id,
      paymentMethodId: input.paymentMethodId,
      amount: input.amount,
      adminId: input.adminId,
    });

    return payment;
  }

  async adminRefundBookingPayment(
    bookingId: string,
    adminId:   string,
  ): Promise<PaymentWithMethod> {
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }
    if (booking.type === BookingType.COURTESY) {
      throw new AppError('Courtesy bookings do not have refundable payments.', ErrorCode.BAD_USER_INPUT);
    }
    if (!booking.payment) {
      throw new AppError('No payment record found for this booking.', ErrorCode.NOT_FOUND);
    }
    if (booking.payment.status !== PaymentStatus.PAID) {
      throw new AppError(
        `Cannot refund a payment with status "${booking.payment.status}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    securityLogger.info('Admin requested policy-based booking refund', {
      bookingId,
      paymentId: booking.payment.id,
      adminId,
    });

    const refundedPayment = await this.cancelAndRefund(bookingId, adminId, true);
    if (!refundedPayment) {
      throw new AppError('Refund could not be processed for this booking.', ErrorCode.INTERNAL_SERVER_ERROR);
    }

    return refundedPayment;
  }

  // ── Mock Finalize: Simulates immediate payment capture ──────
  async mockFinalizePayment(bookingId: string, success: boolean) {
    if (!env.mockStripe) {
      throw new AppError('Mock payment is only allowed in development.', ErrorCode.BAD_USER_INPUT);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }

    const status = success ? PaymentStatus.PAID : PaymentStatus.FAILED;

    const payment = await paymentRepository.upsertByBookingId(bookingId, {
      amount: Number(booking.totalPrice),
      status,
      stripeId: `mock_charge_${success ? 'success' : 'failed'}_${bookingId}`
    });

    if (success) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED }
      });
      securityLogger.info('Mock payment captured: booking confirmed', { bookingId });
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
      return payment;
    }

    throw new AppError(
      `Cannot confirm an immediate-payment booking with payment status "${payment.status}".`,
      ErrorCode.BAD_USER_INPUT,
    );
  }

  // ── Cancel/Void Hold: Instantly releases hold if not captured yet [1.1.2, 1.1.5, 1.1.6] ──
  async cancelOrVoidPayment(bookingId: string): Promise<PaymentWithMethod | null> {
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) return null;

    if (payment.status === PaymentStatus.PENDING) {
      securityLogger.info('Pending checkout payment marked failed during booking cancellation/rejection', {
        bookingId,
        paymentId: payment.id,
        stripeId: payment.stripeId,
      });
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

    if (payment.status === PaymentStatus.PENDING) {
      securityLogger.info('Pending checkout payment marked failed during user/admin cancellation', {
        bookingId,
        paymentId: payment.id,
        stripeId: payment.stripeId,
      });
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
        securityLogger.info('Cancellation policy produced no refund; payment remains paid', {
          bookingId,
          paymentId: payment.id,
          userId,
          isAdmin,
        });
        return payment;
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
          status: getRefundStatus(Number(payment.amount), refundAmount),
          refundedAmount: refundAmount,
          refundPolicy: policy,
          refundedAt: new Date(),
        });
      }

      if (!payment.stripeId && isAdmin) {
        securityLogger.info('Admin refunded locally recorded booking payment during cancellation', {
          bookingId,
          paymentId: payment.id,
          userId,
        });
        return paymentRepository.update(payment.id, {
          status: getRefundStatus(Number(payment.amount), refundAmount),
          refundedAmount: refundAmount,
          refundPolicy: policy,
          refundedAt: new Date(),
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
        status: getRefundStatus(Number(payment.amount), refundAmount),
        refundedAmount: refundAmount,
        refundPolicy: policy,
        refundedAt: new Date(),
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
        refundedAmount: Number(payment.amount),
        refundPolicy: 'FULL',
        refundedAt: new Date(),
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
      refundedAmount: Number(payment.amount),
      refundPolicy: 'FULL',
      refundedAt: new Date(),
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
        refundedAmount: Number(payment.amount),
        refundPolicy: 'FULL',
        refundedAt: new Date(),
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
      refundedAmount: Number(payment.amount),
      refundPolicy: 'FULL',
      refundedAt: new Date(),
    });
  }
}

export const paymentService = new PaymentService();
