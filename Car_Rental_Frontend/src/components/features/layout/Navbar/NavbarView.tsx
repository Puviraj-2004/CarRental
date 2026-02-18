'use client';

import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, MenuItem, Menu,
  Avatar, Tooltip, Container, Stack, Divider, alpha
} from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Link from 'next/link';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface NavbarViewProps {
  settings: any;
  navItems: Array<{ label: string; path: string }>;
  isLoggedIn: boolean;
  userData: any;
  pathname: string;
  mobileOpen: boolean;
  anchorElUser: null | HTMLElement;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
  onOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseUserMenu: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export const NavbarView = ({
  settings,
  navItems,
  isLoggedIn,
  userData,
  pathname,
  mobileOpen,
  anchorElUser,
  onOpenUserMenu,
  onCloseUserMenu,
  onLogout,
  onNavigate,
  t
}: NavbarViewProps) => {

  const goldAccent = '#D4AF37';
  const richBlack = '#0A0A0A';
  const textPrimary = '#FFFFFF';
  const textSecondary = '#A1A1AA'; // Clearer grey for inactive links

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: richBlack, 
          borderBottom: `1px solid ${alpha(goldAccent, 0.2)}`, 
          height: { xs: 70, md: 80 }, 
          justifyContent: 'center',
          zIndex: 1300
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* LOGO */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }} 
              onClick={() => onNavigate('/')}
            >
              <Box 
                sx={{ 
                  width: 38, height: 38, bgcolor: goldAccent, borderRadius: '8px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 15px ${alpha(goldAccent, 0.2)}`
                }}
              >
                <DriveEtaIcon sx={{ fontSize: 22, color: '#000' }} />
              </Box>
              <Typography 
                variant="h6" 
                fontWeight={900} 
                sx={{ 
                    color: textPrimary, 
                    letterSpacing: '-0.5px', 
                    textTransform: 'uppercase',
                    fontSize: { xs: '0.9rem', sm: '1.1rem' } 
                }}
              >
                {settings.companyName}
              </Typography>
            </Box>

            {/* DESKTOP NAV - Improved Contrast */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center',
                bgcolor: '#141414',
                borderRadius: '12px',
                p: 0.5,
                border: '1px solid #262626'
              }}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: '10px',
                      px: 2.5,
                      py: 0.8,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isActive ? '#000' : textSecondary,
                      bgcolor: isActive ? goldAccent : 'transparent',
                      '&:hover': { 
                        bgcolor: isActive ? goldAccent : alpha(goldAccent, 0.1),
                        color: isActive ? '#000' : textPrimary
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* USER SECTION */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Mobile: only language switcher */}
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <LanguageSwitcher variant="icon" color="dark" />
              </Box>

              {/* Desktop: full controls */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                <LanguageSwitcher variant="icon" color="dark" />
                <IconButton 
                  sx={{ 
                    color: textPrimary, 
                    bgcolor: '#141414', 
                    border: '1px solid #262626',
                  }}
                >
                  <NotificationsOutlinedIcon fontSize="small" />
                </IconButton>

                {!isLoggedIn ? (
                  <Button 
                    variant="contained" 
                    onClick={() => onNavigate('/login')} 
                    sx={{ 
                      bgcolor: textPrimary,
                      color: '#ffffff',
                      borderRadius: '8px', 
                      textTransform: 'none', 
                      fontWeight: 800, 
                      px: 3,
                      py: 1,
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                      '&:hover': { 
                        bgcolor: goldAccent,
                        boxShadow: `0 4px 15px ${alpha(goldAccent, 0.3)}`
                      }
                    }}
                  >
                    {t('navigation.login')}
                  </Button>
                ) : (
                  <IconButton 
                    onClick={onOpenUserMenu} 
                    sx={{ p: 0.5, border: `2px solid ${goldAccent}` }}
                  >
                    <Avatar sx={{ bgcolor: goldAccent, width: 32, height: 32, fontSize: '0.85rem', fontWeight: 800, color: '#000' }}>
                      {(userData?.fullName || 'U')[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                )}
              </Box>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* USER DROPDOWN */}
      <Menu 
        anchorEl={anchorElUser} 
        open={Boolean(anchorElUser)} 
        onClose={onCloseUserMenu}
        sx={{ 
          mt: '45px',
          '& .MuiPaper-root': {
            bgcolor: '#141414',
            color: textPrimary,
            borderRadius: '12px',
            minWidth: 200,
            border: `1px solid #262626`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }
        }} 
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={800} color={goldAccent}>
            {userData?.fullName}
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: '#262626' }} />
        <MenuItem onClick={() => onNavigate('/bookingRecords')} sx={{ py: 1.2, gap: 1.5 }}>
          <DashboardOutlinedIcon fontSize="small" sx={{ color: goldAccent }} />
          <Typography variant="body2" fontWeight={700}>{t('navigation.bookings')}</Typography>
        </MenuItem>
        <MenuItem onClick={onLogout} sx={{ py: 1.2, gap: 1.5 }}>
          <LogoutOutlinedIcon fontSize="small" sx={{ color: '#FF4D4D' }} />
          <Typography variant="body2" fontWeight={700} color="#FF4D4D">{t('navigation.logout')}</Typography>
        </MenuItem>
      </Menu>

      {/* MOBILE BOTTOM NAV - Parisian Executive Style */}
      <Box 
        sx={{ 
          display: { xs: 'flex', md: 'none' },
          position: 'fixed', bottom: 15, left: 15, right: 15, height: 65,
          backgroundColor: '#141414',
          borderRadius: '16px',
          border: `1px solid ${alpha(goldAccent, 0.3)}`,
          zIndex: 1200,
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {[
          { icon: HomeIcon, label: t('navigation.home'), path: '/' },
          { icon: DirectionsCarIcon, label: t('navigation.cars'), path: '/cars' },
          ...(isLoggedIn
            ? [{ icon: AccountCircleOutlinedIcon, label: t('navigation.profile'), path: '/profile' }]
            : [{ icon: LoginOutlinedIcon, label: t('navigation.login'), path: '/login' }]
          )
        ].map((item) => {
          const isActive = pathname === item.path;
          return (
            <IconButton 
              key={item.path}
              onClick={() => onNavigate(item.path)}
              sx={{ 
                color: isActive ? goldAccent : textSecondary,
                flexDirection: 'column',
                gap: 0.3,
                p: 1
              }}
            >
              <item.icon sx={{ fontSize: 24 }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: isActive ? 800 : 500 }}>
                {item.label}
              </Typography>
            </IconButton>
          );
        })}
      </Box>

      {/* SPACER */}
      <Box sx={{ height: { xs: 70, md: 80 } }} />
    </>
  );
};