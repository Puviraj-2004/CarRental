'use client';

import React from 'react';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useIsNativeApp } from '@/features/native/hooks/useIsNativeApp';

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
      icon: <DirectionsCarRoundedIcon />,
    },
    {
      labelKey: 'navbar.bookings',
      path: '/bookingRecords',
      icon: <CalendarMonthRoundedIcon />,
    },
    {
      labelKey: 'navbar.profile',
      path: '/profile',
      icon: <PersonRoundedIcon />,
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
        borderColor: 'divider',
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1100,
        boxShadow: 3,
        pb: 'env(safe-area-inset-bottom)',
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
            <Box sx={{ mb: 0.25, display: 'flex', '& svg': { fontSize: 24 } }}>
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
