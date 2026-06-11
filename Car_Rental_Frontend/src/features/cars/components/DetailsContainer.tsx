'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCarDetails } from '../hooks/useCarDetails';
import { DetailsView } from './DetailsView';

export const DetailsContainer: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useLanguage();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { car, loadingCar, calendar, loadingCalendar, refetchCalendar } = useCarDetails(
    id,
    month,
    year
  );

  const handleMonthChange = async (nextMonth: number, nextYear: number) => {
    setMonth(nextMonth);
    setYear(nextYear);
    await refetchCalendar({ month: nextMonth, year: nextYear });
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
    />
  );
};