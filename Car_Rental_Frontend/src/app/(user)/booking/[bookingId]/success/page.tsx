'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { PaymentSuccessContainer } from '@/features/payments/components/PaymentSuccessContainer';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

export default function BookingPaymentSuccessPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  if (!bookingId) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentSuccessContainer bookingId={bookingId} />
    </Suspense>
  );
}