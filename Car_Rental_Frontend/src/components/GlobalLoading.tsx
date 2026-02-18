'use client';

import React from 'react';
import { Box, CircularProgress, Typography, useTheme, useMediaQuery } from '@mui/material';

interface GlobalLoadingProps {
  variant?: 'default' | 'admin' | 'auth' | 'fullscreen';
  message?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ variant = 'default', message }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const styles = {
    default: {
      bgcolor: '#F8FAFC',
      color: '#0F172A',
      spinnerColor: '#0F172A',
      minHeight: '60vh',
    },
    admin: {
      bgcolor: '#FBFBFE',
      color: '#0F172A',
      spinnerColor: '#0F172A',
      minHeight: '80vh',
    },
    auth: {
      bgcolor: '#0F172A',
      color: '#FFFFFF',
      spinnerColor: '#FFFFFF',
      minHeight: '100vh',
    },
    fullscreen: {
      bgcolor: '#F8FAFC',
      color: '#0F172A',
      spinnerColor: '#0F172A',
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
        gap: 2.5,
        px: 2,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          size={isMobile ? 36 : 44}
          thickness={3.5}
          sx={{
            color: s.spinnerColor,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </Box>
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: s.color,
            opacity: 0.7,
            fontWeight: 500,
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default GlobalLoading;
