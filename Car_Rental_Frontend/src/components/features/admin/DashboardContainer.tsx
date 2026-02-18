'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useTranslation } from '@/lib/LanguageContext';
import { DashboardView } from './DashboardView';
import { Box, Typography, LinearProgress, Container } from '@mui/material';

export const DashboardContainer = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { stats, loading, error } = useAdminDashboard();
  const { t } = useTranslation();

  // Role-based Access Logic (Preserved from original)
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace('/login');
      return;
    }

    // If session is "authenticated" but token is missing, force a clean sign-out.
    // Otherwise the dashboard keeps trying to run admin queries and can loop on 401.
    const accessToken = (session as any)?.accessToken;
    if (status === 'authenticated' && !accessToken) {
      signOut({ callbackUrl: '/login' });
      return;
    }

    if (status === "authenticated" && (session?.user as any)?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [status, session, router]);

  if (status === "loading" || (session?.user as any)?.role !== 'ADMIN') {
    return (
      <Box sx={{ width: '100%', mt: 10, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>{t('admin.verifyingAccess')}</Typography>
        <Container maxWidth="xs"><LinearProgress /></Container>
      </Box>
    );
  }

  if (error) return <Typography color="error">{t('admin.errorLoadingMetrics')}</Typography>;

  return (
    <DashboardView 
      stats={stats} 
      loading={loading} 
      adminName={session?.user?.name || 'Administrator'}
      t={t}
    />
  );
};