'use client';

import React from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Tooltip, 
  alpha, Typography, useMediaQuery, useTheme 
} from '@mui/material';
import { 
  Logout as LogoutIcon, 
  ChevronLeft as ChevronLeftIcon, 
  Menu as MenuIcon,
  DirectionsCar as LogoIcon
} from '@mui/icons-material';
import { LanguageSwitcher } from '../LanguageSwitcher';

const drawerWidth = 280;
const collapsedWidth = 88;

interface AdminSidebarViewProps {
  open: boolean;
  pathname: string;
  settings: any;
  menuItems: any[];
  onToggle: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export const AdminSidebarView = ({
  open,
  pathname,
  settings,
  menuItems,
  onToggle,
  onLogout,
  onNavigate,
  t
}: AdminSidebarViewProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const brandColor = '#D4AF37';
  const bgColor = '#121212';
  const borderColor = '#262626';
  const textColor = '#E5E5E5';

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: bgColor,
      overflow: 'hidden' 
    }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: (open || isMobile) ? 'space-between' : 'center', 
        height: 90,
        flexShrink: 0
      }}>
        {open || isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 40, height: 40, bgcolor: brandColor, borderRadius: '10px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <LogoIcon sx={{ color: '#000' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: textColor, lineHeight: 1, textTransform: 'uppercase' }}>
                {settings?.companyName?.split(' ')[0]}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: brandColor, letterSpacing: 1 }}>
                {settings?.companyName?.split(' ').slice(1).join(' ')}
              </Typography>
            </Box>
          </Box>
        ) : null}
        
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {open && <LanguageSwitcher variant="icon" color="dark" />}
            <IconButton 
              onClick={onToggle} 
              sx={{ 
                color: brandColor, 
                bgcolor: alpha(brandColor, 0.05),
                '&:hover': { bgcolor: alpha(brandColor, 0.1) } 
              }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        )}
      </Box>

      <List sx={{ 
        px: 2, 
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        msOverflowStyle: 'none', 
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' } 
      }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <ListItem disablePadding key={item.text} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  onNavigate(item.path);
                  if (isMobile) onToggle();
                }}
                sx={{
                  borderRadius: '12px',
                  minHeight: 50,
                  justifyContent: (open || isMobile) ? 'initial' : 'center',
                  px: 2.5,
                  bgcolor: isActive ? brandColor : 'transparent',
                  '&:hover': { bgcolor: isActive ? brandColor : alpha(textColor, 0.05) },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0, 
                  mr: (open || isMobile) ? 2 : 'auto', 
                  color: isActive ? '#000' : '#666' 
                }}>
                  <Icon />
                </ListItemIcon>
                {(open || isMobile) && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem', 
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#000' : textColor
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, pb: 4, flexShrink: 0 }}>
        <ListItemButton 
          onClick={onLogout} 
          sx={{ 
            borderRadius: '12px', 
            color: '#FF4D4D', 
            justifyContent: (open || isMobile) ? 'initial' : 'center',
            '&:hover': { bgcolor: alpha('#FF4D4D', 0.1) } 
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: (open || isMobile) ? 2 : 'auto', color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          {(open || isMobile) && <ListItemText primary={t('admin.logout')} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <Box sx={{ 
          position: 'fixed', top: 0, left: 0, right: 0, height: 70, 
          bgcolor: bgColor, display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', px: 2, zIndex: 1100,
          borderBottom: `1px solid ${borderColor}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, bgcolor: brandColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoIcon sx={{ color: '#000', fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: textColor, fontSize: '0.9rem' }}>{settings?.companyName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageSwitcher variant="icon" color="dark" />
            <IconButton onClick={onToggle} sx={{ color: brandColor }}><MenuIcon /></IconButton>
          </Box>
        </Box>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={onToggle}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${borderColor}`,
            height: '100vh',
            overflow: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(isMobile && { width: drawerWidth }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};