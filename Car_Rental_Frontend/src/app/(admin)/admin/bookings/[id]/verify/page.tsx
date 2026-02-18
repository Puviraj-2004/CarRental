'use client';

import { use } from 'react';
import { AdminVerifyBookingContainer } from '@/components/features/admin/bookings/AdminVerifyBookingContainer';

export default function AdminBookingVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminVerifyBookingContainer bookingId={id} />;
}
