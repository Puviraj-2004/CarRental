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
