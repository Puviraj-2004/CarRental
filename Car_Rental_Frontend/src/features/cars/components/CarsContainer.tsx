'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { CarsView } from './CarsView';
import { GET_CARS_QUERY, GET_AVAILABLE_CARS_QUERY } from '../graphql/queries';
import type { CarFilterInput } from '../hooks/useCar';

// Reinstated the original prop definitions [1]
export interface CarsContainerProps {
  defaultBookingType?: string;
  defaultIsWalkIn?: boolean;
  layoutForAdmin?: boolean;
  showTopBar?: boolean;
}

// Timezone-safe local date YYYY-MM-DD generator [1]
const getLocalTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CarsContainer: React.FC<CarsContainerProps> = ({
  defaultBookingType,
  defaultIsWalkIn,
  layoutForAdmin,
  showTopBar,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);

  // Read date-only parameters from the URL (Format: YYYY-MM-DD)
  const urlStartDate = searchParams.get('startDate') || '';
  const urlEndDate = searchParams.get('endDate') || '';

  const hasDates = !!(urlStartDate && urlEndDate);

  const [filters, setFilters] = useState<CarFilterInput>({
    status: 'AVAILABLE',
    minPrice: undefined,
    maxPrice: undefined,
    search: undefined,
  });

  useEffect(() => {
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const search = searchParams.get('search') || undefined;

    setFilters((prev) => ({
      ...prev,
      minPrice,
      maxPrice,
      search,
    }));
  }, [searchParams]);

  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const query = current.toString() ? `?${current.toString()}` : '';
    router.replace(`${pathname}${query}`);
  };

  const isoStartDate = urlStartDate ? `${urlStartDate}T12:00:00.000Z` : '';
  const isoEndDate = urlEndDate ? `${urlEndDate}T12:00:00.000Z` : '';

  // Query A: Executes ONLY when NO dates are selected [1]
  const { 
    data: carsData, 
    loading: loadingCars, 
    error: errorCars 
  } = useQuery(GET_CARS_QUERY, {
    variables: {
      pagination: { page: currentPage, pageSize: 6 },
      filter: {
        status: 'AVAILABLE',
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search,
      },
    },
    skip: hasDates,
    fetchPolicy: 'cache-first',
  });

  // Query B: Executes ONLY when dates ARE selected [1]
  const { 
    data: availData, 
    loading: loadingAvail, 
    error: errorAvail 
  } = useQuery(GET_AVAILABLE_CARS_QUERY, {
    variables: {
      startDate: isoStartDate,
      endDate: isoEndDate,
      pagination: { page: currentPage, pageSize: 6 },
    },
    skip: !hasDates,
    fetchPolicy: 'network-only',
  });

  const rawCars = hasDates ? availData?.availableCars?.items || [] : carsData?.cars?.items || [];
  const pageInfo = hasDates ? availData?.availableCars?.pageInfo : carsData?.cars?.pageInfo;
  const loading = hasDates ? loadingAvail : loadingCars;
  const error = hasDates ? errorAvail : errorCars;

  // Client-side filtering fallback for availability results
  const displayedCars = hasDates
    ? rawCars.filter((car: any) => {
        if (filters.search && !`${car.model.brand.name} ${car.model.name}`.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.minPrice && Number(car.basePrice) < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice && Number(car.basePrice) > filters.maxPrice) {
          return false;
        }
        return true;
      })
    : rawCars;

  const handleFilterChange = (name: keyof CarFilterInput | 'startDate' | 'endDate', val: any) => {
    setCurrentPage(1);

    if (name === 'startDate' || name === 'endDate') {
      const todayStr = getLocalTodayStr(); // Timezone-safe date check [1]
      if (val && val < todayStr) {
        showToast('You cannot select a date in the past.', 'error');
        return;
      }
      if (name === 'startDate' && urlEndDate && new Date(val) >= new Date(urlEndDate)) {
        showToast('Pick-up date must be before Return date.', 'error');
        return;
      }
      if (name === 'endDate' && urlStartDate && new Date(urlStartDate) >= new Date(val)) {
        showToast('Return date must be after Pick-up date.', 'error');
        return;
      }
      updateUrlParams({ [name]: val || null });
    } else {
      updateUrlParams({ [name]: val ? String(val) : null });
    }
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    router.replace(pathname);
    setFilters({
      status: 'AVAILABLE',
      minPrice: undefined,
      maxPrice: undefined,
      search: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CarsView
      t={t}
      cars={displayedCars}
      pageInfo={pageInfo}
      loading={loading}
      error={error ? t('common.error') : null}
      filters={filters}
      startDate={urlStartDate}
      endDate={urlEndDate}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
};