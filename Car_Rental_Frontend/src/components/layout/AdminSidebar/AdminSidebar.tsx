'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
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

interface AdminMenuGroup {
  groupLabelKey: string;
  items: AdminMenuItem[];
}

export const adminMenuItems: (AdminMenuItem | AdminMenuGroup)[] = [
  { labelKey: 'admin.menu.dashboard', path: '/admin/dashboard' },
  { labelKey: 'admin.menu.vehicles', path: '/admin/cars' },
  {
    groupLabelKey: 'Bookings',
    items: [
      { labelKey: 'Online Bookings', path: '/admin/bookings/online' },
      { labelKey: 'Onsite Rentals', path: '/admin/bookings/onsite' },
      { labelKey: 'Courtesy Bookings', path: '/admin/bookings/courtesy' },
    ],
  },
  { labelKey: 'Users', path: '/admin/users' },
  { labelKey: 'admin.menu.reports', path: '/admin/reports' },
  {
    groupLabelKey: 'admin.menu.manageSetups',
    items: [
      { labelKey: 'admin.menu.brands', path: '/admin/setups/brands' },
      { labelKey: 'admin.menu.models', path: '/admin/setups/models' },
      { labelKey: 'admin.menu.fuelTypes', path: '/admin/setups/fuel-types' },
      { labelKey: 'admin.menu.paymentMethods', path: '/admin/setups/payment-methods' },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [collapsed, setCollapsed] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    adminMenuItems.forEach((item) => {
      if ('groupLabelKey' in item) {
        state[item.groupLabelKey] = item.items.some((subItem) => pathname.startsWith(subItem.path));
      }
    });
    return state;
  });

  React.useEffect(() => {
    document.documentElement.style.setProperty('--admin-sidebar-width', collapsed ? '72px' : '240px');
  }, [collapsed]);

  React.useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current };
      adminMenuItems.forEach((item) => {
        if ('groupLabelKey' in item && item.items.some((subItem) => pathname.startsWith(subItem.path))) {
          next[item.groupLabelKey] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  const getLabel = (labelKey: string) => (labelKey.startsWith('admin.') ? t(labelKey) : labelKey);
  const getCompactLabel = (labelKey: string) => getLabel(labelKey).trim().charAt(0).toUpperCase();

  const toggleGroup = (groupLabelKey: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((current) => ({ ...current, [groupLabelKey]: true }));
      return;
    }
    setOpenGroups((current) => ({ ...current, [groupLabelKey]: !current[groupLabelKey] }));
  };

  const handleLogout = async (): Promise<void> => {
    if (!window.confirm('Do you want to logout?')) return;

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
        width: collapsed ? 72 : 240,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'grey.200',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        p: collapsed ? 2 : 3,
        boxSizing: 'border-box',
        zIndex: 1200,
        overflow: 'hidden',
        transition: 'width 0.2s ease, padding 0.2s ease',
      }}
    >
      <Box sx={{ flexShrink: 0, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 1 }}>
          {!collapsed && (
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px' }}>
              {t('common.appName')} Admin
            </Typography>
          )}
          <Tooltip title={collapsed ? 'Open sidebar' : 'Close sidebar'} placement="right">
            <IconButton
              size="small"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Open admin sidebar' : 'Close admin sidebar'}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                width: 36,
                height: 36,
              }}
            >
              <Typography component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
                {collapsed ? '>' : '<'}
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <List component="nav" disablePadding>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {adminMenuItems.map((item, idx) => {
              if ('groupLabelKey' in item) {
                const isOpen = !!openGroups[item.groupLabelKey];
                const hasActiveChild = item.items.some((subItem) => pathname.startsWith(subItem.path));

                return (
                  <Box key={`group-${idx}`}>
                    <ListItemButton
                      onClick={() => toggleGroup(item.groupLabelKey)}
                      sx={{
                        borderRadius: '8px',
                        bgcolor: hasActiveChild ? 'grey.100' : 'transparent',
                        color: hasActiveChild ? 'primary.main' : 'text.primary',
                        px: collapsed ? 0 : 2,
                        py: 1.2,
                        minHeight: 44,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      {collapsed ? (
                        <Tooltip title={getLabel(item.groupLabelKey)} placement="right">
                          <Typography component="span" sx={{ fontWeight: 800, fontSize: 14 }}>
                            {getCompactLabel(item.groupLabelKey)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <>
                          <ListItemText
                            primary={getLabel(item.groupLabelKey)}
                            primaryTypographyProps={{
                              fontWeight: hasActiveChild ? 800 : 700,
                              fontSize: '14px',
                            }}
                          />
                          <Typography component="span" sx={{ fontSize: 18, lineHeight: 1, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.15s' }}>
                            &gt;
                          </Typography>
                        </>
                      )}
                    </ListItemButton>

                    <Collapse in={isOpen && !collapsed} timeout="auto" unmountOnExit>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.75, mb: 0.75 }}>
                        {item.items.map((subItem) => {
                          const isActive = pathname === subItem.path;
                          return (
                            <ListItemButton
                              key={subItem.path}
                              component={Link}
                              href={subItem.path}
                              sx={{
                                borderRadius: '8px',
                                bgcolor: isActive ? 'primary.main' : 'transparent',
                                color: isActive ? 'primary.contrastText' : 'text.primary',
                                '&:hover': { bgcolor: isActive ? 'primary.dark' : 'grey.100' },
                                px: 2,
                                py: 1,
                                ml: 1.5,
                              }}
                            >
                              <ListItemText
                                primary={getLabel(subItem.labelKey)}
                                primaryTypographyProps={{
                                  fontWeight: isActive ? 700 : 500,
                                  fontSize: '13px',
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </Box>
                    </Collapse>
                  </Box>
                );
              }

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
                    '&:hover': { bgcolor: isActive ? 'primary.dark' : 'grey.100' },
                    px: collapsed ? 0 : 2,
                    py: 1.2,
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                >
                  {collapsed ? (
                    <Tooltip title={getLabel(item.labelKey)} placement="right">
                      <Typography component="span" sx={{ fontWeight: isActive ? 800 : 700, fontSize: 14 }}>
                        {getCompactLabel(item.labelKey)}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <ListItemText
                      primary={getLabel(item.labelKey)}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '14px',
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </Box>
        </List>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, pt: 2, mt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LanguageSwitcher />
          </Box>
        )}
        <Tooltip title={collapsed ? t('navbar.logout') : ''} placement="right">
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleLogout}
            sx={{ fontWeight: 700, textTransform: 'none', py: 1.2, borderRadius: '8px', minWidth: 0 }}
          >
            {collapsed ? 'L' : t('navbar.logout')}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};
