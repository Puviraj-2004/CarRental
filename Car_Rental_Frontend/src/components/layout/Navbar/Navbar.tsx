'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useMutation } from '@apollo/client';           // ← import
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations'; // ← import
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';
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
    <AppBar /* ... unchanged ... */ >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* ... logo ... */}
          {/* ... navigation links ... */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                {t('navbar.logout')}
              </Button>
            ) : (
              <Button
                variant="contained"
                component={Link}
                href="/login"
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                {t('navbar.login')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};