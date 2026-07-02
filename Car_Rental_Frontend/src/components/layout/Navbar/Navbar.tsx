'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { alpha } from '@mui/material/styles';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
  icon: React.ElementType;
  authRequired?: boolean;
  guestOnly?: boolean;
}

const navItems: NavItem[] = [
  { labelKey: 'navbar.home', path: '/', icon: HomeRoundedIcon },
  { labelKey: 'navbar.cars', path: '/cars', icon: DirectionsCarRoundedIcon },
  { labelKey: 'navbar.about', path: '/about', icon: InfoRoundedIcon },
  { labelKey: 'navbar.bookings', path: '/bookingRecords', icon: CalendarMonthRoundedIcon, authRequired: true },
  { labelKey: 'navbar.profile', path: '/profile', icon: AccountCircleRoundedIcon, authRequired: true },
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

  const brandMark = (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        width: { xs: 38, md: 42 },
        height: { xs: 38, md: 42 },
        borderRadius: 2.5,
        color: '#fff',
        background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 52%, #60a5fa 100%)',
        boxShadow: (theme) => `0 14px 34px ${alpha(theme.palette.primary.main, 0.34)}`,
      }}
    >
      <DirectionsCarRoundedIcon fontSize="small" />
    </Box>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2,
          py: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(
              theme.palette.primary.main,
              0.03,
            )})`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack
            component={Link}
            href="/"
            direction="row"
            alignItems="center"
            spacing={1.25}
            onClick={handleDrawerToggle}
            sx={{ color: 'text.primary', textDecoration: 'none' }}
          >
            {brandMark}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                {t('common.appName')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('navbar.menuSubtitle')}
              </Typography>
            </Box>
          </Stack>

          <IconButton size="small" aria-label={t('navbar.closeMenu')} onClick={handleDrawerToggle}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Chip
          icon={<VerifiedRoundedIcon />}
          label={isAuthenticated ? t('navbar.authenticated') : t('navbar.guest')}
          size="small"
          sx={{
            mt: 2,
            fontWeight: 850,
            bgcolor: 'background.paper',
            boxShadow: (theme) => `0 10px 26px ${alpha(theme.palette.common.black, 0.08)}`,
            '& .MuiChip-icon': { color: 'primary.main' },
          }}
        />
      </Box>

      <Divider />

      <List component="nav" sx={{ flex: 1, overflowY: 'auto', px: 1.25, py: 1.5 }}>
        {visibleNavItems.map((item) => {
          const isActive = isActivePath(item.path);
          const Icon = item.icon;

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              onClick={handleDrawerToggle}
              selected={isActive}
              sx={{
                mb: 0.75,
                borderRadius: 2.5,
                minHeight: 48,
                color: isActive ? 'primary.main' : 'text.primary',
                transition: 'all 180ms ease',
                '&.Mui-selected': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t(item.labelKey)}
                primaryTypographyProps={{ fontWeight: isActive ? 950 : 750, fontSize: 14 }}
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
              mt: 1.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'primary.main',
              minHeight: 52,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.11),
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 38 }}>
              <DashboardRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('navbar.adminDashboard')}
              secondary={t('navbar.dashboardDescription')}
              primaryTypographyProps={{ color: 'primary.main', fontWeight: 950, fontSize: 14 }}
              secondaryTypographyProps={{ fontSize: 12, lineHeight: 1.35 }}
            />
          </ListItemButton>
        )}
      </List>

      <Stack spacing={1.5} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            {t('layout.language.label')}
          </Typography>
          <LanguageSwitcher />
        </Stack>

        {isAuthenticated ? (
          <Button
            fullWidth
            color="error"
            variant="contained"
            startIcon={<LogoutRoundedIcon />}
            disabled={loggingOut}
            onClick={() => {
              setMobileOpen(false);
              setLogoutDialogOpen(true);
            }}
            sx={{ fontWeight: 900, borderRadius: 999, py: 1.1 }}
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
            sx={{ fontWeight: 900, borderRadius: 999, py: 1.1 }}
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
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.88),
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(18px)',
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 66, md: 74 }, gap: 2 }}>
            <Stack
              component={Link}
              href="/"
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{
                flexShrink: 0,
                color: 'text.primary',
                textDecoration: 'none',
                transition: 'transform 180ms ease',
                '&:hover': {
                  transform: 'translateY(-1px) scale(1.01)',
                },
              }}
            >
              {brandMark}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 950, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {t('common.appName')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t('navbar.menuSubtitle')}
                </Typography>
              </Box>
            </Stack>

            <Stack
              component="nav"
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                p: 0.5,
                mx: 2,
                maxWidth: 620,
                borderRadius: 999,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: 'divider',
              }}
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
                      minHeight: 38,
                      px: 1.7,
                      borderRadius: 999,
                      fontSize: 14,
                      fontWeight: isActive ? 950 : 750,
                      textTransform: 'none',
                      bgcolor: isActive ? 'background.paper' : 'transparent',
                      boxShadow: isActive
                        ? (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`
                        : 'none',
                      transition: 'all 180ms ease',
                      '&:hover': {
                        bgcolor: isActive ? 'background.paper' : 'action.hover',
                        transform: 'translateY(-2px)',
                      },
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
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    fontWeight: 900,
                    borderRadius: 999,
                    textTransform: 'none',
                  }}
                >
                  {t('navbar.admin')}
                </Button>
              )}

              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LogoutRoundedIcon />}
                  disabled={loggingOut}
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    fontWeight: 900,
                    borderRadius: 999,
                    textTransform: 'none',
                    boxShadow: (theme) => `0 12px 28px ${alpha(theme.palette.error.main, 0.24)}`,
                  }}
                >
                  {t('navbar.logout')}
                </Button>
              ) : (
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  startIcon={<LoginRoundedIcon />}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    fontWeight: 900,
                    borderRadius: 999,
                    textTransform: 'none',
                    boxShadow: (theme) => `0 12px 28px ${alpha(theme.palette.primary.main, 0.24)}`,
                  }}
                >
                  {t('navbar.login')}
                </Button>
              )}

              <IconButton
                aria-label={t('navbar.openMenu')}
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
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
            width: 'min(340px, 90vw)',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
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