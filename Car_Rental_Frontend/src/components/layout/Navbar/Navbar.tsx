'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { LogoutConfirmDialog } from '../LogoutConfirmDialog';

interface NavItem {
  labelKey: string;
  path: string;
  authRequired?: boolean;
  guestOnly?: boolean;
}

const navItems: NavItem[] = [
  { labelKey: 'navbar.home', path: '/' },
  { labelKey: 'navbar.cars', path: '/cars' },
  { labelKey: 'navbar.about', path: '/about', guestOnly: true },
  { labelKey: 'navbar.bookings', path: '/bookingRecords', authRequired: true },
  { labelKey: 'navbar.profile', path: '/profile', authRequired: true },
];

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [logoutMutation, { loading: loggingOut }] = useMutation(LOGOUT_MUTATION);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';

  const visibleNavItems = navItems.filter((item) => {
    if (item.authRequired && !isAuthenticated) return false;
    if (item.guestOnly && isAuthenticated) return false;
    return true;
  });

  const isActivePath = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path));

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

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
        <Stack
          component={Link}
          href="/"
          direction="row"
          alignItems="center"
          spacing={1}
          onClick={handleDrawerToggle}
          sx={{ color: 'text.primary', textDecoration: 'none' }}
        >
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <DirectionsCarRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            {t('common.appName')}
          </Typography>
        </Stack>
        <IconButton size="small" aria-label={t('navbar.closeMenu')} onClick={handleDrawerToggle}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Divider />

      <List component="nav" sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1.5 }}>
        {visibleNavItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              onClick={handleDrawerToggle}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                minHeight: 42,
                color: isActive ? 'primary.main' : 'text.primary',
                bgcolor: isActive ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemText
                primary={t(item.labelKey)}
                primaryTypographyProps={{ fontWeight: isActive ? 750 : 600, fontSize: 14 }}
              />
            </ListItemButton>
          );
        })}

        {isAdmin && (
          <ListItemButton
            component={Link}
            href="/admin/dashboard"
            onClick={handleDrawerToggle}
            sx={{ mt: 1, borderRadius: 1, border: '1px solid', borderColor: 'primary.main', minHeight: 42 }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>
              <DashboardRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('navbar.dashboard')}
              primaryTypographyProps={{ color: 'primary.main', fontWeight: 800 }}
            />
          </ListItemButton>
        )}
      </List>

      <Stack spacing={1.5} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <LanguageSwitcher />
        </Stack>

        {isAuthenticated ? (
          <Button
            fullWidth
            color="error"
            variant="contained"
            startIcon={<LogoutRoundedIcon />}
            onClick={() => {
              setMobileOpen(false);
              setLogoutDialogOpen(true);
            }}
            sx={{ fontWeight: 750 }}
          >
            {t('navbar.logout')}
          </Button>
        ) : (
          <Button
            fullWidth
            component={Link}
            href="/login"
            variant="contained"
            startIcon={<LoginRoundedIcon />}
            onClick={handleDrawerToggle}
            sx={{ fontWeight: 750 }}
          >
            {t('navbar.login')}
          </Button>
        )}
      </Stack>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 64 }, gap: 2 }}>
            <Stack
              component={Link}
              href="/"
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ flexShrink: 0, color: 'text.primary', textDecoration: 'none' }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <DirectionsCarRoundedIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' }}>
                {t('common.appName')}
              </Typography>
            </Stack>

            <Stack
              component="nav"
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
              sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }}
            >
              {visibleNavItems.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    href={item.path}
                    color={isActive ? 'primary' : 'inherit'}
                    sx={{
                      minHeight: 36,
                      px: 1.5,
                      borderRadius: 1,
                      fontSize: 14,
                      fontWeight: isActive ? 750 : 600,
                      textTransform: 'none',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {t(item.labelKey)}
                  </Button>
                );
              })}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <LanguageSwitcher />
              </Box>

              {isAdmin && (
                <Button
                  component={Link}
                  href="/admin/dashboard"
                  variant="outlined"
                  startIcon={<DashboardRoundedIcon />}
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, fontWeight: 750 }}
                >
                  {t('navbar.admin')}
                </Button>
              )}

              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, fontWeight: 750 }}
                >
                  {t('navbar.logout')}
                </Button>
              ) : (
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  startIcon={<LoginRoundedIcon />}
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, fontWeight: 750 }}
                >
                  {t('navbar.login')}
                </Button>
              )}

              <IconButton
                aria-label={t('navbar.openMenu')}
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(300px, 88vw)',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        loading={loggingOut}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          void handleLogout();
        }}
      />
    </>
  );
};
