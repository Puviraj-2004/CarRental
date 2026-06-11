'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { useLanguage } from '@/lib/LanguageContext';
import { HomeView } from './HomeView';
import { GET_CARS_QUERY } from '../../cars/graphql/queries';
import type { PaginatedCarsData, UseCarsVariables } from '../../cars/hooks/useCar';

export const HomeContainer: React.FC = () => {
  const { t } = useLanguage();

  const { data, loading } = useQuery<PaginatedCarsData, UseCarsVariables>(
    GET_CARS_QUERY,
    {
      variables: {
        pagination: { page: 1, pageSize: 3 },
        filter: { status: 'AVAILABLE' },
      },
    }
  );

  return (
    <HomeView
      t={t}
      featuredCars={data?.cars.items || []}
      loadingCars={loading}
    />
  );
};