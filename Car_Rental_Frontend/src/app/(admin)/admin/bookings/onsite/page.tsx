'use client';

import React from 'react';
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
