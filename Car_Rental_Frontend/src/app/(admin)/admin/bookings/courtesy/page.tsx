'use client';

import React, { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { AdminBookingsContainer } from '@/features/admin/components/AdminBookingsContainer';

export default function AdminCourtesyBookingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminBookingsContainer
        lane="COURTESY"
        title="Courtesy Bookings"
        subtitle="Manage admin-only courtesy bookings. These reservations block availability but do not require payment."
        createHref="/admin/bookings/courtesy/new"
        createLabel="Create Courtesy Booking"
      />
    </Suspense>
  );
}
