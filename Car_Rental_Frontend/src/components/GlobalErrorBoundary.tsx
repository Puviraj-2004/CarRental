'use client';

import React from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface GlobalErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: 'default' | 'admin' | 'auth' | 'fullscreen';
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ error, reset, variant = 'default' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const styles = {
    default: {
      bgcolor: '#F8FAFC',
      color: '#0F172A',
      subColor: '#64748B',
      btnBg: '#0F172A',
      btnColor: '#FFFFFF',
      minHeight: '60vh',
    },
    admin: {
      bgcolor: '#FBFBFE',
      color: '#0F172A',
      subColor: '#64748B',
      btnBg: '#0F172A',
      btnColor: '#FFFFFF',
      minHeight: '80vh',
    },
    auth: {
      bgcolor: '#0F172A',
      color: '#FFFFFF',
      subColor: '#94A3B8',
      btnBg: '#FFFFFF',
      btnColor: '#0F172A',
      minHeight: '100vh',
    },
    fullscreen: {
      bgcolor: '#F8FAFC',
      color: '#0F172A',
      subColor: '#64748B',
      btnBg: '#0F172A',
      btnColor: '#FFFFFF',
      minHeight: '100vh',
    },
  };

  const s = styles[variant];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: s.minHeight,
        bgcolor: s.bgcolor,
        px: 3,
        py: 6,
      }}
    >
      <Box
        sx={{
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: variant === 'auth' ? 'rgba(255,255,255,0.08)' : '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 32, color: variant === 'auth' ? '#FCA5A5' : '#DC2626' }} />
        </Box>

        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          fontWeight={800}
          sx={{ color: s.color, letterSpacing: '-0.01em' }}
        >
          Something went wrong
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: s.subColor, lineHeight: 1.6, maxWidth: 360 }}
        >
          {'An unexpected error occurred. Please try again.'}
        </Typography>

        {error.digest && (
          <Typography
            variant="caption"
            sx={{
              color: s.subColor,
              opacity: 0.6,
              fontFamily: 'monospace',
              fontSize: '0.7rem',
            }}
          >
            Error ID: {error.digest}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            onClick={reset}
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              bgcolor: s.btnBg,
              color: s.btnColor,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': { bgcolor: s.btnBg, opacity: 0.9 },
            }}
          >
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{
              borderColor: variant === 'auth' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
              color: s.color,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: variant === 'auth' ? 'rgba(255,255,255,0.4)' : '#CBD5E1',
                bgcolor: variant === 'auth' ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
              },
            }}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GlobalErrorBoundary;
