'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { Divider } from '@mui/material';

export default function BookingPaymentCancelPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card 
        variant="outlined" 
        sx={{ 
          p: { xs: 4, md: 5 }, 
          borderRadius: '16px', 
          textAlign: 'center', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.02)' 
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          Payment Cancelled
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
          Your transaction session was closed, and no charges were made. Your vehicle reservation is still temporarily held [1].
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bookingId && (
            <Button
              variant="contained"
              component={Link}
              href={`/booking/${bookingId}/payment`} // <-- Guides back to try checkout again [1]
              sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
            >
              Retry Payment
            </Button>
          )}
          <Button
            variant="outlined"
            component={Link}
            href="/bookingRecords"
            startIcon={<ArrowBackIcon />}
            sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
          >
            Back to My Bookings
          </Button>
        </Box>
      </Card>
    </Container>
  );
}