'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { useLanguage } from '@/lib/LanguageContext';
import { DashboardView } from './DashboardView';
import { GET_DASHBOARD_STATS_QUERY } from '../graphql/queries';

export interface RecentBooking {
  id:         string;
  isWalkIn:   boolean;
  guestName:  string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  totalPrice: number;
  status:     'RESERVED' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  createdAt:  string;
  user: {
    id:       string;
    fullName: string;
    email:    string;
  } | null;
  car: {
    brand: { name: string };
    model: { name: string };
  };
}

export interface DashboardStats {
  totalUsers:     number;
  totalCars:      number;
  totalBookings:  number;
  totalRevenue:   number;
  availableCars:  number;
  recentBookings: RecentBooking[];
}

export interface DashboardStatsData {
  dashboardStats: DashboardStats;
}

export const DashboardContainer: React.FC = () => {
  const { t } = useLanguage();
  const { data, loading, error } = useQuery<DashboardStatsData>(GET_DASHBOARD_STATS_QUERY);

  return (
    <DashboardView
      t={t}
      stats={data?.dashboardStats || null}
      loading={loading}
      error={error ? t('common.error') : null}
    />
  );
};