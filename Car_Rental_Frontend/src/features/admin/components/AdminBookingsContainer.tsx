'use client';

import React from 'react';
import { useAdminBookings } from '@/features/bookings/hooks/useAdminBookings';
import { AdminBookingsView } from './AdminBookingsView';
import { useToast } from '@/lib/ToastContext';

export const AdminBookingsContainer: React.FC = () => {
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
  } = useAdminBookings();

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