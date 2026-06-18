'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useCarDetails } from '../hooks/useCarDetails';
import { DetailsView } from './DetailsView';

export const DetailsContainer: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Read date-only parameters from the URL
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const hasDates = !!(startDate && endDate);

  const { car, loadingCar, calendar, loadingCalendar, refetchCalendar } = useCarDetails(
    id,
    month,
    year
  );

  // Calculates trip duration in days
  const getBookingDurationDays = (): number => {
    if (!hasDates) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const bookingDuration = getBookingDurationDays();
  const totalPrice = car && hasDates ? Number(car.basePrice) * bookingDuration : null;

  const handleMonthChange = async (nextMonth: number, nextYear: number) => {
    setMonth(nextMonth);
    setYear(nextYear);
    await refetchCalendar({ month: nextMonth, year: nextYear });
  };

  // Writes dates chosen inside the view directly to the URL query string [1]
  const handleApplyDates = (start: string, end: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (start) current.set('startDate', start); else current.delete('startDate');
    if (end) current.set('endDate', end); else current.delete('endDate');
    
    const query = current.toString() ? `?${current.toString()}` : '';
    router.replace(`${pathname}${query}`);
  };

  return (
    <DetailsView
      t={t}
      car={car}
      loadingCar={loadingCar}
      calendar={calendar}
      loadingCalendar={loadingCalendar}
      currentMonth={month}
      currentYear={year}
      onMonthChange={handleMonthChange}
      startDate={startDate}
      endDate={endDate}
      bookingDuration={bookingDuration}
      totalPrice={totalPrice}
      onApplyDates={handleApplyDates} // <-- Added callback for dynamic changes [1]
    />
  );
};