import { BookingStatus, BookingType } from '@prisma/client';

import { isAuthenticated } from '../../core/middleware/auth.middleware';
import { isAdmin }         from '../../core/middleware/admin.middleware';
import { GraphQLContext }  from '../../graphql/context';
import { bookingService }  from './booking.service';
import type {
  Resolvers,
  QueryMyBookingsArgs,
  QueryBookingsArgs,
  QueryBookingArgs,
  MutationCreateBookingArgs,
  MutationCancelBookingArgs,
  MutationUpdateBookingArgs,
  MutationAdminUpdateBookingStatusArgs,
} from '../../graphql/__generated__/types';

export const bookingResolvers: Partial<Resolvers> = {
  Booking: {
    basePrice:      (parent) => Number(parent.basePrice),
    totalPrice:     (parent) => Number(parent.totalPrice),
    reminderSentAt: (parent) => parent.reminderSentAt ?? null,
  },

  Query: {
    booking: (_: unknown, { id }: QueryBookingArgs, ctx: GraphQLContext) => {
      isAuthenticated(ctx);
      return bookingService.getBookingById(id, ctx.userId!, ctx.role === 'ADMIN');
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
      return bookingService.getAllBookings(
        pagination != null
          ? { page: pagination.page ?? undefined, pageSize: pagination.pageSize ?? undefined }
          : undefined,
        filter != null
          ? {
              status:    (filter.status    ?? undefined) as BookingStatus | undefined,
              type:      (filter.type      ?? undefined) as BookingType   | undefined,
              userId:    filter.userId    ?? undefined,
              carId:     filter.carId     ?? undefined,
              startDate: filter.startDate ?? undefined,
              endDate:   filter.endDate   ?? undefined,
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
      // Authenticated users attach their userId; unauthenticated guests use guestName/Phone
      return bookingService.createBooking({
        carId:      input.carId,
        userId:     ctx.userId ?? undefined,
        startDate:  input.startDate,
        endDate:    input.endDate,
        guestName:  input.guestName  ?? undefined,
        guestPhone: input.guestPhone ?? undefined,
        notes:      input.notes      ?? undefined,
        type:       (input.type ?? undefined) as BookingType | undefined,
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
  },
};