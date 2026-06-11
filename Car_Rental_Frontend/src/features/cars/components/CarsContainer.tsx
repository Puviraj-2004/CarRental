'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCars } from '../hooks/useCar';
import { CarsView } from './CarsView';
import type { CarFilterInput } from '../hooks/useCar';


export interface CarsContainerProps {
  defaultBookingType?: string;
  defaultIsWalkIn?: boolean;
  layoutForAdmin?: boolean;
  showTopBar?: boolean;
}



export const CarsContainer: React.FC<CarsContainerProps> = ({
  defaultBookingType,
  defaultIsWalkIn,
  layoutForAdmin,
  showTopBar,
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CarFilterInput>({
    status: 'AVAILABLE',
    minPrice: undefined,
    maxPrice: undefined,
    search: undefined,
  });

  const { cars, pageInfo, loading, error } = useCars({
    pagination: { page: currentPage, pageSize: 6 }, // 6 items per page
    filter: filters,
  });

  const handleFilterChange = (name: keyof CarFilterInput, val: any) => {
    setCurrentPage(1); // Reset back to page 1 on active filter adjustments
    setFilters((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilters({
      status: 'AVAILABLE',
      minPrice: undefined,
      maxPrice: undefined,
      search: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scrolls window back to top on page switches
  };

  return (
    <CarsView
      t={t}
      cars={cars}
      pageInfo={pageInfo}
      loading={loading}
      error={error ? t('common.error') : null}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
      
    />
  );
};