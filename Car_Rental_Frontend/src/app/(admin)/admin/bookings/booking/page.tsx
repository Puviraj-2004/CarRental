import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { BookingContainer } from '@/components/features/booking/BookingContainer';

export default function AdminBookingPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>}>
      <BookingContainer />
    </Suspense>
  );
}
