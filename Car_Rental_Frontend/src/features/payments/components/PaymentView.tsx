'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

interface PaymentViewProps {
  t: (path: string) => string;
  booking: any;
  bookingId: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxPercentage: number;
  onPay: () => void;
  error: string | null;
  loading: boolean;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  t,
  booking,
  bookingId,
  subtotal,
  taxAmount,
  totalAmount,
  taxPercentage,
  onPay,
  error,
  loading,
}) => {
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
          Step 3: Payment (Active) [1]
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

      <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          Secure Payment Portal
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          Please review your booking invoices and click below to pay.
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

        {/* Dynamic Pricing Breakdown */}
        <Grid container spacing={1.5} sx={{ fontSize: '13px', color: 'text.secondary', mb: 3 }}>
          <Grid item xs={6}>Trip Duration:</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>{booking.numberOfDays} Days</Grid>
          
          <Grid item xs={6}>Subtotal (Net):</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>{subtotal.toFixed(2)} €</Grid>
          
          <Grid item xs={6}>VAT / Tax ({taxPercentage}%):</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>{taxAmount.toFixed(2)} €</Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={6}>
            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '15px' }}>
              Total Payable
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography color="secondary.main" sx={{ fontWeight: 900, fontSize: '16px' }}>
              {totalAmount.toFixed(2)} €
            </Typography>
          </Grid>
        </Grid>

        {/* CTA Payment Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onPay}
            disabled={loading}
            startIcon={!loading && <CreditCardIcon />}
            sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Redirecting securely...</Typography>
              </Box>
            ) : (
              'Proceed to Secure Payment'
            )}
          </Button>

          <Button
            component={Link}
            href={`/bookingRecords`}
            variant="outlined"
            disabled={loading}
            startIcon={<ArrowBackIcon />}
            sx={{ py: 1.4, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
          >
            Pay Later from Dashboard
          </Button>
        </Box>

      </Card>
    </Container>
  );
};