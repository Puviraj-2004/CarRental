import { isAdmin } from '../../core/middleware/admin.middleware';
import { GraphQLContext } from '../../graphql/context';
import { adminService } from './admin.service';

export const adminResolvers: any = {
  AdminDashboardBooking: {
    totalPrice: (parent: any) => Number(parent.totalPrice),
    isWalkIn: (parent: any) => !parent.userId,
    guestEmail: () => null,
    car: (parent: any) => ({
      brand: parent.car.model.brand,
      model: parent.car.model,
    }),
  },

  Query: {
    dashboardStats: (_: unknown, __: Record<string, never>, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return adminService.getDashboardStats();
    },
    adminReports: (
      _: unknown,
      { filter }: { filter?: { startDate?: string | null; endDate?: string | null } },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return adminService.getReports(filter);
    },
  },
};
