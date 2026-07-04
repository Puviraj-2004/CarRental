'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PageLoader } from '@/components/ui';
import { AdminDocumentsContainer } from '@/features/admin/components/AdminDocumentsContainer';

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
