'use client';

import { createTheme, Theme } from '@mui/material/styles';

const bodyFontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const headingFontFamily = 'Poppins, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/**
 * Generates a dynamic MUI Theme supporting both Light and Dark mode variations [1].
 */
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#F8FAFC' : '#0F172A', // Dark Navy on light, silver on dark
        light: isDark ? '#CBD5E1' : '#334155',
        dark: isDark ? '#FFFFFF' : '#020617',
        contrastText: isDark ? '#0F172A' : '#ffffff',
      },
      secondary: {
        main: isDark ? '#3B82F6' : '#2563EB', // Brighter electric blue on dark mode
        light: isDark ? '#60A5FA' : '#60A5FA',
        dark: isDark ? '#1D4ED8' : '#1D4ED8',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#090D1A' : '#F8FAFC', // Deep obsidian on dark, off-white on light
        paper: isDark ? '#131C2E' : '#ffffff',   // Slate card background on dark mode
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#1E293B',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      success: {
        main: '#10B981',
      },
      error: {
        main: '#EF4444',
      },
      divider: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(226, 232, 240, 0.8)',
    },
    typography: {
      fontFamily: bodyFontFamily,
      h1: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: '2.5rem' },
      h2: { fontFamily: headingFontFamily, fontWeight: 600, fontSize: '2rem' },
      h3: { fontFamily: headingFontFamily, fontWeight: 600, fontSize: '1.75rem' },
      h4: { fontFamily: headingFontFamily, fontWeight: 500, fontSize: '1.5rem' },
      h5: { fontFamily: headingFontFamily, fontWeight: 500, fontSize: '1.25rem' },
      h6: { fontFamily: headingFontFamily, fontWeight: 500, fontSize: '1rem' },
      button: { textTransform: 'none', fontWeight: 600, fontFamily: headingFontFamily },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.2s ease, border-color 0.2s ease', // Smooth mode transitioning [1]
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark 
                ? '0 4px 12px rgba(59, 130, 246, 0.2)' 
                : '0 4px 12px rgba(37, 99, 235, 0.2)',
            },
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
              : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          },
          containedSecondary: {
            background: isDark
              ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
              : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(226, 232, 240, 0.8)',
            backgroundImage: 'none', // Disables default MUI paper gradient overlay on dark mode
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#131C2E' : '#ffffff',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.03)',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(226, 232, 240, 0.8)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
};
