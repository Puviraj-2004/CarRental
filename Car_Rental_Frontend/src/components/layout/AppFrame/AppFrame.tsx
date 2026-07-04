'use client';

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import { BottomNav } from '@/components/layout/BottomNav/BottomNav';
import { useIsNativeApp } from '@/features/native/hooks/useIsNativeApp';

export const AppFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNativeApp = useIsNativeApp();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  React.useEffect(() => {
    if (!isNativeApp || status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (isAdmin) {
      router.replace('/admin/dashboard');
      return;
    }

    if (pathname === '/' || pathname === '/about' || pathname === '/waiting-for-approval') {
      router.replace('/cars');
    }
  }, [isNativeApp, isAdmin, pathname, router, status]);

  if (isNativeApp && status === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isNativeApp && (status === 'unauthenticated' || isAdmin)) {
    return null;
  }

  if (isNativeApp && status === 'authenticated' && (pathname === '/' || pathname === '/about' || pathname === '/waiting-for-approval')) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: { xs: isNativeApp ? '64px' : 0, md: 0 },
      }}
    >
      <Navbar />

      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      <Footer />

      {isNativeApp && <BottomNav />}
    </Box>
  );
};
