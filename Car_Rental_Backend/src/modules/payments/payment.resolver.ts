import { paymentService } from './payment.service';
import { GraphQLContext } from '../../graphql/context';
import { AppError, ErrorCode } from '../../core/errors/AppError';

export const paymentResolvers: any = {
  Query: {
    paymentByBooking: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return paymentService.getPaymentByBooking(bookingId, ctx.userId, ctx.role === 'ADMIN');
    },
  },

  Mutation: {
    createCheckoutSession: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return paymentService.createCheckoutSession(bookingId, ctx.userId, ctx.role === 'ADMIN');
    },

    mockFinalizePayment: async (_: unknown, { bookingId, success }: { bookingId: string; success: boolean }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return paymentService.mockFinalizePayment(bookingId, success);
    },
  },
};