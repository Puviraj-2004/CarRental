'use client';

import { createTheme, Theme } from '@mui/material/styles';

const fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const getTheme = (_mode: 'light' | 'dark' = 'light'): Theme =>
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#2563EB',
        light: '#DBEAFE',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#111827',
        light: '#374151',
        dark: '#030712',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#F8FAFC',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#111827',
        secondary: '#6B7280',
      },
      divider: '#E5E7EB',
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
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: '#F8FAFC',
          },
          body: {
            backgroundColor: '#F8FAFC',
            color: '#111827',
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
            borderBottom: '1px solid #E5E7EB',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid #E5E7EB',
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
            minHeight: 38,
            borderRadius: 8,
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
            borderRadius: 8,
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
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
          },
          notchedOutline: {
            borderColor: '#D1D5DB',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#6B7280',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 650,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: '#F9FAFB',
            color: '#374151',
            fontWeight: 750,
            borderBottom: '1px solid #E5E7EB',
          },
          body: {
            borderBottom: '1px solid #EEF2F7',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
          },
        },
      },
    },
  });
