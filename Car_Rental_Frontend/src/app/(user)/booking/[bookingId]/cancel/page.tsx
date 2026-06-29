'use client';

import React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function BookingPaymentCancelPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const { t } = useLanguage();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 1, bgcolor: 'warning.light', color: 'warning.dark' }}>
            <WarningAmberRoundedIcon />
          </Box>

          <Box>
            <Typography variant="h3" component="h1">
              {t('payment.cancelled.title')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('payment.cancelled.subtitle')}
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ width: '100%' }}>
            {bookingId && (
              <Button
                variant="contained"
                component={Link}
                href={`/booking/${bookingId}/payment`}
                startIcon={<ReplayRoundedIcon />}
                fullWidth
              >
                {t('payment.cancelled.retry')}
              </Button>
            )}
            <Button
              variant="outlined"
              component={Link}
              href="/bookingRecords"
              startIcon={<ArrowBackRoundedIcon />}
              fullWidth
            >
              {t('payment.cancelled.back')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
