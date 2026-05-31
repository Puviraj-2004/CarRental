import { isAuthenticated } from '../../core/middleware/auth.middleware';
import { isAdmin }         from '../../core/middleware/admin.middleware';
import { GraphQLContext }  from '../../graphql/context';
import { paymentService }  from './payment.service';
import type {
  Resolvers,
  QueryPaymentArgs,
  QueryPaymentByBookingArgs,
  QueryMyPaymentsArgs,
  QueryPaymentsArgs,
  MutationCreateCheckoutSessionArgs,
  MutationRefundPaymentArgs,
} from '../../graphql/__generated__/types';

export const paymentResolvers: Partial<Resolvers> = {
  Payment: {
    amount: (parent) =>
      Number(parent.amount) as unknown as number,
  },

  Query: {
    payment: (
      _: unknown,
      { id }: QueryPaymentArgs,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return paymentService.getPaymentById(
        id,
        ctx.userId!,
        ctx.role === 'ADMIN',
      );
    },

    paymentByBooking: (
      _: unknown,
      { bookingId }: QueryPaymentByBookingArgs,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return paymentService.getPaymentByBooking(
        bookingId,
        ctx.userId!,
        ctx.role === 'ADMIN',
      );
    },

    myPayments: (
      _: unknown,
      { pagination }: QueryMyPaymentsArgs,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return paymentService.getMyPayments(
        ctx.userId!,
        pagination != null
          ? {
              page:     pagination.page     ?? undefined,
              pageSize: pagination.pageSize ?? undefined,
            }
          : undefined,
      );
    },

    payments: (
      _: unknown,
      { pagination }: QueryPaymentsArgs,
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return paymentService.getAllPayments(
        pagination != null
          ? {
              page:     pagination.page     ?? undefined,
              pageSize: pagination.pageSize ?? undefined,
            }
          : undefined,
      );
    },
  },

  Mutation: {
    createCheckoutSession: (
      _: unknown,
      { bookingId }: MutationCreateCheckoutSessionArgs,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return paymentService.createCheckoutSession(
        bookingId,
        ctx.userId!,
        ctx.role === 'ADMIN',
      );
    },

    refundPayment: (
      _: unknown,
      { paymentId }: MutationRefundPaymentArgs,
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return paymentService.refundPayment(paymentId, true);
    },
  },
};