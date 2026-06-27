'use client';

import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AdminBookingsContainer } from '@/features/admin/components/AdminBookingsContainer';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

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
