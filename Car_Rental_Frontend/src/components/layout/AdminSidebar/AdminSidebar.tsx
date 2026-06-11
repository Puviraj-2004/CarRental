'use client';

import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useMutation } from '@apollo/client';           // ← import
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations'; // ← import
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface AdminMenuItem {
  labelKey: string;
  path: string;
}

export const adminMenuItems: AdminMenuItem[] = [
  { labelKey: 'admin.menu.dashboard', path: '/admin/dashboard' },
  { labelKey: 'admin.menu.vehicles',  path: '/admin/cars' },
  { labelKey: 'admin.menu.bookings',  path: '/admin/bookings' },
  { labelKey: 'admin.menu.reports',   path: '/admin/reports' },
];

export const AdminSidebar: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);  // ← hook

  const handleLogout = async (): Promise<void> => {       // ← make async
    try {
      await logoutMutation();  // clears HTTP‑only refresh token cookie
    } catch (err) {
      console.error('Logout mutation failed', err);
    } finally {
      await signOut({ callbackUrl: '/' });
    }
  };

  return (
    <Box /* ... rest of your JSX unchanged ... */ >
      <Box>
        {/* ... menu items ... */}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LanguageSwitcher />
        </Box>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleLogout}
          sx={{ fontWeight: 700, textTransform: 'none', py: 1 }}
        >
          {t('navbar.logout')}
        </Button>
      </Box>
    </Box>
  );
};