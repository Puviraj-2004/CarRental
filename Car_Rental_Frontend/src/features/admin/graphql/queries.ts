import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS_QUERY = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalCars
      totalBookings
      totalRevenue
      availableCars
      recentBookings {
        id
        isWalkIn
        guestName
        guestEmail
        guestPhone
        totalPrice
        status
        reminderSentAt
        createdAt
        user {
          id
          fullName
          email
          phoneNumber
        }
        car {
          brand { name }
          model { name }
        }
      }
    }
  }
`;