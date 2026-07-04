'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PageLoader } from '@/components/ui';
import { DocumentUploadContainer } from '@/features/documents/components/DocumentUploadContainer';

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
