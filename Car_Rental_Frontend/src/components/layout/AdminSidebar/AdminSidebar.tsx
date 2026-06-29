'use client';

import React from 'react';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSession, signOut } from 'next-auth/react';
import { useMutation } from '@apollo/client';
import { LOGOUT_MUTATION } from '@/features/auth/graphql/mutations';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { LogoutConfirmDialog } from '../LogoutConfirmDialog';

interface AdminMenuItem {
  labelKey: string;
  path: string;
}

interface AdminMenuGroup {
  groupLabelKey: string;
  icon: React.ElementType;
  items: AdminMenuItem[];
}

type AdminMenuEntry = AdminMenuItem & { icon: React.ElementType } | AdminMenuGroup;

export const adminMenuItems: AdminMenuEntry[] = [
  { labelKey: 'admin.menu.dashboard', path: '/admin/dashboard', icon: DashboardRoundedIcon },
  { labelKey: 'admin.menu.vehicles', path: '/admin/cars', icon: DirectionsCarRoundedIcon },
  {
    groupLabelKey: 'admin.menu.bookings',
    icon: PaymentsRoundedIcon,
    items: [
      { labelKey: 'admin.menu.onlineBookings', path: '/admin/bookings/online' },
      { labelKey: 'admin.menu.onsiteRentals', path: '/admin/bookings/onsite' },
      { labelKey: 'admin.menu.courtesyBookings', path: '/admin/bookings/courtesy' },
    ],
  },
  { labelKey: 'admin.menu.users', path: '/admin/users', icon: PeopleRoundedIcon },
  { labelKey: 'admin.menu.reports', path: '/admin/reports', icon: AnalyticsRoundedIcon },
  {
    groupLabelKey: 'admin.menu.manageSetups',
    icon: SettingsRoundedIcon,
    items: [
      { labelKey: 'admin.menu.brands', path: '/admin/setups/brands' },
      { labelKey: 'admin.menu.models', path: '/admin/setups/models' },
      { labelKey: 'admin.menu.fuelTypes', path: '/admin/setups/fuel-types' },
      { labelKey: 'admin.menu.paymentMethods', path: '/admin/setups/payment-methods' },
    ],
  },
];

interface AdminNavigationProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

const isGroup = (item: AdminMenuEntry): item is AdminMenuGroup => 'groupLabelKey' in item;

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ collapsed = false, onNavigate }) => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    adminMenuItems.forEach((item) => {
      if (isGroup(item)) {
        state[item.groupLabelKey] = item.items.some((subItem) => pathname.startsWith(subItem.path));
      }
    });
    return state;
  });

  React.useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current };
      adminMenuItems.forEach((item) => {
        if (isGroup(item) && item.items.some((subItem) => pathname.startsWith(subItem.path))) {
          next[item.groupLabelKey] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  const toggleGroup = (key: string) => {
    setOpenGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const compactLabel = (labelKey: string) => t(labelKey).trim().charAt(0).toUpperCase();

  return (
    <List component="nav" disablePadding>
      <Stack spacing={0.5}>
        {adminMenuItems.map((item) => {
          if (isGroup(item)) {
            const Icon = item.icon;
            const isOpen = !!openGroups[item.groupLabelKey];
            const hasActiveChild = item.items.some((subItem) => pathname.startsWith(subItem.path));

            return (
              <Box key={item.groupLabelKey}>
                <Tooltip title={collapsed ? t(item.groupLabelKey) : ''} placement="right">
                  <ListItemButton
                    onClick={() => toggleGroup(item.groupLabelKey)}
                    sx={{
                      minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 0 : 1.25,
                      bgcolor: hasActiveChild ? 'action.selected' : 'transparent',
                      color: hasActiveChild ? 'primary.main' : 'text.primary',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: 'inherit', justifyContent: 'center' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={t(item.groupLabelKey)}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: hasActiveChild ? 750 : 650 }}
                        />
                        {isOpen ? <ExpandMoreRoundedIcon fontSize="small" /> : <ChevronRightRoundedIcon fontSize="small" />}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                <Collapse in={isOpen && !collapsed} timeout="auto" unmountOnExit>
                  <Stack spacing={0.25} sx={{ mt: 0.5, mb: 0.75, pl: 4.25 }}>
                    {item.items.map((subItem) => {
                      const isActive = pathname === subItem.path;
                      return (
                        <ListItemButton
                          key={subItem.path}
                          component={Link}
                          href={subItem.path}
                          onClick={onNavigate}
                          sx={{
                            minHeight: 34,
                            px: 1,
                            color: isActive ? 'primary.main' : 'text.secondary',
                            bgcolor: isActive ? 'action.selected' : 'transparent',
                          }}
                        >
                          <ListItemText
                            primary={t(subItem.labelKey)}
                            primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 750 : 600 }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </Stack>
                </Collapse>
              </Box>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));

          return (
            <Tooltip key={item.path} title={collapsed ? t(item.labelKey) : ''} placement="right">
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={onNavigate}
                sx={{
                  minHeight: 40,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 0 : 1.25,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: 'inherit', justifyContent: 'center' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={t(item.labelKey)}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 750 : 650 }}
                  />
                )}
                {collapsed && <Box component="span" sx={{ position: 'absolute', opacity: 0 }}>{compactLabel(item.labelKey)}</Box>}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </Stack>
    </List>
  );
};

export const AdminSidebar: React.FC = () => {
  const { t } = useLanguage();
  const [logoutMutation, { loading: loggingOut }] = useMutation(LOGOUT_MUTATION);
  const [collapsed, setCollapsed] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--admin-sidebar-width', collapsed ? '72px' : '248px');
  }, [collapsed]);

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
    <>
    <Box
      sx={{
        width: collapsed ? 72 : 248,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        zIndex: 1200,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? 'center' : 'space-between'}
        sx={{ px: collapsed ? 1.5 : 2, minHeight: 64, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {!collapsed && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {t('common.appName')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 650 }}>
              {t('admin.shell.workspace')}
            </Typography>
          </Box>
        )}
        <Tooltip title={collapsed ? t('admin.shell.openSidebar') : t('admin.shell.closeSidebar')} placement="right">
          <IconButton
            size="small"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? t('admin.shell.openSidebar') : t('admin.shell.closeSidebar')}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <MenuOpenRoundedIcon
              fontSize="small"
              sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', px: 1.25, py: 1.5 }}>
        <AdminNavigation collapsed={collapsed} />
      </Box>

      <Box sx={{ flexShrink: 0, p: collapsed ? 1.25 : 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {!collapsed && (
          <Stack direction="row" justifyContent="center" sx={{ mb: 1.5 }}>
            <LanguageSwitcher />
          </Stack>
        )}
        <Tooltip title={collapsed ? t('navbar.logout') : ''} placement="right">
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={!collapsed ? <LogoutRoundedIcon /> : undefined}
            onClick={() => setLogoutDialogOpen(true)}
            sx={{ minWidth: 0, px: collapsed ? 0 : 1.5 }}
          >
            {collapsed ? <LogoutRoundedIcon fontSize="small" /> : t('navbar.logout')}
          </Button>
        </Tooltip>
      </Box>
    </Box>
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
