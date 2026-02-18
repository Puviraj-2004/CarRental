'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import {
  START_TRIP_MUTATION,
  COMPLETE_TRIP_MUTATION,
  VERIFY_DRIVER_PROFILE_MUTATION,
  CANCEL_BOOKING_MUTATION,
} from '@/lib/graphql/mutations';
import { CREATE_STRIPE_CHECKOUT_SESSION_MUTATION } from '@/lib/graphql/mutations';
import { CONFIRM_RESERVATION_MUTATION } from '@/lib/graphql/mutations';
import { AdminBookingDetailsView } from './AdminBookingDetailsView';
import { useTranslation } from '@/lib/LanguageContext';

interface AdminBookingDetailsContainerProps {
  bookingId: string;
}

export const AdminBookingDetailsContainer = ({ bookingId }: AdminBookingDetailsContainerProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch booking data
  const { data, loading, error, refetch } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    fetchPolicy: 'network-only',
  });

  // Mutations
  const [startTrip] = useMutation(START_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [completeTrip] = useMutation(COMPLETE_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [verifyDoc] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, { onCompleted: () => refetch() });
  const [cancelBookingMutation] = useMutation(CANCEL_BOOKING_MUTATION, { onCompleted: () => refetch() });
  const [confirmReservationMutation] = useMutation(CONFIRM_RESERVATION_MUTATION, { onCompleted: () => refetch() });
  const [createCheckoutSession] = useMutation(CREATE_STRIPE_CHECKOUT_SESSION_MUTATION);

  // Action handlers
  const handleStartTrip = async (bookingId: string, startOdometer?: number, pickupNotes?: string) => {
    try {
      await startTrip({
        variables: {
          bookingId,
          ...(startOdometer !== undefined && { startOdometer }),
          ...(pickupNotes && { pickupNotes }),
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(t('adminBookingDetails.failedToStartTrip'));
    }
  };

  const handleCancelBooking = async (id: string, reason: string) => {
    try {
      await cancelBookingMutation({ variables: { id } });
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleConfirmReservation = async (id: string) => {
    try {
      const { data } = await confirmReservationMutation({ variables: { id } });
      return data?.confirmReservation;
    } catch (e: any) {
      throw new Error(t('adminBookingDetails.failedToGenerateVerification'));
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography color="error" variant="h6">
            {t('admin.failedToLoadBooking')}
          </Typography>
          <Typography color="text.secondary">{t('errors.generic')}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            {t('admin.goBack')}
          </Button>
        </Stack>
      </Box>
    );
  }

  // Not found state
  if (!data?.booking) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">{t('admin.bookingNotFound')}</Typography>
          <Typography color="text.secondary">{t('admin.bookingNotFoundDesc')}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            {t('admin.goBack')}
          </Button>
        </Stack>
      </Box>
    );
  }

  const actions = {
    startTrip: handleStartTrip,
    completeTrip,
    verifyDoc,
    cancelBooking: handleCancelBooking,
    confirmReservation: handleConfirmReservation,
    refreshBooking: refetch,
    createCheckoutSession: async (id: string) => {
      const res = await createCheckoutSession({ variables: { bookingId: id } });
      return res?.data?.createStripeCheckoutSession;
    },
  };

  return (
    <AdminBookingDetailsView
      booking={data.booking}
      actions={actions}
      onBack={handleBack}
      t={t}
    />
  );
};

export default AdminBookingDetailsContainer;
