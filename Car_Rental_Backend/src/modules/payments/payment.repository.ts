import { PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NormalizedPagination,
  buildPaginatedResult,
  PaginatedResult,
} from '../../core/utils/pagination';
import type { PaymentWithMethod } from '../../prisma/types';

const PAYMENT_INCLUDE = {
  paymentMethod: true,
} as const;

export class PaymentRepository {
  // ── Queries ────────────────────────────────────────────────────────────────

  findById(id: string): Promise<PaymentWithMethod | null> {
    return prisma.payment.findUnique({
      where:   { id },
      include: PAYMENT_INCLUDE,
    });
  }

  findByBookingId(bookingId: string): Promise<PaymentWithMethod | null> {
    return prisma.payment.findUnique({
      where:   { bookingId },
      include: PAYMENT_INCLUDE,
    });
  }

  findByStripeId(stripeId: string): Promise<PaymentWithMethod | null> {
    return prisma.payment.findFirst({
      where:   { stripeId },
      include: PAYMENT_INCLUDE,
    });
  }

  async findPaginatedByUser(
    userId: string,
    p:      NormalizedPagination,
  ): Promise<PaginatedResult<PaymentWithMethod>> {
    const where: Prisma.PaymentWhereInput = {
      booking: { userId },
    };

    const [items, totalCount] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        include: PAYMENT_INCLUDE,
        skip:    p.skip,
        take:    p.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  async findPaginated(
    p: NormalizedPagination,
  ): Promise<PaginatedResult<PaymentWithMethod>> {
    const [items, totalCount] = await prisma.$transaction([
      prisma.payment.findMany({
        include: PAYMENT_INCLUDE,
        skip:    p.skip,
        take:    p.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count(),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  create(data: {
    bookingId: string;
    amount:    number;
    status?:   PaymentStatus;
    stripeId?: string;
  }): Promise<PaymentWithMethod> {
    return prisma.payment.create({
      data:    { ...data, status: data.status ?? PaymentStatus.PENDING },
      include: PAYMENT_INCLUDE,
    });
  }

  update(
    id:   string,
    data: Prisma.PaymentUpdateInput,
  ): Promise<PaymentWithMethod> {
    return prisma.payment.update({
      where:   { id },
      data,
      include: PAYMENT_INCLUDE,
    });
  }

  upsertByBookingId(
    bookingId: string,
    data: {
      amount:    number;
      status:    PaymentStatus;
      stripeId?: string;
    },
  ): Promise<PaymentWithMethod> {
    return prisma.payment.upsert({
      where:   { bookingId },
      update:  { status: data.status, stripeId: data.stripeId },
      create:  { bookingId, ...data },
      include: PAYMENT_INCLUDE,
    });
  }
}

export const paymentRepository = new PaymentRepository();