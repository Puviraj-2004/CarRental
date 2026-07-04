'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PageLoader } from '@/components/ui';
import { DocumentUploadContainer } from '@/features/documents/components/DocumentUploadContainer';

export default function BookingDocumentsPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  if (!bookingId) {
    return null;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <DocumentUploadContainer bookingId={bookingId} />
    </Suspense>
  );
}
