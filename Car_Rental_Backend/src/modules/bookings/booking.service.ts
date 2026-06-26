import { BookingStatus, BookingType, CarStatus, PaymentStatus } from '@prisma/client';

import { AppError, ErrorCode }   from '../../core/errors/AppError';
import { normalizePagination }   from '../../core/utils/pagination';
import { daysBetween }           from '../../core/utils/date';
import { multiplyMoney }         from '../../core/utils/money';
import { prisma }                from '../../config/database'; 
import logger                    from '../../config/logger';
import {
  MIN_BOOKING_DAYS,
  MAX_BOOKING_DAYS,
  CANCELLATION_WINDOW_HOURS,
} from '../../core/constants/booking';
import { bookingRepository }     from './booking.repository';
import { carRepository }         from '../cars/car.repository';
import { paymentService }        from '../payments/payment.service';
import { notificationService, buildBookingEmailData } from '../notifications/notification.service';
import type { BookingWithRelations } from '../../prisma/types';
import type { PaginatedResult }      from '../../core/utils/pagination';

const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.RESERVED,
  BookingStatus.CONFIRMED,
];

export class BookingService {
  async getBookingById(id: string, userId: string, isAdmin: boolean): Promise<BookingWithRelations | null> {
    const booking = await bookingRepository.findById(id);
    if (!booking) return null;

    if (!isAdmin && booking.userId !== userId) {
      throw new AppError(
        'Access denied. You do not own this booking.',
        ErrorCode.FORBIDDEN,
      );
    }

    return booking;
  }

  async getMyBookings(
    userId:      string,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BookingWithRelations>> {
    return bookingRepository.findPaginatedByUser(
      userId,
      normalizePagination(pagination),
    );
  }

  // ── Updated: Filters the Admin Queue strictly [1.1.5] ───────────────────
  async getAllBookings(
    pagination?: { page?: number; pageSize?: number },
    filter?: {
      status?:    BookingStatus;
      type?:      BookingType;
      userId?:    string;
      carId?:     string;
      startDate?: string;
      endDate?:   string;
    },
  ): Promise<PaginatedResult<BookingWithRelations>> {
    
    // Construct advanced query to enforce your queue restrictions [1, 1.1.5]
    const strictAdminQuery = {
      // 1. Must have document uploaded
      documentId: { not: null },
      
      // 2. Only show RENTAL type bookings
      type: BookingType.RENTAL,
      
      // 3. Do NOT show cancelled or rejected bookings
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
      },
      
      // Must have an active authorized hold or paid payment [1.1.5]
      payment: {
        status: {
          in: [PaymentStatus.PENDING, PaymentStatus.PAID],
        },
      },
      
      // Allow custom filter overrides if passed explicitly
      userId: filter?.userId ?? undefined,
      carId:  filter?.carId ?? undefined,
    };

    return bookingRepository.findPaginated(
      normalizePagination(pagination),
      strictAdminQuery as any,
    );
  }

