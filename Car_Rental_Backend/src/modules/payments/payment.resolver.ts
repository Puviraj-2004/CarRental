import { paymentService } from './payment.service';
import { GraphQLContext } from '../../graphql/context';
import { AppError, ErrorCode } from '../../core/errors/AppError';
import { isAdmin } from '../../core/middleware/admin.middleware';

export const paymentResolvers: any = {
  Query: {
    paymentByBooking: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return paymentService.getPaymentByBooking(bookingId, ctx.userId, ctx.role === 'ADMIN');
    },

    paymentMethods: async (_: unknown, __: Record<string, never>, ctx: GraphQLContext) => {
      return ctx.prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } });
    },
  },

  Mutation: {
    createCheckoutSession: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return paymentService.createCheckoutSession(bookingId, ctx.userId, ctx.role === 'ADMIN');
    },

    adminRecordBookingPayment: async (
      _: unknown,
      { bookingId, paymentMethodId, amount }: { bookingId: string; paymentMethodId: string; amount: number },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return paymentService.adminRecordBookingPayment({
        bookingId,
        paymentMethodId,
        amount,
        adminId: ctx.userId!,
      });
    },

    adminRefundBookingPayment: async (
      _: unknown,
      { bookingId }: { bookingId: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return paymentService.adminRefundBookingPayment(bookingId, ctx.userId!);
    },

    mockFinalizePayment: async (_: unknown, { bookingId, success }: { bookingId: string; success: boolean }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return paymentService.mockFinalizePayment(bookingId, success);
    },

    // ── PaymentMethod CRUD ─────────────────────────────────────────────────
    createPaymentMethod: async (
      _: unknown,
      { name }: { name: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.paymentMethod.create({ data: { name } });
    },

    updatePaymentMethod: async (
      _: unknown,
      { id, name }: { id: string; name: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.paymentMethod.update({ where: { id }, data: { name } });
    },

    deletePaymentMethod: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      await ctx.prisma.paymentMethod.delete({ where: { id } });
      return true;
    },
  },
};
