// import { useQuery } from '@apollo/client';
// import { GET_DASHBOARD_STATS_QUERY } from '@/lib/graphql/queries';
// import { useSession } from 'next-auth/react';

// export const useAdminDashboard = () => {
//   const { data: session, status } = useSession();
//   const hasAccessToken = !!(session as any)?.accessToken;

//   const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_STATS_QUERY, {
//     fetchPolicy: 'cache-and-network',
//     skip: status !== 'authenticated' || !hasAccessToken,
//   });

//   const dashboardData = data?.dashboardStats;

//   const stats = {
//     totalUsers: dashboardData?.totalUsers || 0,
//     totalCars: dashboardData?.totalCars || 0,
//     totalBookings: dashboardData?.totalBookings || 0,
//     totalRevenue: dashboardData?.totalRevenue || 0,
//     recentBookings: dashboardData?.recentBookings || [],
//     availableCars: dashboardData?.availableCars || 0,
//   };

//   return { stats, loading, error, refetch };
// };