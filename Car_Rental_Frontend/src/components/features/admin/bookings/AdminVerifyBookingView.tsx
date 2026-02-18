'use client';

import React from 'react';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface AdminVerifyBookingViewProps {
  loading: boolean;
  error: { message: string } | null;
  token: string | null;
  bookingId: string;
  onGoBack: () => void;
  onOpenBooking: () => void;
  t: (key: string) => string;
  children?: React.ReactNode;
}

export const AdminVerifyBookingView: React.FC<AdminVerifyBookingViewProps> = ({
  loading, error, token, onGoBack, onOpenBooking, t, children,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography color="error" variant="h6">
            {t('admin.failedToLoadBooking')}
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={onGoBack}>
            {t('admin.goBack')}
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!token) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">{t('admin.verificationNotAvailable')}</Typography>
          <Typography color="text.secondary">
            {t('admin.verificationNotAvailableBooking')}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={onGoBack}>
              {t('admin.goBack')}
            </Button>
            <Button variant="contained" onClick={onOpenBooking}>
              {t('admin.openBooking')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
};
