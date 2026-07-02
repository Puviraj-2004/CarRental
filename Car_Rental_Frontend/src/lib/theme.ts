'use client';

import { createTheme, Theme } from '@mui/material/styles';

const fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const radius = {
  control: 8,
  card: 8,
};
const color = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryDark: '#1D4ED8',
  secondary: '#111827',
  secondaryLight: '#374151',
  secondaryDark: '#030712',
  background: '#F8FAFC',
  paper: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  divider: '#E5E7EB',
};

export const getTheme = (_mode: 'light' | 'dark' = 'light'): Theme =>
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: color.primary,
        light: color.primaryLight,
        dark: color.primaryDark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: color.secondary,
        light: color.secondaryLight,
        dark: color.secondaryDark,
        contrastText: '#FFFFFF',
      },
      background: {
        default: color.background,
        paper: color.paper,
      },
      text: {
        primary: color.textPrimary,
        secondary: color.textSecondary,
      },
      divider: color.divider,
      success: {
        main: '#16A34A',
        light: '#DCFCE7',
        dark: '#15803D',
      },
      warning: {
        main: '#D97706',
        light: '#FEF3C7',
        dark: '#B45309',
      },
      error: {
        main: '#DC2626',
        light: '#FEE2E2',
        dark: '#B91C1C',
      },
      info: {
        main: '#0284C7',
        light: '#E0F2FE',
        dark: '#0369A1',
      },
    },
    typography: {
      fontFamily,
      h1: { fontWeight: 750, fontSize: '2.25rem', lineHeight: 1.15, letterSpacing: 0 },
      h2: { fontWeight: 750, fontSize: '1.875rem', lineHeight: 1.2, letterSpacing: 0 },
      h3: { fontWeight: 750, fontSize: '1.5rem', lineHeight: 1.25, letterSpacing: 0 },
      h4: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.3, letterSpacing: 0 },
      h5: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.35, letterSpacing: 0 },
      h6: { fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, letterSpacing: 0 },
      subtitle1: { fontWeight: 650, lineHeight: 1.45, letterSpacing: 0 },
      subtitle2: { fontWeight: 650, lineHeight: 1.45, letterSpacing: 0 },
      body1: { lineHeight: 1.55, letterSpacing: 0 },
      body2: { lineHeight: 1.5, letterSpacing: 0 },
      button: { textTransform: 'none', fontWeight: 650, letterSpacing: 0 },
      overline: { fontWeight: 750, letterSpacing: 0.4, textTransform: 'uppercase' },
    },
    shape: {
      borderRadius: radius.control,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: color.background,
          },
          body: {
            backgroundColor: color.background,
            color: color.textPrimary,
          },
          '*': {
            boxSizing: 'border-box',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom: `1px solid ${color.divider}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: color.divider,
          },
          elevation1: {
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${color.divider}`,
            borderRadius: radius.card,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 44,
            borderRadius: radius.control,
            padding: '8px 14px',
            boxShadow: 'none',
          },
          sizeLarge: {
            minHeight: 44,
            padding: '10px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: '#D1D5DB',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.control,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.control,
            backgroundColor: color.paper,
          },
          notchedOutline: {
            borderColor: '#D1D5DB',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: color.textSecondary,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.control,
            fontWeight: 650,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radius.card,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: '#F9FAFB',
            color: color.secondaryLight,
            fontWeight: 750,
            borderBottom: `1px solid ${color.divider}`,
          },
          body: {
            borderBottom: '1px solid #EEF2F7',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.control,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.card,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
