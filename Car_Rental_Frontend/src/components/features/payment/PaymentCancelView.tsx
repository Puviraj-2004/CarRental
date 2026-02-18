'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Stack, Container } from '@mui/material';
import { ErrorOutline as ErrorIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import Link from 'next/link';

interface PaymentCancelViewProps {
  bookingId: string | null;
  t: (key: string, params?: Record<string, string>) => string;
}

export const PaymentCancelView = ({ bookingId, t }: PaymentCancelViewProps) => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 6, 
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <ErrorIcon sx={{ fontSize: 80, color: '#EF4444' }} />
          </Box>
          
          <Typography variant="h4" fontWeight={900} color="#0F172A" gutterBottom>
            {t('payment.paymentCancelled')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('payment.transactionNotCompleted')}
          </Typography>

          {bookingId && (
            <Typography variant="caption" sx={{ display: 'block', mb: 4, color: '#94A3B8', fontFamily: 'monospace' }}>
              {t('payment.referenceId')}: {bookingId.toUpperCase()}
            </Typography>
          )}

          <Stack spacing={2}>
            <Button 
              variant="contained" 
              fullWidth
              component={Link}
              href={`/booking?bookingId=${bookingId}`}
              sx={{ 
                bgcolor: '#0F172A', 
                py: 1.5, 
                borderRadius: 3, 
                fontWeight: 700,
                textTransform: 'none'
              }}
            >
              {t('payment.tryPayAgain')}
            </Button>
            
            <Button 
              variant="text" 
              fullWidth
              startIcon={<BackIcon />}
              component={Link}
              href="/bookingRecords"
              sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none' }}
            >
              {t('payment.goToBookings')}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};