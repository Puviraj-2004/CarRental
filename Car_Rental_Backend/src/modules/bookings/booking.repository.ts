import { BookingStatus, BookingType, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NormalizedPagination,
  buildPaginatedResult,
  PaginatedResult,
} from '../../core/utils/pagination';
import type { BookingWithRelations } from '../../prisma/types';

const BOOKING_INCLUDE = {
  car:       { include: { model: { include: { brand: true } }, images: true, fuelType: true } },
  user:      true,
  payment:   { include: { paymentMethod: true } },
  documents: true,
} as const;

export class BookingRepository {
  // ── Queries ────────────────────────────────────────────────────────────────

  findById(id: string): Promise<BookingWithRelations | null> {
    return prisma.booking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
  }

  async findPaginatedByUser(
    userId: string,
    p: NormalizedPagination,
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const where: Prisma.BookingWhereInput = { userId };

    const [items, totalCount] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: BOOKING_INCLUDE,
        skip:    p.skip,
        take:    p.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  async findPaginated(
    p: NormalizedPagination,
    filter?: {
      status?:    BookingStatus;
      type?:      BookingType;
      userId?:    string;
      carId?:     string;
      startDate?: Date;
      endDate?:   Date;
    },
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const where: Prisma.BookingWhereInput = {};

    if (filter?.status)  where.status  = filter.status;
    if (filter?.type)    where.type    = filter.type;
    if (filter?.userId)  where.userId  = filter.userId;
    if (filter?.carId)   where.carId   = filter.carId;
    if (filter?.startDate || filter?.endDate) {
      where.startDate = {};
      if (filter.startDate) (where.startDate as Prisma.DateTimeFilter).gte = filter.startDate;
      if (filter.endDate)   (where.startDate as Prisma.DateTimeFilter).lte = filter.endDate;
    }

    const [items, totalCount] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: BOOKING_INCLUDE,
        skip:    p.skip,
        take:    p.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  /** Check if a car has any blocking bookings in the given date range. */
  hasConflict(
    carId:      string,
    startDate:  Date,
    endDate:    Date,
    excludeId?: string,
  ): Promise<boolean> {
    return prisma.booking
      .findFirst({
        where: {
          carId,
          id:     excludeId ? { not: excludeId } : undefined,
          status: {
            in: [
              BookingStatus.RESERVED,
              BookingStatus.CONFIRMED,
              BookingStatus.ONGOING,
            ],
          },
          AND: [
            { startDate: { lt: endDate } },
            { endDate:   { gt: startDate } },
          ],
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  create(data: {
    carId:       string;
    userId?:     string;
    startDate:   Date;
    endDate:     Date;
    numberOfDays: number;
    basePrice:   number;
    totalPrice:  number;
    guestName?:  string;
    guestPhone?: string;
    notes?:      string;
    type?:       BookingType;
  }): Promise<BookingWithRelations> {
    return prisma.booking.create({ data, include: BOOKING_INCLUDE });
  }

  update(id: string, data: Prisma.BookingUpdateInput): Promise<BookingWithRelations> {
    return prisma.booking.update({ where: { id }, data, include: BOOKING_INCLUDE });
  }
}

export const bookingRepository = new BookingRepository();