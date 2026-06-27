'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useLanguage } from '@/lib/LanguageContext';
import { useBookingRecords } from '../hooks/useBookingRecords';
import { useBooking } from '../hooks/useBooking';
import { BookingRecordsView } from './BookingRecordsView';
import { useToast } from '@/lib/ToastContext';

export const BookingRecordsContainer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Queries your database for current user sessions
  const { bookings, pageInfo, loading, error, refetch } = useBookingRecords({
    page: currentPage,
    pageSize: 5, // 5 records per page for clean desktop and mobile pagination
  });

  const { executeCancel, loadingCancel, executeExtend, loadingExtend } = useBooking();

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await executeCancel(bookingId);
      showToast(t('booking.cancelSuccess') || 'Booking cancelled successfully', 'success');
      refetch?.();
    } catch (err) {
      showToast((err as Error).message || t('common.error') || 'Failed to cancel booking', 'error');
    }
  };

  const handleExtendBooking = async (bookingId: string, newEndDate: string) => {
    try {
      await executeExtend(bookingId, newEndDate);
      showToast(t('booking.extendSuccess') || 'Booking extended successfully', 'success');
      refetch?.();
    } catch (err) {
      showToast((err as Error).message || t('common.error') || 'Failed to extend booking', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPreparing = loading && bookings.length === 0;

  if (isPreparing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BookingRecordsView
      t={t}
      bookings={bookings}
      pageInfo={pageInfo}
      loading={loading}
      error={error ? t('common.error') : null}
      onPageChange={handlePageChange}
      onCancel={handleCancelBooking}
      onExtend={handleExtendBooking}
      loadingCancel={loadingCancel}
      loadingExtend={loadingExtend}
    />
  );
};