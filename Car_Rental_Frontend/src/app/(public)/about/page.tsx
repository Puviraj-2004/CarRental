'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
          {t('navbar.about')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '18px', lineHeight: 1.6 }}>
          We provide high-quality, verified vehicles with a fast, secure, and entirely digital booking experience.
        </Typography>
      </Box>
    </Container>
  );
}