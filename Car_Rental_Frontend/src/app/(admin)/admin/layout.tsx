'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react'; // Imported signOut trigger
import { useLanguage } from '@/lib/LanguageContext';
import { AdminSidebar, adminMenuItems } from '@/components/layout/AdminSidebar/AdminSidebar';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = (): void => {
    signOut({ callbackUrl: '/' });
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        p: 3,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, color: 'primary.main' }}>
          {t('common.appName')} Admin
        </Typography>
        <List component="nav" disablePadding onClick={handleDrawerToggle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {adminMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  href={item.path}
                  sx={{
                    borderRadius: '6px',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <ListItemText
                    primary={t(item.labelKey)}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
                  />
                </ListItemButton>
              );
            })}
          </div>
        </List>
      </Box>

      {/* Mobile Drawer Logout Button */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={handleLogout}
        sx={{ fontWeight: 700, textTransform: 'none', mt: 'auto', py: 1 }}
      >
        {t('navbar.logout')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="default"
        sx={{
          display: { lg: 'none' },
          borderBottom: 1,
          borderColor: 'grey.200',
          bgcolor: 'background.paper'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {t('common.appName')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawerContent}
      </Drawer>

      <AdminSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 4 },
          pt: { xs: '84px', lg: 4 },
          width: { lg: 'calc(100% - 240px)' },
          boxSizing: 'border-box'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}