  async createBooking(input: {
    carId:       string;
    userId?:     string;
    startDate:   string;
    endDate:     string;
    guestName?:  string;
    guestPhone?: string;
    notes?:      string;
    type?:       BookingType;
  }): Promise<BookingWithRelations> {
    const start = new Date(input.startDate);
    const end   = new Date(input.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Invalid date format.', ErrorCode.BAD_USER_INPUT);
    }
    if (start < new Date()) {
      throw new AppError(
        'Start date cannot be in the past.',
        ErrorCode.BAD_USER_INPUT,
      );
    }
    if (start >= end) {
      throw new AppError(
        'Start date must be before end date.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const numberOfDays = daysBetween(start, end);

    if (numberOfDays < MIN_BOOKING_DAYS) {
      throw new AppError(
        `Minimum booking duration is ${MIN_BOOKING_DAYS} day(s).`,
        ErrorCode.BAD_USER_INPUT,
      );
    }
    if (numberOfDays > MAX_BOOKING_DAYS) {
      throw new AppError(
        `Maximum booking duration is ${MAX_BOOKING_DAYS} days.`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const bookingType = input.type ?? BookingType.RENTAL;
    if (bookingType === BookingType.COURTESY && !input.userId) {
      if (!input.guestName || !input.guestPhone) {
        throw new AppError(
          'Guest name and phone are required for courtesy bookings without a user account.',
          ErrorCode.BAD_USER_INPUT,
        );
      }
    }

    const car = await carRepository.findById(input.carId);
    if (!car) {
      throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
    }
    if (car.status !== CarStatus.AVAILABLE) {
      throw new AppError(
        'This car is not available for booking.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const basePrice  = Number(car.basePrice);
    const totalPrice = multiplyMoney(basePrice, numberOfDays).toNumber();

    // Atomic check-and-create inside a serializable transaction to prevent double-booking
    return prisma.$transaction(async (tx) => {
      // Row-level advisory lock on the car to serialize concurrent booking attempts
      await tx.$queryRaw`SELECT id FROM "Car" WHERE id = ${input.carId} FOR UPDATE`;

      const conflict = await tx.booking.findFirst({
        where: {
          carId: input.carId,
          status: { in: [BookingStatus.RESERVED, BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
          AND: [
            { startDate: { lte: end } },
            { endDate:   { gte: start } },
          ],
        },
        select: { id: true },
      });

      if (conflict) {
        throw new AppError(
          'This car is already booked for the selected dates.',
          ErrorCode.ALREADY_EXISTS,
        );
      }

      return tx.booking.create({
        data: {
          carId:       input.carId,
          userId:      input.userId,
          startDate:   start,
          endDate:     end,
          numberOfDays,
          basePrice,
          totalPrice,
          guestName:   input.guestName,
          guestPhone:  input.guestPhone,
          notes:       input.notes,
          type:        bookingType,
        },
        include: {
          car:       { include: { model: { include: { brand: true } }, images: true, fuelType: true } },
          user:      true,
          payment:   { include: { paymentMethod: true } },
          documents: true,
        },
      });
    });
  }

  async cancelBooking(
    id:      string,
    userId:  string,
    isAdmin: boolean,
  ): Promise<BookingWithRelations> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }

    if (!isAdmin && booking.userId !== userId) {
      throw new AppError(
        'Access denied. You do not own this booking.',
        ErrorCode.FORBIDDEN,
      );
    }

    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new AppError(
        `Cannot cancel a booking with status "${booking.status}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    if (!isAdmin) {
      const hoursUntilStart =
        (booking.startDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilStart < CANCELLATION_WINDOW_HOURS) {
        throw new AppError(
          `Cancellations must be made at least ${CANCELLATION_WINDOW_HOURS} hours before pickup.`,
          ErrorCode.BAD_USER_INPUT,
        );
      }
    }

    const updated = await bookingRepository.update(id, {
      status: BookingStatus.CANCELLED,
    });

    // Await refund — surface failures instead of silently swallowing them
    try {
      await paymentService.cancelAndRefund(id, userId, isAdmin);
    } catch (err) {
      logger.error('REFUND FAILED after cancellation — requires manual resolution', {
        bookingId: id,
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    if (updated.user?.email) {
      void notificationService
        .sendBookingCancelled(
          updated.user.email,
          buildBookingEmailData(updated),
        )
        .catch((err) => {
          logger.warn('Cancellation email failed', {
            bookingId: id,
            error:     err instanceof Error ? err.message : String(err),
          });
        });
    }

    return updated;
  }

  async updateBooking(
    id:      string,
    userId:  string,
    isAdmin: boolean,
    input: {
      notes?:      string;
      guestName?:  string;
      guestPhone?: string;
    },
  ): Promise<BookingWithRelations> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }

    if (!isAdmin && booking.userId !== userId) {
      throw new AppError(
        'Access denied. You do not own this booking.',
        ErrorCode.FORBIDDEN,
      );
    }

    const editableStatuses: BookingStatus[] = [
      BookingStatus.RESERVED,
      BookingStatus.CONFIRMED,
    ];
    if (!editableStatuses.includes(booking.status)) {
      throw new AppError(
        `Cannot edit a booking with status "${booking.status}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const data: Record<string, unknown> = {};
    if (input.notes      !== undefined) data.notes      = input.notes;
    if (input.guestName  !== undefined) data.guestName  = input.guestName;
    if (input.guestPhone !== undefined) data.guestPhone = input.guestPhone;

    return bookingRepository.update(id, data);
  }

  async adminUpdateBookingStatus(
    id:     string,
    status: BookingStatus,
  ): Promise<BookingWithRelations> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }

    this.assertValidTransition(booking.status, status);

    const updated = await bookingRepository.update(id, { status });

    if (status === BookingStatus.ONGOING) {
      await carRepository.update(booking.carId, { status: CarStatus.RENTED });
      logger.info('Handover processed: car marked as RENTED', { carId: booking.carId, bookingId: id });
    }

    if (status === BookingStatus.COMPLETED) {
      await carRepository.update(booking.carId, { status: CarStatus.AVAILABLE });
      logger.info('Return processed: car marked as AVAILABLE', { carId: booking.carId, bookingId: id });
    }

    if (status === BookingStatus.CONFIRMED) {
      if (booking.documentId) {
        await prisma.documents.update({
          where: { id: booking.documentId },
          data: { status: 'APPROVED' },
        });
        logger.info('Booking confirmed: linked documents marked as APPROVED', { documentId: booking.documentId, bookingId: id });
      }

      await paymentService.capturePayment(id).catch((err) => {
        logger.error('Failed to capture payment during booking confirmation', { bookingId: id, error: err.message });
        throw err; 
      });
    }

    if (status === BookingStatus.REJECTED) {
      if (booking.documentId) {
        await prisma.documents.update({
          where: { id: booking.documentId },
          data: { status: 'REJECTED' },
        });

        await prisma.user.updateMany({
          where: { documentId: booking.documentId },
          data: { documentId: null },
        });
        
        logger.info('Booking rejected: linked documents marked as REJECTED and unlinked from user profiles', { documentId: booking.documentId, bookingId: id });
      }

      void paymentService
        .cancelOrVoidPayment(id)
        .catch((err) => {
          logger.warn('Failed to release hold or refund after rejection', {
            bookingId: id,
            error:     err instanceof Error ? err.message : String(err),
          });
        });

      if (updated.user?.email) {
        void notificationService
          .sendBookingRejected(
            updated.user.email,
            buildBookingEmailData(updated),
          )
          .catch((err) => {
            logger.warn('Rejection email failed', {
              bookingId: id,
              error:     err instanceof Error ? err.message : String(err),
            });
          });
      }
    }

    if (status === BookingStatus.CANCELLED) {
      void paymentService
        .cancelAndRefund(id, booking.userId ?? '', true)
        .catch((err) => {
          logger.warn('Refund failed after admin cancellation', {
            bookingId: id,
            error:     err instanceof Error ? err.message : String(err),
          });
        });

      if (updated.user?.email) {
        void notificationService
          .sendBookingCancelled(
            updated.user.email,
            buildBookingEmailData(updated),
          )
          .catch((err) => {
            logger.warn('Cancellation email failed after admin cancel', {
              bookingId: id,
              error:     err instanceof Error ? err.message : String(err),
            });
          });
      }
    }

    return updated;
  }

  private assertValidTransition(
    from: BookingStatus,
    to:   BookingStatus,
  ): void {
    const ALLOWED: Partial<Record<BookingStatus, BookingStatus[]>> = {
      [BookingStatus.RESERVED]:  [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
        BookingStatus.REJECTED,
      ],
      [BookingStatus.CONFIRMED]: [
        BookingStatus.ONGOING,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.ONGOING]:   [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.REJECTED]:  [],
    };

    if (!ALLOWED[from]?.includes(to)) {
      throw new AppError(
        `Invalid status transition: "${from}" → "${to}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }
  }
}

export const bookingService = new BookingService();