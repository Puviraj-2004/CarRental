import { BookingStatus, BookingType, CarStatus, PaymentStatus } from '@prisma/client';

import { AppError, ErrorCode }   from '../../core/errors/AppError';
import { normalizePagination }   from '../../core/utils/pagination';
import { daysBetween }           from '../../core/utils/date';
import { multiplyMoney }         from '../../core/utils/money';
import { prisma }                from '../../config/database'; 
import { env }                   from '../../config/env';
import logger                    from '../../config/logger';
import {
  MIN_BOOKING_DAYS,
  MAX_BOOKING_DAYS,
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

export interface BookingQuote {
  carId:        string;
  startDate:    Date;
  endDate:      Date;
  numberOfDays: number;
  basePrice:    number;
  subtotal:     number;
  taxRate:      number;
  taxAmount:    number;
  totalPrice:   number;
  currency:     string;
}

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
      lane?:      string | null;
      userId?:    string;
      carId?:     string;
      startDate?: string;
      endDate?:   string;
    },
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const p = normalizePagination(pagination);
    const where: any = {
      status: filter?.status ?? undefined,
      type:   filter?.type   ?? undefined,
      userId: filter?.userId ?? undefined,
      carId:  filter?.carId  ?? undefined,
    };

    if (filter?.lane === 'ONLINE') {
      where.type = BookingType.RENTAL;
      where.userId = { not: null };
    }

    if (filter?.lane === 'ONSITE') {
      where.type = BookingType.RENTAL;
      where.userId = null;
    }

    if (filter?.lane === 'COURTESY') {
      where.type = BookingType.COURTESY;
    }

    if (filter?.startDate) {
      where.startDate = { gte: new Date(filter.startDate) };
    }

    if (filter?.endDate) {
      where.endDate = { lte: new Date(filter.endDate) };
    }

    if (p.search) {
      where.OR = [
        { id: { contains: p.search, mode: 'insensitive' } },
        { guestName: { contains: p.search, mode: 'insensitive' } },
        { guestPhone: { contains: p.search, mode: 'insensitive' } },
        { user: { email: { contains: p.search, mode: 'insensitive' } } },
        { car: { plateNumber: { contains: p.search, mode: 'insensitive' } } },
        { car: { model: { name: { contains: p.search, mode: 'insensitive' } } } },
        { car: { model: { brand: { name: { contains: p.search, mode: 'insensitive' } } } } },
      ];
    }

    return bookingRepository.findPaginated(
      p,
      where,
    );
  }

  async getBookingQuote(input: {
    carId:     string;
    startDate: string;
    endDate:   string;
    type?:     BookingType | null;
  }): Promise<BookingQuote> {
    const { start, end, numberOfDays } = this.validateBookingDates(input.startDate, input.endDate);

    const car = await carRepository.findById(input.carId);
    if (!car) {
      throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
    }

    const bookingType = input.type ?? BookingType.RENTAL;
    const pricing = this.calculateBookingPricing(
      Number(car.basePrice),
      numberOfDays,
      bookingType,
    );

    return {
      carId: input.carId,
      startDate: start,
      endDate: end,
      numberOfDays,
      ...pricing,
      currency: env.appCurrency,
    };
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
    const { start, end, numberOfDays } = this.validateBookingDates(input.startDate, input.endDate);

    const bookingType = input.type ?? BookingType.RENTAL;
    if (!input.userId) {
      if (!input.guestName || !input.guestPhone) {
        throw new AppError(
          'Guest name and phone are required for bookings without a user account.',
          ErrorCode.BAD_USER_INPUT,
        );
      }
    }

    const car = await carRepository.findById(input.carId);
    if (!car) {
      throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
    }
    if (car.status === CarStatus.UNAVAILABLE) {
      throw new AppError(
        'This car is not available for booking.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const pricing = this.calculateBookingPricing(
      Number(car.basePrice),
      numberOfDays,
      bookingType,
    );

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
          basePrice:   pricing.basePrice,
          subtotal:    pricing.subtotal,
          taxRate:     pricing.taxRate,
          taxAmount:   pricing.taxAmount,
          totalPrice:  pricing.totalPrice,
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
      if (hoursUntilStart <= 0) {
        throw new AppError(
          'Bookings can only be cancelled before the rental starts.',
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

    if (
      booking.type === BookingType.RENTAL &&
      !booking.userId &&
      (status === BookingStatus.CONFIRMED || status === BookingStatus.ONGOING)
    ) {
      this.assertOnsiteRentalReady(booking);
    }

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

      if (
        booking.type === BookingType.RENTAL &&
        booking.payment &&
        booking.payment.status !== PaymentStatus.PAID
      ) {
        throw new AppError(
          'Rental bookings must have a paid payment before confirmation.',
          ErrorCode.BAD_USER_INPUT,
        );
      }
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

      if (booking.type === BookingType.RENTAL && booking.payment) {
        void paymentService
          .cancelOrVoidPayment(id)
          .catch((err) => {
            logger.warn('Failed to release hold or refund after rejection', {
              bookingId: id,
              error:     err instanceof Error ? err.message : String(err),
            });
          });
      }

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
      if (booking.type === BookingType.RENTAL && booking.payment) {
        void paymentService
          .cancelAndRefund(id, booking.userId ?? '', true)
          .catch((err) => {
            logger.warn('Refund failed after admin cancellation', {
              bookingId: id,
              error:     err instanceof Error ? err.message : String(err),
            });
          });
      }

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
        BookingStatus.EXPIRED,
      ],
      [BookingStatus.ONGOING]:   [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.EXPIRED]:   [],
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

  private assertOnsiteRentalReady(booking: BookingWithRelations): void {
    if (!booking.guestName?.trim() || !booking.guestPhone?.trim()) {
      throw new AppError(
        'Onsite rentals require guest name and phone before confirmation or start.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    if (!booking.documents || booking.documents.status !== 'APPROVED') {
      throw new AppError(
        'Onsite rentals require approved documents before confirmation or start.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    if (!booking.payment || booking.payment.status !== PaymentStatus.PAID) {
      throw new AppError(
        'Onsite rentals require a paid payment record before confirmation or start.',
        ErrorCode.BAD_USER_INPUT,
      );
    }
  }

  private validateBookingDates(startDate: string, endDate: string): {
    start: Date;
    end: Date;
    numberOfDays: number;
  } {
    const start = new Date(startDate);
    const end   = new Date(endDate);

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

    return { start, end, numberOfDays };
  }

  private calculateBookingPricing(
    basePrice: number,
    numberOfDays: number,
    bookingType: BookingType,
  ): Omit<BookingQuote, 'carId' | 'startDate' | 'endDate' | 'numberOfDays' | 'currency'> {
    if (bookingType === BookingType.COURTESY) {
      return {
        basePrice,
        subtotal:   0,
        taxRate:    0,
        taxAmount:  0,
        totalPrice: 0,
      };
    }

    const subtotal = multiplyMoney(basePrice, numberOfDays).toDecimalPlaces(2);
    const taxRate = env.appTaxRate;
    const taxAmount = subtotal.mul(taxRate).toDecimalPlaces(2);
    const totalPrice = subtotal.add(taxAmount).toDecimalPlaces(2);

    return {
      basePrice,
      subtotal:   subtotal.toNumber(),
      taxRate,
      taxAmount:  taxAmount.toNumber(),
      totalPrice: totalPrice.toNumber(),
    };
  }

  async extendBookingDates(
    id:         string,
    userId:     string,
    isAdmin:    boolean,
    newEndDate: string,
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

    // Allow extension only for RESERVED and certain states that haven't started [1]
    const allowedStatuses: BookingStatus[] = [BookingStatus.RESERVED];
    if (!allowedStatuses.includes(booking.status)) {
      throw new AppError(
        `Cannot extend dates for a booking with status "${booking.status}".`,
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const parsedNewEndDate = new Date(newEndDate);
    if (isNaN(parsedNewEndDate.getTime())) {
      throw new AppError('Invalid date format.', ErrorCode.BAD_USER_INPUT);
    }

    if (parsedNewEndDate <= booking.endDate) {
      throw new AppError(
        'New end date must be after the current end date.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    // Check for conflicts with other bookings [1]
    const BLOCKING_STATUSES = [BookingStatus.RESERVED, BookingStatus.CONFIRMED, BookingStatus.ONGOING];
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        carId: booking.carId,
        id: { not: id },
        status: { in: BLOCKING_STATUSES },
        AND: [
          { startDate: { lte: parsedNewEndDate } },
          { endDate: { gte: booking.startDate } },
        ],
      },
    });

    if (conflictingBooking) {
      throw new AppError(
        'The requested dates conflict with another booking.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    // Recalculate pricing [1]
    const newNumberOfDays = Math.ceil((parsedNewEndDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricing = this.calculateBookingPricing(
      Number(booking.basePrice),
      newNumberOfDays,
      booking.type,
    );

    const updated = await bookingRepository.update(id, {
      endDate: parsedNewEndDate,
      numberOfDays: newNumberOfDays,
      subtotal: pricing.subtotal,
      taxRate: pricing.taxRate,
      taxAmount: pricing.taxAmount,
      totalPrice: pricing.totalPrice,
    });

    logger.info('Booking dates extended', {
      bookingId: id,
      previousEndDate: booking.endDate,
      newEndDate: parsedNewEndDate,
      newNumberOfDays,
    });

    return updated;
  }
}

export const bookingService = new BookingService();
