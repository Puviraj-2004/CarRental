'use client';

import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { BookingContainer } from '@/features/bookings/components/BookingContainer';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

export default function CustomerBookingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingContainer />
    </Suspense>
  );
}