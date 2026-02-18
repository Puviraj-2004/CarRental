'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addHours, isBefore, isSameDay, isToday } from 'date-fns';
import { useCars } from '@/hooks/graphql/useCars';
import { useTranslation } from '@/lib/LanguageContext';
import { CarsView } from './CarsView';

export const CarsContainer = ({ defaultBookingType, defaultIsWalkIn, showTopBar = true, layoutForAdmin = false }: { defaultBookingType?: string; defaultIsWalkIn?: boolean; showTopBar?: boolean; layoutForAdmin?: boolean } = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const topBarRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Read admin/user booking params from URL
  const bookingTypeParam = searchParams.get('bookingType');
  const isWalkInParam = searchParams.get('isWalkIn');

  const bookingType = bookingTypeParam || defaultBookingType || undefined;
  const isWalkIn = typeof isWalkInParam === 'string' ? (isWalkInParam === 'true') : (defaultIsWalkIn ? true : undefined);

  const [mainFilter, setMainFilter] = useState({ startDate: '', startTime: '', endDate: '', endTime: '' });
  const [touched, setTouched] = useState({ startDate: false, startTime: false, endDate: false, endTime: false });
  const [secondaryFilter, setSecondaryFilter] = useState({ fuelTypes: [], transmissions: [], brandIds: [], critAirRatings: [] });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'warning' as any });

  const { filterPayload, isValidSelection, hasDates, shouldSkip, validationError } = useMemo(() => {
    let payload: any = {
      fuelTypes: secondaryFilter.fuelTypes.length ? secondaryFilter.fuelTypes : undefined,
      transmissions: secondaryFilter.transmissions.length ? secondaryFilter.transmissions : undefined,
      brandIds: secondaryFilter.brandIds.length ? secondaryFilter.brandIds : undefined,
      critAirRatings: secondaryFilter.critAirRatings.length ? secondaryFilter.critAirRatings : undefined,
    };

    const isFilled = !!(mainFilter.startDate && mainFilter.startTime && mainFilter.endDate && mainFilter.endTime);
    if (!isFilled) {
      return { filterPayload: payload, isValidSelection: false, hasDates: false, shouldSkip: false, validationError: '' };
    }

    const start = new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`);
    const end = new Date(`${mainFilter.endDate}T${mainFilter.endTime}:00`);
    const nowDate = new Date();
    const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const pickupDate = new Date(mainFilter.startDate);
    const minPickupTime = addHours(nowDate, 1);
    
    let valid = true;
    let validationError = '';
    
    // Validation 1: Pickup date cannot be before today
    if (pickupDate < today) {
      valid = false;
      validationError = t('validation.pickupDateFuture');
    }
    // Validation 2: Pickup time must be at least 1 hour from now (if today)
    else if (isToday(pickupDate) && isBefore(start, minPickupTime)) {
      valid = false;
      validationError = t('validation.pickupTimeMinHour');
    }
    // Validation 3: Return date must be same or later than pickup date
    else if (end < start) {
      valid = false;
      validationError = t('validation.returnAfterPickup');
    }
    // Validation 4: If same day, minimum 2-hour duration
    else if (isSameDay(start, end)) {
      const durationHours = (end.getTime() - start.getTime()) / 36e5;
      if (durationHours < 2) {
        valid = false;
        validationError = t('validation.minDurationSameDay');
      }
    }

    if (valid) {
      payload.startDate = start.toISOString();
      payload.endDate = end.toISOString();
    }

    return { filterPayload: payload, isValidSelection: valid, hasDates: true, shouldSkip: !valid, validationError };
  }, [mainFilter, secondaryFilter]);

  const { cars, enums, brands, loading } = useCars(filterPayload, shouldSkip);

  const handleBookClick = (car: any) => {
    // 1. Validate Selection
    if (!hasDates || !isValidSelection) {
      if (topBarRef.current) {
        topBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setAlert({ open: true, message: validationError || t('validation.selectValidDates'), severity: 'warning' });
      // Mark fields as touched to show errors in UI
      setTouched({ startDate: true, startTime: true, endDate: true, endTime: true });
      return;
    }

    // 2. Construct URL Parameters
    // We combine date and time into the ISO-like format expected by BookingContainer
    const startDateTime = `${mainFilter.startDate}T${mainFilter.startTime}`;
    const endDateTime = `${mainFilter.endDate}T${mainFilter.endTime}`;


    const params: Record<string, string> = {
      carId: car.id,
      start: startDateTime,
      end: endDateTime
    };
    const bookingTypeToSend = bookingType || defaultBookingType || 'RENTAL';
    if (bookingTypeToSend) params.bookingType = bookingTypeToSend;
    const isWalkInFlag = !!isWalkIn || !!defaultIsWalkIn;
    if (isWalkInFlag) params.isWalkIn = 'true';
    const urlParams = new URLSearchParams(params).toString();
    const publicTarget = `/booking?${urlParams}`;
    const adminTarget = `/admin/bookings/booking?${urlParams}`;
    const targetUrl = layoutForAdmin ? adminTarget : publicTarget;

    // 3. Navigate (Handle Auth Redirect if needed)
    if (status !== 'authenticated') {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const handleDateChange = useCallback((f: string, v: string) => {
    setMainFilter((p: any) => ({ ...p, [f]: v }));
    setTouched((t: any) => ({ ...t, [f]: true }));
  }, []);

  const handleTimeChange = useCallback((f: string, v: string) => {
    setMainFilter((p: any) => ({ ...p, [f]: v }));
    setTouched((t: any) => ({ ...t, [f]: true }));
  }, []);

  const handleCheckboxChange = useCallback((k: string, v: string) => {
    setSecondaryFilter((p: any) => ({
      ...p,
      [k]: p[k].includes(v) 
        ? p[k].filter((x: any) => x !== v) 
        : [...p[k], v]
    }));
  }, []);

  const showValidation = Object.values(touched).some(Boolean);

  return (
    <CarsView
      mainFilter={mainFilter}
      onDateChange={handleDateChange}
      onTimeChange={handleTimeChange}
      TIME_SLOTS={Array.from({ length: 48 }, (_, i) => `${Math.floor(i / 2).toString().padStart(2, '0')}:${i % 2 ? '30' : '00'}`)}
      secondaryFilter={secondaryFilter}
      onCheckboxChange={handleCheckboxChange}
      brands={brands}
      enums={enums}
      loading={loading}
      cars={cars}
      isValidSelection={isValidSelection}
      hasDates={hasDates}
      onBookClick={handleBookClick}
      alert={alert}
      onAlertClose={() => setAlert({ ...alert, open: false })}
      topBarRef={topBarRef}
      validationError={validationError}
      showValidation={showValidation}
      bookingType={bookingType}
      isWalkIn={isWalkIn}
      showTopBar={showTopBar}
      layoutForAdmin={layoutForAdmin}
      t={t}
    />
  );
};