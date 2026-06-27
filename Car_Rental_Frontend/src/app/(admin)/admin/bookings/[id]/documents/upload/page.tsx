'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { DocumentUploadContainer } from '@/features/documents/components/DocumentUploadContainer';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

export default function AdminUploadBookingDocumentsPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) return null;

  return (
    <Suspense fallback={<PageLoader />}>
      <DocumentUploadContainer bookingId={id} adminMode returnTo={`/admin/bookings/${id}`} />
    </Suspense>
  );
}
