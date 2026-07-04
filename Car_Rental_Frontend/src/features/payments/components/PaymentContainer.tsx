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
      showToast(t('payment.checkout.missingReference'), 'error');
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
        showToast(t('payment.checkout.redirectStarted'), 'success');
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
        <Alert severity="error">{t('payment.checkout.loadError')}</Alert>
      </Container>
    );
  }

  const subtotal = Number(booking.subtotal);
  const totalAmount = Number(booking.totalPrice);
  const taxAmount = Number(booking.taxAmount);
  const taxPercentage = Number(booking.taxRate) * 100;

  return (
    <PaymentView
      t={t}
      booking={booking}
      bookingId={bookingId}
      subtotal={subtotal}
      taxAmount={taxAmount}
      totalAmount={totalAmount}
      taxPercentage={taxPercentage}
      onPay={handleProceedToPayment}
      error={error}
      loading={loadingMutation}
    />
  );
};
