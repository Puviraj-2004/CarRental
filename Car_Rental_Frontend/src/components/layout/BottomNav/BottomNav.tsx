'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ReactNode;
}

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isNativeApp = useIsNativeApp();

  if (!isNativeApp) return null;

  const navItems: NavItem[] = [
    {
      labelKey: 'navbar.cars',
      path: '/cars',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
        </svg>
      ),
    },
    {
      labelKey: 'navbar.bookings',
      path: '/bookingRecords',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
    },
    {
      labelKey: 'navbar.profile',
      path: '/profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'grey.200',
        display: { xs: 'flex', md: 'none' }, // SHOW only on Mobile/Tablet, HIDE on Desktop
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        pb: 'env(safe-area-inset-bottom)' // Respects iPhone home-indicator spacing
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Box
            key={item.path}
            component={Link}
            href={item.path}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flex: 1,
              height: '100%',
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <Box sx={{ mb: '2px', display: 'flex' }}>
              {item.icon}
            </Box>
            <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: isActive ? 700 : 500 }}>
              {t(item.labelKey)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
