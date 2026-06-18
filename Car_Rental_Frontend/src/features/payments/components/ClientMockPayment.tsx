'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { GET_BOOKING_QUERY } from '@/features/bookings/graphql/queries';
import { MOCK_FINALIZE_PAYMENT_MUTATION } from '../graphql/mutations';

export const ClientMockPayment: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  // 1. Fetch current reservation details [1]
  const { data, loading: loadingQuery, error: errorQuery } = useQuery(
    GET_BOOKING_QUERY,
    {
      variables: { id: bookingId },
      fetchPolicy: 'network-only',
    }
  );

  // 2. Mock Finalize Mutation [1]
  const [mockFinalizePayment, { loading: loadingMutation }] = useMutation(
    MOCK_FINALIZE_PAYMENT_MUTATION
  );

  const handleSimulatePayment = async (success: boolean) => {
    setError(null);
    try {
      const res = await mockFinalizePayment({
        variables: { bookingId, success },
      });

      const paymentStatus = res.data?.mockFinalizePayment?.status;

      if (success && paymentStatus === 'PAID') {
        showToast('Mock payment approved! Booking confirmed.', 'success');
        // On success, redirect to your centralized receipt portal [1]
        router.push(`/booking/${bookingId}/success?bookingId=${bookingId}`);
      } else {
        setError('Mock Payment Declined: Insufficient funds or card expired [1].');
        showToast('Payment failed. Please try again.', 'error');
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
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">Reservation details could not be loaded.</Alert>
      </Container>
    );
  }

  // Local VAT calculations [1.2.1]
  const envTaxRate = process.env.NEXT_PUBLIC_TAX_RATE ? parseFloat(process.env.NEXT_PUBLIC_TAX_RATE) : 0.20;
  const basePrice = Number(booking.basePrice);
  const subtotal = basePrice * booking.numberOfDays;
  const taxAmount = subtotal * envTaxRate;
  const totalAmount = subtotal + taxAmount;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      
      {/* ─── Stepped Checkout Banner ──────────────────────────────────── */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'primary.50', p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'primary.100' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Step 1: Reserve (Done)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1 }}>➔</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Step 2: Upload (Done) [1]
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1 }}>➔</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
          Step 3: Sandbox Payment (Active) [1]
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

      <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'warning.main', letterSpacing: '-0.5px' }}>
          Stripe Sandbox Simulator
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          This page is simulating Stripe Checkout offline. Choose an outcome below to test your webhook database transitions [1].
        </Typography>

        {/* Selected Vehicle Profile */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ width: 80, height: 50, borderRadius: '6px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'grey.100', flexShrink: 0 }}>
            <img src={booking.car.primaryImageUrl || 'https://via.placeholder.com/150x90'} alt="Car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {booking.car.model.brand.name} {booking.car.model.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Plate: {booking.car.plateNumber} • {booking.numberOfDays} Days
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Pricing Summary */}
        <Grid container spacing={1.5} sx={{ fontSize: '13px', color: 'text.secondary', mb: 4 }}>
          <Grid item xs={6}>Trip Duration:</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>{booking.numberOfDays} Days</Grid>
          
          <Grid item xs={6}>Subtotal (Net):</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>{subtotal.toFixed(2)} €</Grid>
          
          <Grid item xs={6}>VAT / Tax ({envTaxRate * 100}%):</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>{taxAmount.toFixed(2)} €</Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={6}>
            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '15px' }}>
              Total Estimated
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography color="warning.main" sx={{ fontWeight: 900, fontSize: '16px' }}>
              {totalAmount.toFixed(2)} €
            </Typography>
          </Grid>
        </Grid>

        {/* Action Triggers */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              disabled={loadingMutation}
              onClick={() => handleSimulatePayment(true)}
              startIcon={!loadingMutation && <CheckCircleIcon />}
              sx={{ py: 1.4, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
            >
              {loadingMutation ? <CircularProgress size={20} color="inherit" /> : 'Authorize & Pay'}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              disabled={loadingMutation}
              onClick={() => handleSimulatePayment(false)}
              startIcon={!loadingMutation && <ErrorIcon />}
              sx={{ py: 1.4, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
            >
              {loadingMutation ? <CircularProgress size={20} color="inherit" /> : 'Decline Card'}
            </Button>
          </Grid>
        </Grid>

      </Card>
    </Container>
  );
};