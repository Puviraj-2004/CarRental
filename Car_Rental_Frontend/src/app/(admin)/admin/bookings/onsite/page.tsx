'use client';

import React from 'react';
import { PageLoader } from '@/components/ui';
import { AdminBookingsContainer } from '@/features/admin/components/AdminBookingsContainer';

export default function AdminBookingsOnsitePage() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <AdminBookingsContainer
        lane="ONSITE"
        title="Onsite Rentals"
        subtitle="Manage walk-in rental bookings created by staff without a linked user account."
        createHref="/admin/bookings/onsite/new"
        createLabel="Create Onsite Rental"
      />
    </React.Suspense>
  );
}
