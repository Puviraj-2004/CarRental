'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useLanguage } from '@/lib/LanguageContext';
import { PaymentSuccessView } from './PaymentSuccessView';
import { GET_BOOKING_QUERY } from '@/features/bookings/graphql/queries';

export const PaymentSuccessContainer: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { t } = useLanguage();

  const { data, loading, error, refetch, stopPolling, startPolling } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId,
    fetchPolicy: 'network-only',
    pollInterval: 0, // Start without polling, we'll enable it manually
  });

  const booking = data?.booking;

  // Poll every 2 seconds while status is not CONFIRMED to handle webhook delay
  useEffect(() => {
    if (!bookingId || !booking) return;

    if (booking.status === 'CONFIRMED') {
      // Status is confirmed, stop polling
      stopPolling?.();
    } else {
      // Status not yet confirmed, start polling
      startPolling?.(2000);
    }

    return () => {
      stopPolling?.();
    };
  }, [booking?.status, bookingId, startPolling, stopPolling]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">Receipt details could not be loaded. Please check your Dashboard.</Alert>
      </Container>
    );
  }

  const subtotal = Number(booking.subtotal);
  const totalAmount = Number(booking.totalPrice);
  const taxAmount = Number(booking.taxAmount);
  const taxPercentage = Number(booking.taxRate) * 100;

  return (
    <PaymentSuccessView
      t={t}
      booking={booking}
      bookingId={bookingId}
      subtotal={subtotal}
      taxAmount={taxAmount}
      totalAmount={totalAmount}
      taxPercentage={taxPercentage}
    />
  );
};
