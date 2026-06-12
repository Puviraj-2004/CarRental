'use client';

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useMutation } from '@apollo/client';           
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations'; 
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useThemeMode } from '@/app/providers'; // <-- Imported dynamic theme hook [1]

interface NavItem {
  labelKey: string;
  defaultLabel: string;
  path: string;
  authRequired?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { labelKey: 'navbar.home', defaultLabel: 'Home', path: '/' },
  { labelKey: 'navbar.cars', defaultLabel: 'Cars', path: '/cars' },
  { labelKey: 'navbar.about', defaultLabel: 'About Us', path: '/about' },
  { labelKey: 'navbar.bookings', defaultLabel: 'My Bookings', path: '/bookingRecords', authRequired: true },
  { labelKey: 'navbar.profile', defaultLabel: 'Profile', path: '/profile', authRequired: true },
];

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { mode, toggleTheme } = useThemeMode(); // <-- Connected Mode state & Toggler [1]
  const { data: session, status } = useSession();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);  

  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = async (): Promise<void> => {       
    try {
      if (session?.refreshToken) {
        await logoutMutation({ variables: { refreshToken: session.refreshToken } });
      }
    } catch (err) {
      console.error('Logout mutation failed', err);
    } finally {
      await signOut({ callbackUrl: '/' });
    }
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.authRequired && !isAuthenticated) return false;
    return true;
  });

  // Render SVGs inline for absolute cross-platform rendering safety
  const renderThemeIcon = () => {
    if (mode === 'dark') {
      // Sun Icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9.75-9h-2.25m-13.5 0H3m14.01-6.49-1.59 1.59M8.22 15.78l-1.59 1.59m12.42 1.59-1.59-1.59M8.22 8.22 6.63 6.63M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
      );
    }
    // Moon Icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
    );
  };

  const mobileDrawerContent = (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          component={Link} 
          href="/" 
          onClick={handleDrawerToggle}
          sx={{ fontWeight: 900, textDecoration: 'none', color: 'primary.main', display: 'block', mb: 3 }}
        >
          {t('common.appName') || 'BlueDrive'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List component="nav" disablePadding>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  href={item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '&:hover': { bgcolor: isActive ? 'primary.dark' : 'grey.100' }
                  }}
                >
                  <ListItemText
                    primary={t(item.labelKey) || item.defaultLabel}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '15px' }}
                  />
                </ListItemButton>
              );
            })}

            {isAdmin && (
              <ListItemButton
                component={Link}
                href="/admin/dashboard"
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  mt: 1
                }}
              >
                <ListItemText
                  primary="Admin Dashboard"
                  primaryTypographyProps={{ fontWeight: 700, fontSize: '15px' }}
                />
              </ListItemButton>
            )}
          </Box>
        </List>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          {/* Mobile Theme Toggle Button */}
          <IconButton onClick={toggleTheme} color="primary">
            {renderThemeIcon()}
          </IconButton>
          <LanguageSwitcher />
        </Box>
        {isAuthenticated ? (
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => {
              handleDrawerToggle();
              handleLogout();
            }}
            sx={{ fontWeight: 700, textTransform: 'none', py: 1.2, borderRadius: '8px' }}
          >
            {t('navbar.logout') || 'Log Out'}
          </Button>
        ) : (
          <Button
            variant="contained"
            component={Link}
            href="/login"
            onClick={handleDrawerToggle}
            fullWidth
            sx={{ fontWeight: 700, textTransform: 'none', py: 1.2, borderRadius: '8px' }}
          >
            {t('navbar.login') || 'Log In'}
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '70px' }}>
            
            <Typography 
              variant="h5" 
              component={Link} 
              href="/" 
              sx={{ 
                fontWeight: 900, 
                textDecoration: 'none', 
                color: 'primary.main',
                letterSpacing: '-1px'
              }}
            >
              {t('common.appName') || 'BlueDrive'}
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    href={item.path}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 750 : 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      transition: '0.15s',
                      '&:hover': { color: 'primary.main', bgcolor: 'divider' }
                    }}
                  >
                    {t(item.labelKey) || item.defaultLabel}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {/* Desktop Theme Toggle Button */}
              <IconButton onClick={toggleTheme} color="primary" sx={{ p: 1 }}>
                {renderThemeIcon()}
              </IconButton>
              
              <LanguageSwitcher />

              {isAdmin && (
                <Button
                  variant="outlined"
                  component={Link}
                  href="/admin/dashboard"
                  sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px', px: 2 }}
                >
                  Admin
                </Button>
              )}

              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleLogout}
                  sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px', px: 2.5 }}
                >
                  {t('navbar.logout') || 'Log Out'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  href="/login"
                  sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px', px: 2.5 }}
                >
                  {t('navbar.login') || 'Log In'}
                </Button>
              )}
            </Box>

            <IconButton
              color="default"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'block', md: 'none' }, color: 'text.primary' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </IconButton>

          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, borderRadius: '16px 0 0 16px' },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  );
};