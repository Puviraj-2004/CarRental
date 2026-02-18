'use client';

import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import SafeImage from '@/components/SafeImage';

interface AboutViewProps {
  t: (key: string) => string;
}

export const AboutView = ({ t }: AboutViewProps) => {
  return (
    <Box sx={{ minHeight: '60vh', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>{t('about.title')}</Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>{t('about.description1')}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>{t('about.description2')}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: 360, borderRadius: 3, overflow: 'hidden' }}>
              <SafeImage src="/images/home/hero-main.png" alt="About" fill style={{ objectFit: 'cover' }} fallback={'/images/home/hero-main.png'} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
