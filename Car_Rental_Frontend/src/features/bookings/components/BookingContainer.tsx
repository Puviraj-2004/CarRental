'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { useBooking } from '../hooks/useBooking';
import { BookingView } from './BookingView';
import { GET_CAR_QUERY } from '@/features/cars/graphql/queries';

export const BookingContainer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { executeCreate, loadingCreate } = useBooking();
  const [error, setError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // 1. Read parameters from URL query parameters
  const carId = searchParams.get('carId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const hasDates = !!(startDate && endDate);

  // 2. Fetch selected car details
  const { data: carData, loading: loadingCar, error: errorCar } = useQuery(
    GET_CAR_QUERY,
    {
      variables: { id: carId },
      skip: !carId,
      fetchPolicy: 'cache-first',
    }
  );

  useEffect(() => {
    if (!carId || !hasDates) {
      showToast('Missing booking parameters. Redirecting to fleet...', 'error');
      router.push('/cars');
    }
  }, [carId, hasDates, router, showToast]);

  // Calculates trip duration in days
  const getBookingDurationDays = (): number => {
    if (!hasDates) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const bookingDuration = getBookingDurationDays();
  const car = carData?.car;

  const getTaxRate = (): number => {
    const envRate = process.env.NEXT_PUBLIC_TAX_RATE;
    if (!envRate) return 0.20; 
    const parsed = parseFloat(envRate);
    return isNaN(parsed) ? 0.20 : parsed;
  };

  const taxRate = getTaxRate();
  const subtotal = car ? Number(car.basePrice) * bookingDuration : 0;
  const taxAmount = subtotal * taxRate;
  const estimatedTotal = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const nameInput = formData.get('guestName') as string;
    const phoneInput = formData.get('guestPhone') as string;
    const notes = formData.get('notes') as string;

    if (!nameInput.trim() || !phoneInput.trim()) {
      setError('Please provide your full name and phone number.');
      return;
    }

    try {
      const isoStart = `${startDate}T12:00:00.000Z`;
      const isoEnd = `${endDate}T12:00:00.000Z`;

      const res = await executeCreate({
        carId,
        startDate: isoStart,
        endDate: isoEnd,
        guestName: nameInput,
        guestPhone: phoneInput,
        notes: notes || undefined,
        type: 'RENTAL'
      });

      const newBookingId = res.data?.createBooking?.id;

      if (newBookingId) {
        showToast('Reservation initialized. Redirecting to document upload...', 'success');
        // Corrected Redirect: Forward to the newly created Document Upload route [1]
        router.push(`/booking/${newBookingId}/documents`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const isPreparing = loadingCar;

  if (isPreparing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorCar || !car) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">Vehicle details could not be loaded. Please select a valid car.</Alert>
      </Container>
    );
  }

  return (
    <BookingView
      t={t}
      car={car}
      startDate={startDate}
      endDate={endDate}
      bookingDuration={bookingDuration}
      subtotal={subtotal}
      taxAmount={taxAmount}
      estimatedTotal={estimatedTotal}
      taxPercentage={taxRate * 100}
      onSubmit={handleSubmit}
      error={error}
      loading={loadingCreate}
    />
  );
};