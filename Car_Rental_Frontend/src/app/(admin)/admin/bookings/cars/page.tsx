'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { CarsContainer } from '@/components/features/cars/CarsContainer';

function AdminBookingsCarsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingType = searchParams.get('bookingType') || 'RENTAL';
  const isWalkIn = searchParams.get('isWalkIn') === 'true';
  return (
    <CarsContainer defaultBookingType={bookingType} defaultIsWalkIn={isWalkIn} layoutForAdmin showTopBar />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>}>
      <AdminBookingsCarsContent />
    </Suspense>
  );
}