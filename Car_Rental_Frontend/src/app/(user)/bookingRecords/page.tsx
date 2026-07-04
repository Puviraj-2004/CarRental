'use client';

import React, { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { BookingRecordsContainer } from '@/features/bookings/components/BookingRecordsContainer';

export default function CustomerBookingRecordsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingRecordsContainer />
    </Suspense>
  );
}
