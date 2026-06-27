'use client';

import React from 'react';
import { useAdminBookings } from '@/features/bookings/hooks/useAdminBookings';
import { AdminBookingsView } from './AdminBookingsView';
import { useToast } from '@/lib/ToastContext';

type AdminBookingLane = 'ONLINE' | 'ONSITE' | 'COURTESY';

interface AdminBookingsContainerProps {
  lane?: AdminBookingLane;
  title?: string;
  subtitle?: string;
  createHref?: string;
  createLabel?: string;
}

export const AdminBookingsContainer: React.FC<AdminBookingsContainerProps> = ({
  lane,
  title = 'Bookings',
  subtitle = 'Manage reservations, customer details, payments, documents, and handovers.',
  createHref,
  createLabel,
}) => {
  const { showToast } = useToast();
  
  const {
    bookings,
    pageInfo,
    page,
    setPage,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    executeUpdateStatus,
    loadingUpdate,
  } = useAdminBookings(lane);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await executeUpdateStatus(id, status);
      showToast(`Booking status successfully updated to ${status}.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  return (
    <AdminBookingsView
      title={title}
      subtitle={subtitle}
      lane={lane}
      createHref={createHref}
      createLabel={createLabel}
      bookings={bookings}
      pageInfo={pageInfo}
      page={page}
      onPageChange={setPage}
      loading={loading || loadingUpdate}
      error={error ? 'Failed to fetch bookings.' : null}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      onStatusChange={handleStatusChange}
    />
  );
};
