'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ManageGalleryContainer } from '@/features/cars/components/admin/ManageGalleryContainer';

export default function CarGalleryPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return null;
  }

  return <ManageGalleryContainer id={id} />;
}