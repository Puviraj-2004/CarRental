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

interface NavItem {
  labelKey: string;
  defaultLabel: string; // Defensive fallback if translation key is missing [1]
  path: string;
  authRequired?: boolean;
  adminOnly?: boolean;
}

// Configured navigation items matching your public and user directory routes [1]
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
      // Safely pass the active refresh token to revoke it in Redis & PostgreSQL on logout [1]
      if (session?.refreshToken) {
        await logoutMutation({ variables: { refreshToken: session.refreshToken } });
      }
    } catch (err) {
      console.error('Logout mutation failed', err);
    } finally {
      await signOut({ callbackUrl: '/' });
    }
  };

  // Filter links based on current authentication and authorization state [1]
  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.authRequired && !isAuthenticated) return false;
    return true;
  });

  // Mobile Drawer Menu markup
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

            {/* Quick Link to Admin Dashboard in mobile menu if user is Admin [1] */}
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

      {/* Mobile Drawer Actions Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'grey.100' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
          borderColor: 'grey.100',
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '70px' }}>
            
            {/* Logo / App Name */}
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

            {/* Desktop Navigation Links */}
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
                      '&:hover': { color: 'primary.main', bgcolor: 'primary.50' }
                    }}
                  >
                    {t(item.labelKey) || item.defaultLabel}
                  </Button>
                );
              })}
            </Box>

            {/* Desktop Action Area */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
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

            {/* Mobile Hamburger Toggle Icon */}
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

      {/* Temporary Mobile Drawer menu */}
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