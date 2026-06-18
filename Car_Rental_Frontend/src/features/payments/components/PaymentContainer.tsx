'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { GET_BOOKING_QUERY } from '@/features/bookings/graphql/queries';
import { PaymentView } from './PaymentView';
import { gql } from '@apollo/client';

export const CREATE_CHECKOUT_SESSION_MUTATION = gql`
  mutation CreateCheckoutSession($bookingId: ID!) {
    createCheckoutSession(bookingId: $bookingId) {
      url
      sessionId
    }
  }
`;

export const PaymentContainer: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Reservation details
  const { data, loading: loadingQuery, error: errorQuery } = useQuery(
    GET_BOOKING_QUERY,
    {
      variables: { id: bookingId },
      skip: !bookingId,
      fetchPolicy: 'network-only',
    }
  );

  // 2. Checkout Session Mutation
  const [createCheckoutSession, { loading: loadingMutation }] = useMutation(
    CREATE_CHECKOUT_SESSION_MUTATION
  );

  useEffect(() => {
    if (!bookingId) {
      showToast('Missing booking reference. Redirecting to fleet...', 'error');
      router.push('/cars');
    }
  }, [bookingId, router, showToast]);

  const handleProceedToPayment = async () => {
    setError(null);
    try {
      const res = await createCheckoutSession({
        variables: { bookingId },
      });

      const checkoutUrl = res.data?.createCheckoutSession?.url;

      if (checkoutUrl) {
        showToast('Secure payment tunnel initialized. Redirecting...', 'success');
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const booking = data?.booking;
  const isPreparing = loadingQuery;

  if (isPreparing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorQuery || !booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">Reservation details could not be loaded. Please verify your link.</Alert>
      </Container>
    );
  }

  // 3. Dynamic Environment-Backed Tax Calculations [1.2.1]
  const getTaxRate = (): number => {
    const envRate = process.env.NEXT_PUBLIC_TAX_RATE;
    if (!envRate) return 0.20; // Default fallback (20%) [1]
    const parsed = parseFloat(envRate);
    return isNaN(parsed) ? 0.20 : parsed;
  };

  const taxRate = getTaxRate();
  const basePrice = Number(booking.basePrice);
  const subtotal = basePrice * booking.numberOfDays;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return (
    <PaymentView
      t={t}
      booking={booking}
      bookingId={bookingId}
      subtotal={subtotal}
      taxAmount={taxAmount}
      totalAmount={totalAmount}
      taxPercentage={taxRate * 100}
      onPay={handleProceedToPayment}
      error={error}
      loading={loadingMutation}
    />
  );
};