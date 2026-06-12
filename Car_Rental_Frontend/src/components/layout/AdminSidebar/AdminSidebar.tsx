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
import { signOut, getSession } from 'next-auth/react'; 
import { useMutation } from '@apollo/client';
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations';
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
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async (): Promise<void> => {
    try {
      const session = await getSession();
      if (session?.refreshToken) {
        await logoutMutation({ variables: { refreshToken: session.refreshToken } });
      }
    } catch (err) {
      console.error('Logout mutation failed', err);
    } finally {
      await signOut({ callbackUrl: '/' });
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'grey.200',
        display: { xs: 'none', lg: 'flex' }, // Hide on mobile, show on desktop (lg and above) [1]
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 3,
        boxSizing: 'border-box',
        zIndex: 1200,
      }}
    >
      <Box>
        {/* Brand App Name Header */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, color: 'primary.main', letterSpacing: '-0.5px' }}>
          {t('common.appName')} Admin
        </Typography>

        {/* Navigation Link List */}
        <List component="nav" disablePadding>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {adminMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  href={item.path}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'grey.100',
                    },
                    px: 2,
                    py: 1.2,
                  }}
                >
                  <ListItemText
                    primary={t(item.labelKey)}
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px'
                    }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        </List>
      </Box>

      {/* Language Switcher and Logout Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LanguageSwitcher />
        </Box>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleLogout}
          sx={{ fontWeight: 700, textTransform: 'none', py: 1.2, borderRadius: '8px' }}
        >
          {t('navbar.logout')}
        </Button>
      </Box>
    </Box>
  );
};