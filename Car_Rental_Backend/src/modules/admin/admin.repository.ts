import { BookingStatus, BookingType, CarStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

const RECENT_BOOKINGS_TAKE = 8;

export class AdminRepository {
  private buildCreatedAtFilter(filter?: { startDate?: string | null; endDate?: string | null }) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filter?.startDate) createdAt.gte = new Date(filter.startDate);
    if (filter?.endDate) createdAt.lte = new Date(filter.endDate);
    return Object.keys(createdAt).length > 0 ? createdAt : undefined;
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalCars,
      totalBookings,
      revenueAggregate,
      availableCars,
      pendingDocuments,
      pendingPayments,
      reservedBookings,
      confirmedBookings,
      ongoingBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      recentBookings,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.car.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.car.count({ where: { status: CarStatus.AVAILABLE } }),
      prisma.documents.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.RESERVED } }),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.ONGOING } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      prisma.booking.count({ where: { status: BookingStatus.REJECTED } }),
      prisma.booking.findMany({
        take: RECENT_BOOKINGS_TAKE,
        orderBy: { createdAt: 'desc' },
        where: {
          status: {
            notIn: [BookingStatus.EXPIRED],
          },
        },
        include: {
          user: { include: { documents: true, bookings: true } },
          car: {
            include: {
              model: { include: { brand: true } },
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCars,
      totalBookings,
      totalRevenue: Number(revenueAggregate._sum.amount ?? 0),
      availableCars,
      pendingDocuments,
      pendingPayments,
      reservedBookings,
      confirmedBookings,
      ongoingBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      recentBookings,
    };
  }

  async getReports(filter?: { startDate?: string | null; endDate?: string | null }) {
    const createdAt = this.buildCreatedAtFilter(filter);
    const bookingWhere: Prisma.BookingWhereInput = createdAt ? { createdAt } : {};
    const paymentWhere: Prisma.PaymentWhereInput = createdAt ? { createdAt } : {};

    const [
      paidAggregate,
      refundedAggregate,
      pendingAggregate,
      onlineBookings,
      onsiteBookings,
      courtesyBookings,
      reservedBookings,
      confirmedBookings,
      ongoingBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      expiredBookings,
      pendingDocuments,
      availableCars,
      rentedCars,
      paymentMethodGroups,
    ] = await prisma.$transaction([
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: PaymentStatus.PAID },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: PaymentStatus.REFUNDED },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: PaymentStatus.PENDING },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.booking.count({ where: { ...bookingWhere, type: BookingType.RENTAL, userId: { not: null } } }),
      prisma.booking.count({ where: { ...bookingWhere, type: BookingType.RENTAL, userId: null } }),
      prisma.booking.count({ where: { ...bookingWhere, type: BookingType.COURTESY } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.RESERVED } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.ONGOING } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.CANCELLED } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.REJECTED } }),
      prisma.booking.count({ where: { ...bookingWhere, status: BookingStatus.EXPIRED } }),
      prisma.documents.count({ where: { status: 'PENDING', ...(createdAt ? { createdAt } : {}) } }),
      prisma.car.count({ where: { status: CarStatus.AVAILABLE } }),
      prisma.car.count({ where: { status: CarStatus.RENTED } }),
      prisma.payment.groupBy({
        by: ['paymentMethodId'],
        where: { ...paymentWhere, status: { in: [PaymentStatus.PAID, PaymentStatus.REFUNDED] } },
        orderBy: { paymentMethodId: 'asc' },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const methodIds = paymentMethodGroups
      .map((group) => group.paymentMethodId)
      .filter((id): id is string => !!id);
    const methods = methodIds.length
      ? await prisma.paymentMethod.findMany({ where: { id: { in: methodIds } } })
      : [];
    const methodNameById = new Map(methods.map((method) => [method.id, method.name]));

    return {
      totalRevenue: Number(paidAggregate._sum.amount ?? 0),
      paid: {
        count: paidAggregate._count._all,
        amount: Number(paidAggregate._sum.amount ?? 0),
      },
      refunded: {
        count: refundedAggregate._count._all,
        amount: Number(refundedAggregate._sum.amount ?? 0),
      },
      pendingPayments: {
        count: pendingAggregate._count._all,
        amount: Number(pendingAggregate._sum.amount ?? 0),
      },
      bookingLanes: {
        online: onlineBookings,
        onsite: onsiteBookings,
        courtesy: courtesyBookings,
      },
      bookingStatuses: {
        reserved: reservedBookings,
        confirmed: confirmedBookings,
        ongoing: ongoingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        rejected: rejectedBookings,
        expired: expiredBookings,
      },
      pendingDocuments,
      availableCars,
      rentedCars,
      paymentMethods: paymentMethodGroups.map((group) => {
        const aggregate = group as typeof group & {
          _count: { id?: number };
          _sum: { amount?: Prisma.Decimal | null };
        };
        return {
          id: group.paymentMethodId,
          name: group.paymentMethodId ? methodNameById.get(group.paymentMethodId) ?? 'Unknown method' : 'Stripe / Online',
          count: Number(aggregate._count.id ?? 0),
          amount: Number(aggregate._sum.amount ?? 0),
        };
      }),
    };
  }
}

export const adminRepository = new AdminRepository();
