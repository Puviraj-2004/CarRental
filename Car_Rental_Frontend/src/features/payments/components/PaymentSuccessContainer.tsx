'use client';

import React from 'react';
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

  const { data, loading, error } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId,
    fetchPolicy: 'network-only',
  });

  const booking = data?.booking;

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

  // Centralised calculations [1.2.1]
  const basePrice = Number(booking.basePrice);
  const subtotal = basePrice * booking.numberOfDays;
  const envTaxRate = process.env.NEXT_PUBLIC_TAX_RATE ? parseFloat(process.env.NEXT_PUBLIC_TAX_RATE) : 0.20;
  const taxAmount = subtotal * envTaxRate;
  const totalAmount = subtotal + taxAmount;

  return (
    <PaymentSuccessView
      t={t}
      booking={booking}
      bookingId={bookingId}
      subtotal={subtotal}
      taxAmount={taxAmount}
      totalAmount={totalAmount}
      taxPercentage={envTaxRate * 100}
    />
  );
};