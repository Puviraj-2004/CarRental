import { gql } from 'graphql-tag';

/**
 * Shared Pagination GraphQL Types
 * 
 * Used across all paginated queries (bookings, cars, users).
 * Provides standardized input/output types for offset-based pagination.
 */
export const paginationTypeDefs = gql`
  # ─── Pagination Input ──────────────────────────────────────────
  input PaginationInput {
    page: Int
    pageSize: Int
    search: String
  }

  # ─── Page Info (shared across all paginated results) ───────────
  type PageInfo {
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # ─── Paginated Result Types ────────────────────────────────────
  type PaginatedBookings {
    items: [Booking!]!
    pageInfo: PageInfo!
  }

  type PaginatedCars {
    items: [Car!]!
    pageInfo: PageInfo!
  }

  type PaginatedUsers {
    items: [User!]!
    pageInfo: PageInfo!
  }

  # ─── Dashboard Stats (optimized counts) ────────────────────────
  type DashboardStats {
    totalUsers: Int!
    totalCars: Int!
    totalBookings: Int!
    totalRevenue: Float!
    availableCars: Int!
    recentBookings: [Booking!]!
  }
`;
