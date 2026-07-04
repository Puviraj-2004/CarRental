'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PageLoader } from '@/components/ui';
import { PaymentContainer } from '@/features/payments/components/PaymentContainer';

export default function BookingPaymentPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  if (!bookingId) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentContainer bookingId={bookingId} />
    </Suspense>
  );
}
