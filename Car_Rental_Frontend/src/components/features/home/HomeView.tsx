'use client';

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';
import HeroSection from './sections/HeroSection';
import TrustBadges from './sections/TrustBadges';
import AIFeature from './sections/AIFeature';
import FeaturedFleet from './sections/FeaturedFleet';

interface HomeViewProps {
  featuredCars: any[];
  loading: boolean;
  error: any;
  t: (key: string, params?: Record<string, string>) => string;
}

export const HomeView = ({ featuredCars, loading, error, t }: HomeViewProps) => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <HeroSection t={t} />
      
      {/* Passing data as props to keep FeaturedFleet as a Pure UI component */}
      <FeaturedFleet 
        cars={featuredCars} 
        loading={loading} 
        error={error}
        t={t}
      />
      
      <TrustBadges t={t} />
      <AIFeature t={t} />
      
      {/* Call to Action Section - Professional Polishing applied */}
      <Box sx={{ 
        py: 12, 
        textAlign: 'center', 
        bgcolor: '#FFFFFF', 
        borderTop: '1px solid #F1F5F9' 
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900} color="#0F172A" gutterBottom>
            {t('home.readyToExperience')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400 }}>
            {t('home.joinThousands')}
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            component={Link}
            href="/register"
            sx={{ 
              px: 8, 
              py: 2, 
              borderRadius: '100px', 
              fontWeight: 800, 
              textTransform: 'none',
              bgcolor: '#0F172A',
              fontSize: '1.1rem',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
              '&:hover': { bgcolor: '#334155' }
            }} 
          >
            {t('home.createFreeAccount')}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};