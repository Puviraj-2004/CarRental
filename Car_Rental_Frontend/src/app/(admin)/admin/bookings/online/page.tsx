'use client';

import React, { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { AdminBookingsContainer } from '@/features/admin/components/AdminBookingsContainer';

export default function AdminOnlineBookingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminBookingsContainer
        lane="ONLINE"
        title="Online Bookings"
        subtitle="Manage customer-created rental bookings with user accounts, payment, and document verification."
      />
    </Suspense>
  );
}
