'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AdminDocumentsContainer } from '@/features/admin/components/AdminDocumentsContainer';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

export default function AdminDocumentsPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AdminDocumentsContainer bookingId={id} />
    </Suspense>
  );
}