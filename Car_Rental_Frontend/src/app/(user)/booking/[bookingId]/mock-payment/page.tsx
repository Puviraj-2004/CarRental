'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ClientMockPayment } from '@/features/payments/components/ClientMockPayment'; // Adjust import if needed

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

export default function BookingMockPaymentPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  if (!bookingId) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <ClientMockPayment bookingId={bookingId} />
    </Suspense>
  );
}