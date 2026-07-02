'use client';

import React from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '@/lib/LanguageContext';

interface GlobalErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: 'default' | 'admin' | 'auth' | 'fullscreen';
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ error, reset, variant = 'default' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const isAuth = variant === 'auth';
  const minHeight = variant === 'fullscreen' || isAuth ? '100vh' : variant === 'admin' ? '80vh' : '60vh';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        bgcolor: isAuth ? 'secondary.dark' : 'background.default',
        color: isAuth ? 'primary.contrastText' : 'text.primary',
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
            bgcolor: isAuth ? 'secondary.light' : 'error.light',
            color: isAuth ? 'error.light' : 'error.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 850 }}>
          {t('layout.global.errorTitle')}
        </Typography>

        <Typography variant="body2" color={isAuth ? 'inherit' : 'text.secondary'} sx={{ lineHeight: 1.6, maxWidth: 360 }}>
          {t('layout.global.errorDescription')}
        </Typography>

        {error.digest && (
          <Typography variant="caption" color={isAuth ? 'inherit' : 'text.secondary'} sx={{ opacity: 0.7, fontFamily: 'monospace' }}>
            {t('layout.global.errorId')}: {error.digest}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button onClick={reset} variant="contained" startIcon={<RefreshIcon />}>
            {t('layout.global.tryAgain')}
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outlined" startIcon={<HomeIcon />} color={isAuth ? 'inherit' : 'primary'}>
            {t('layout.global.goHome')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GlobalErrorBoundary;
