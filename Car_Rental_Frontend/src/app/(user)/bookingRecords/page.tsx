'use client';

import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { BookingRecordsContainer } from '@/features/bookings/components/BookingRecordsContainer';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

export default function CustomerBookingRecordsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingRecordsContainer />
    </Suspense>
  );
}