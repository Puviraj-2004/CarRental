'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/lib/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Replace the return block in Footer.tsx with this:
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        bgcolor: 'grey.50',
        borderTop: 1,
        borderColor: 'grey.100',
        textAlign: 'center',
        display: { xs: 'none', md: 'block' } // HIDE on Mobile/Tablet, SHOW on Desktop
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          © {currentYear} <strong>{t('common.appName')}</strong>. All rights reserved.
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
          Powered by safe, instant AI document verification & secure Stripe processing.
        </Typography>
      </Container>
    </Box>
  );
};