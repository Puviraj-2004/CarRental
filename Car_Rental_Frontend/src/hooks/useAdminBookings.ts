import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { 
  UPDATE_BOOKING_STATUS_MUTATION, 
  START_TRIP_MUTATION, 
  COMPLETE_TRIP_MUTATION,
  VERIFY_DRIVER_PROFILE_MUTATION,
  FINISH_CAR_MAINTENANCE_MUTATION,
  CANCEL_BOOKING_MUTATION // Ensure this exists in your mutations file
} from '@/lib/graphql/mutations';

type BookingFilterOptions = {
  bookingType?: 'RENTAL' | 'REPLACEMENT';
  walkInOnly?: boolean;
};

const DEFAULT_PAGE_SIZE = 20;

export const useAdminBookings = (filterOptions?: BookingFilterOptions) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, loading, error, refetch } = useQuery(GET_ALL_BOOKINGS_QUERY, {
    variables: {
      pagination: {
        page,
        pageSize,
        search: searchQuery || undefined,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, { onCompleted: () => refetch() });
  const [startTrip] = useMutation(START_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [completeTrip] = useMutation(COMPLETE_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [verifyDoc] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, { onCompleted: () => refetch() });
  const [finishMaintenance] = useMutation(FINISH_CAR_MAINTENANCE_MUTATION, { onCompleted: () => refetch() });
  const [cancelBooking] = useMutation(CANCEL_BOOKING_MUTATION, { onCompleted: () => refetch() });

  const paginatedResult = data?.bookings;
  const rawBookings = paginatedResult?.items || [];
  const pageInfo = paginatedResult?.pageInfo;

  // Client-side filters that are lightweight (status, booking type, walkIn)
  const filteredBookings = useMemo(() => {
    return rawBookings.filter((b: any) => {
      // Pre-filter by view
      if (filterOptions?.bookingType && b.bookingType !== filterOptions.bookingType) return false;
      if (filterOptions?.walkInOnly && !b.isWalkIn) return false;

      // Status Filter (client-side since it's a simple enum filter)
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

      return true;
    });
  }, [rawBookings, statusFilter, filterOptions]);

  // Reset to page 1 when search changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Handle Cancellation
  const handleCancelBooking = async (id: string, reason: string) => {
    try {
      await cancelBooking({ variables: { id } });
      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle Start Trip with Odometer
  const handleStartTrip = async (bookingId: string, startOdometer?: number, pickupNotes?: string) => {
    try {
      await startTrip({ 
        variables: { 
          bookingId,
          ...(startOdometer !== undefined && { startOdometer }),
          ...(pickupNotes && { pickupNotes })
        } 
      });
      return true;
    } catch (e: any) {
      throw new Error('Failed to start trip');
    }
  };

  return {
    bookings: filteredBookings,
    totalCount: pageInfo?.totalCount || 0,
    pageInfo,
    page,
    pageSize,
    setPage,
    setPageSize,
    loading,
    error,
    refetch,
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter,
    actions: { 
      updateStatus, 
      startTrip: handleStartTrip,
      completeTrip, 
      verifyDoc, 
      finishMaintenance,
      cancelBooking: handleCancelBooking,
      refreshBooking: refetch
    }
  };
};