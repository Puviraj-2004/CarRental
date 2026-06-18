'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useLanguage } from '@/lib/LanguageContext';
import { useBookingRecords } from '../hooks/useBookingRecords';
import { BookingRecordsView } from './BookingRecordsView';

export const BookingRecordsContainer: React.FC = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);

  // Queries your database for current user sessions
  const { bookings, pageInfo, loading, error } = useBookingRecords({
    page: currentPage,
    pageSize: 5, // 5 records per page for clean desktop and mobile pagination
  });

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
    />
  );
};