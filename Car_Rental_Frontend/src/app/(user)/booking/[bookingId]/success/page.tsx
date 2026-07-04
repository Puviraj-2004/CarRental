'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PageLoader } from '@/components/ui';
import { PaymentSuccessContainer } from '@/features/payments/components/PaymentSuccessContainer';

export default function BookingPaymentSuccessPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  if (!bookingId) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentSuccessContainer bookingId={bookingId} />
    </Suspense>
  );
}
