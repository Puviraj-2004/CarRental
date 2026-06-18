'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import type { PageInfo } from '../hooks/useBookingRecords';
import type { Booking } from '../hooks/useBooking';

export const GET_ADMIN_BOOKINGS_QUERY = gql`
  query GetAdminBookings($pagination: PaginationInput, $filter: BookingFilterInput) {
    bookings(pagination: $pagination, filter: $filter) {
      items {
        id
        startDate
        endDate
        numberOfDays
        totalPrice
        status
        type
        guestName
        guestPhone
        createdAt
        user {
          id
          email
        }
        car {
          id
          plateNumber
          model {
            name
            brand {
              name
            }
          }
        }
        documents {
          id
          status
        }
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
      }
    }
  }
`;

export const ADMIN_UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation AdminUpdateBookingStatus($id: ID!, $status: BookingStatus!) {
    adminUpdateBookingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export interface UseAdminBookingsReturn {
  bookings:         Booking[];
  totalCount:       number;
  pageInfo?:        PageInfo;
  page:             number;
  setPage:          (page: number) => void;
  loading:          boolean;
  error:            any;
  refetch:          () => void;
  searchQuery:      string;
  setSearchQuery:   (query: string) => void;
  statusFilter:     string;
  setStatusFilter:  (status: string) => void;
  executeUpdateStatus: (id: string, status: string) => Promise<any>;
  loadingUpdate:    boolean;
}

export const useAdminBookings = (): UseAdminBookingsReturn => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_BOOKINGS_QUERY, {
    variables: {
      pagination: {
        page,
        pageSize: 10,
        search: searchQuery || undefined,
      },
      filter: statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
    },
    fetchPolicy: 'network-only',
  });

  const [adminUpdateBookingStatus, { loading: loadingUpdate }] = useMutation(
    ADMIN_UPDATE_BOOKING_STATUS_MUTATION,
    { onCompleted: () => refetch() }
  );

  const executeUpdateStatus = async (id: string, status: string) => {
    return await adminUpdateBookingStatus({
      variables: { id, status },
    });
  };

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to page 1 on active search changes
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to page 1 on filter adjustments
  }, []);

  return {
    bookings: data?.bookings?.items || [],
    totalCount: data?.bookings?.pageInfo?.totalCount || 0,
    pageInfo: data?.bookings?.pageInfo,
    page,
    setPage,
    loading,
    error,
    refetch,
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    executeUpdateStatus,
    loadingUpdate,
  };
};