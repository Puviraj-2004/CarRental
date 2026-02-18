'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import { useTranslation } from '@/lib/LanguageContext';
import { VerificationContainer } from '@/components/features/verification/VerificationContainer';
import { AdminVerifyBookingView } from './AdminVerifyBookingView';

interface AdminVerifyBookingContainerProps {
  bookingId: string;
}

export const AdminVerifyBookingContainer: React.FC<AdminVerifyBookingContainerProps> = ({ bookingId }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    fetchPolicy: 'network-only',
  });

  const token = data?.booking?.verification?.token ?? null;

  return (
    <AdminVerifyBookingView
      loading={loading && !data}
      error={error ? { message: t('errors.generic') } : null}
      token={token}
      bookingId={bookingId}
      onGoBack={() => router.back()}
      onOpenBooking={() => router.push(`/admin/bookings/${bookingId}`)}
      t={t}
    >
      {token && <VerificationContainer token={token} />}
    </AdminVerifyBookingView>
  );
};
