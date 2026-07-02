'use client';

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '@/lib/LanguageContext';

interface GlobalLoadingProps {
  variant?: 'default' | 'admin' | 'auth' | 'fullscreen';
  message?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ variant = 'default', message }) => {
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
        gap: 2.5,
        px: 2,
      }}
    >
      <CircularProgress
        size={isMobile ? 36 : 44}
        thickness={3.5}
        sx={{
          color: isAuth ? 'primary.contrastText' : 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography variant="body2" color={isAuth ? 'inherit' : 'text.secondary'} sx={{ fontWeight: 600, textAlign: 'center' }}>
        {message || t('layout.global.loading')}
      </Typography>
    </Box>
  );
};

export default GlobalLoading;
