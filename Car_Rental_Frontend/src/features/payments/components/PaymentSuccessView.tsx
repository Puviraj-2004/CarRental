'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArticleIcon from '@mui/icons-material/Article';
import Link from 'next/link';

interface PaymentSuccessViewProps {
  t: (path: string) => string;
  booking: any;
  bookingId: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxPercentage: number;
}

export const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({
  t,
  booking,
  bookingId,
  subtotal,
  taxAmount,
  totalAmount,
  taxPercentage,
}) => {
  const docStatus = booking.documents?.status || 'PENDING';

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      {/* ─── Success Confirmation Header ─────────────────────────────── */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1px' }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Your car has been successfully booked and confirmed [1].
        </Typography>
      </Box>

      {/* ─── Invoice and Receipt Card ─────────────────────────────────── */}
      <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', mb: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArticleIcon sx={{ color: 'primary.main' }} />
            Receipt Details
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>
            ID: {booking.id.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>

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

        {/* Invoice Grid Details */}
        <Grid container spacing={1.5} sx={{ fontSize: '13px', color: 'text.secondary', mb: 3 }}>
          <Grid item xs={6}>Pick-up Date:</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
            {new Date(booking.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
          </Grid>
          <Grid item xs={6}>Return Date:</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
            {new Date(booking.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
          </Grid>
          
          <Grid item xs={6}>Subtotal (Net):</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>{subtotal.toFixed(2)} €</Grid>
          
          <Grid item xs={6}>VAT / Tax ({taxPercentage}%):</Grid>
          <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>{taxAmount.toFixed(2)} €</Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={6}>
            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '14px' }}>
              Total Charged
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography color="success.main" sx={{ fontWeight: 900, fontSize: '16px' }}>
              {totalAmount.toFixed(2)} €
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Document verification state */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            KYC Verification:
          </Typography>
          {docStatus === 'PENDING' ? (
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #fbbf24' }}>
              Pending Admin Approval
            </Box>
          ) : (
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669', border: '1px solid #34d399' }}>
              Approved
            </Box>
          )}
        </Box>

      </Card>

      {/* ─── Actions ─────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          component={Link}
          href="/bookingRecords"
          variant="contained"
          fullWidth
          sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
        >
          Go to My Bookings
        </Button>
        <Button
          component={Link}
          href="/cars"
          variant="outlined"
          fullWidth
          sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
        >
          Book Another Car
        </Button>
      </Box>
    </Box>
  );
};