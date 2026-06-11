import { useQuery } from '@apollo/client';
import { GET_MY_BOOKINGS_QUERY } from '../graphql/queries';
import { Booking } from './useBooking';

export interface PageInfo {
  totalCount:      number;
  totalPages:      number;
  currentPage:     number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface MyBookingsData {
  myBookings: {
    items:    Booking[];
    pageInfo: PageInfo;
  };
}

export interface PaginationInput {
  page?:     number;
  pageSize?: number;
}

export const useBookingRecords = (pagination?: PaginationInput) => {
  const { data, loading, error, refetch } = useQuery<MyBookingsData, { pagination?: PaginationInput }>(
    GET_MY_BOOKINGS_QUERY,
    {
      variables: { pagination },
      notifyOnNetworkStatusChange: true,
    }
  );

  return {
    bookings: data?.myBookings.items || [],
    pageInfo: data?.myBookings.pageInfo,
    loading,
    error,
    refetch,
  };
};