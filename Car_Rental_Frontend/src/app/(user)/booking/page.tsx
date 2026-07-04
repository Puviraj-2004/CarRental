'use client';

import React, { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { BookingContainer } from '@/features/bookings/components/BookingContainer';

export default function CustomerBookingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingContainer />
    </Suspense>
  );
}
