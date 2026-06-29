'use client';

import React, { useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { getSession, signOut } from 'next-auth/react';
import { useMutation } from '@apollo/client';
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations';
import { AdminNavigation, AdminSidebar } from '@/components/layout/AdminSidebar/AdminSidebar';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { LogoutConfirmDialog } from '@/components/layout/LogoutConfirmDialog';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutMutation, { loading: loggingOut }] = useMutation(LOGOUT_MUTATION);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const closeDrawer = () => setMobileOpen(false);

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

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, minHeight: 60 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {t('common.appName')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 650 }}>
            {t('admin.shell.workspace')}
          </Typography>
        </Box>
        <IconButton size="small" aria-label={t('admin.shell.closeMenu')} onClick={closeDrawer}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', px: 1.25, py: 1.5 }}>
        <AdminNavigation onNavigate={closeDrawer} />
      </Box>

      <Stack spacing={1.5} sx={{ flexShrink: 0, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="flex-end">
          <LanguageSwitcher />
        </Stack>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutRoundedIcon />}
          onClick={() => {
            closeDrawer();
            setLogoutDialogOpen(true);
          }}
        >
          {t('navbar.logout')}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="default"
        sx={{
          display: { lg: 'none' },
          bgcolor: 'background.paper',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ minHeight: 60, px: 2, justifyContent: 'space-between', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label={t('admin.shell.openMenu')}
            edge="start"
            onClick={() => setMobileOpen(true)}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {t('common.appName')}
            </Typography>
            <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary', fontWeight: 650 }}>
              {t('admin.shell.workspace')}
            </Typography>
          </Box>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(304px, 88vw)',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <AdminSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { lg: 'calc(100% - var(--admin-sidebar-width, 248px))' },
          ml: { lg: 'var(--admin-sidebar-width, 248px)' },
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, lg: 4 },
          pt: { xs: '76px', lg: 4 },
          transition: 'margin-left 0.2s ease, width 0.2s ease',
        }}
      >
        {children}
      </Box>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        loading={loggingOut}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          void handleLogout();
        }}
      />
    </Box>
  );
}
