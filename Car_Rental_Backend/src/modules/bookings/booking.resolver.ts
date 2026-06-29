import { BookingStatus, BookingType } from '@prisma/client';

import { isAuthenticated } from '../../core/middleware/auth.middleware';
import { isAdmin }         from '../../core/middleware/admin.middleware';
import { GraphQLContext }  from '../../graphql/context';
import { bookingService }  from './booking.service';
import { AppError, ErrorCode } from '../../core/errors/AppError';
import type {
  Resolvers,
  QueryMyBookingsArgs,
  QueryBookingsArgs,
  QueryBookingArgs,
  QueryBookingQuoteArgs,
  MutationCreateBookingArgs,
  MutationCancelBookingArgs,
  MutationUpdateBookingArgs,
  MutationAdminUpdateBookingStatusArgs,
} from '../../graphql/__generated__/types';

export const bookingResolvers: Partial<Resolvers> = {
  Booking: {
    basePrice:      (parent) => Number(parent.basePrice),
    subtotal:       (parent) => Number(parent.subtotal),
    taxRate:        (parent) => Number(parent.taxRate),
    taxAmount:      (parent) => Number(parent.taxAmount),
    totalPrice:     (parent) => Number(parent.totalPrice),
    documentRejectedAt: (parent) => parent.documentRejectedAt ?? null,
    documentReuploadDeadline: (parent) => parent.documentReuploadDeadline ?? null,
    reminderSentAt: (parent) => parent.reminderSentAt ?? null,
  },

  Query: {
    booking: (_: unknown, { id }: QueryBookingArgs, ctx: GraphQLContext) => {
      isAuthenticated(ctx);
      return bookingService.getBookingById(id, ctx.userId!, ctx.role === 'ADMIN');
    },

    bookingQuote: (
      _: unknown,
      { carId, startDate, endDate, type }: QueryBookingQuoteArgs,
    ) => {
      return bookingService.getBookingQuote({
        carId,
        startDate,
        endDate,
        type: (type ?? undefined) as BookingType | undefined,
      });
    },

    myBookings: (_: unknown, { pagination }: QueryMyBookingsArgs, ctx: GraphQLContext) => {
      isAuthenticated(ctx);
      return bookingService.getMyBookings(
        ctx.userId!,
        pagination != null
          ? { page: pagination.page ?? undefined, pageSize: pagination.pageSize ?? undefined }
          : undefined,
      );
    },

    bookings: (_: unknown, { pagination, filter }: QueryBookingsArgs, ctx: GraphQLContext) => {
      isAdmin(ctx);
      const filterInput = filter as (typeof filter & { lane?: string | null }) | null | undefined;
      return bookingService.getAllBookings(
        pagination != null
          ? { page: pagination.page ?? undefined, pageSize: pagination.pageSize ?? undefined }
          : undefined,
        filterInput != null
          ? {
              status:    (filterInput.status    ?? undefined) as BookingStatus | undefined,
              type:      (filterInput.type      ?? undefined) as BookingType   | undefined,
              lane:      filterInput.lane       ?? undefined,
              userId:    filterInput.userId    ?? undefined,
              carId:     filterInput.carId     ?? undefined,
              startDate: filterInput.startDate ?? undefined,
              endDate:   filterInput.endDate   ?? undefined,
            }
          : undefined,
      );
    },
  },

  Mutation: {
    createBooking: (
      _: unknown,
      { input }: MutationCreateBookingArgs,
      ctx: GraphQLContext,
    ) => {
      if (input.type === BookingType.COURTESY && ctx.role !== 'ADMIN') {
        throw new AppError('Courtesy bookings can only be created by admins.', ErrorCode.FORBIDDEN);
      }

      // Authenticated users attach their userId; unauthenticated guests use guestName/Phone
      return bookingService.createBooking({
        carId:      input.carId,
        userId:     ctx.role === 'ADMIN' && input.type === BookingType.COURTESY ? undefined : (ctx.userId ?? undefined),
        startDate:  input.startDate,
        endDate:    input.endDate,
        guestName:  input.guestName  ?? undefined,
        guestPhone: input.guestPhone ?? undefined,
        notes:      input.notes      ?? undefined,
        type:       (input.type ?? undefined) as BookingType | undefined,
      });
    },

    adminCreateBooking: (
      _: unknown,
      { input }: MutationCreateBookingArgs,
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return bookingService.createBooking({
        carId:      input.carId,
        startDate:  input.startDate,
        endDate:    input.endDate,
        guestName:  input.guestName  ?? undefined,
        guestPhone: input.guestPhone ?? undefined,
        notes:      input.notes      ?? undefined,
        type:       (input.type ?? BookingType.RENTAL) as BookingType,
      });
    },

    cancelBooking: (
      _: unknown,
      { id }: MutationCancelBookingArgs,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return bookingService.cancelBooking(
        id,
        ctx.userId!,
        ctx.role === 'ADMIN',
      );
    },

    updateBooking: (
      _: unknown,
      { id, input }: MutationUpdateBookingArgs,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return bookingService.updateBooking(
        id,
        ctx.userId!,
        ctx.role === 'ADMIN',
        {
          notes:      input.notes      ?? undefined,
          guestName:  input.guestName  ?? undefined,
          guestPhone: input.guestPhone ?? undefined,
        },
      );
    },

    adminUpdateBookingStatus: (
      _: unknown,
      { id, status }: MutationAdminUpdateBookingStatusArgs,
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return bookingService.adminUpdateBookingStatus(id, status as BookingStatus);
    },

    extendBookingDates: (
      _: unknown,
      { id, newEndDate }: { id: string; newEndDate: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return bookingService.extendBookingDates(
        id,
        ctx.userId,
        ctx.role === 'ADMIN',
        newEndDate,
      );
    },
  },
};
