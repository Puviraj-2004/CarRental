'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import type { Car } from '../../cars/hooks/useCar';

interface HomeViewProps {
  t: (path: string) => string;
  featuredCars: Car[];
  loadingCars: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ t, featuredCars, loadingCars }) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 }, borderBottom: 1, borderColor: 'grey.100' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                {t('home.hero.title')}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
                {t('home.hero.subtitle')}
              </Typography>
              <Button variant="contained" size="large" component={Link} href="/cars" sx={{ px: 4, py: 1.5, fontWeight: 600 }}>
                {t('home.hero.cta')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Trust Badges ────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('home.trust.securePayments')}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{t('home.trust.securePaymentsDesc')}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('home.trust.support')}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{t('home.trust.supportDesc')}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('home.trust.verified')}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{t('home.trust.verifiedDesc')}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ─── AI Feature Spotlight ────────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                {t('home.aiFeature.title')}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
                {t('home.aiFeature.description')}
              </Typography>
              <Button variant="contained" color="secondary" size="large" component={Link} href="/profile" sx={{ px: 4, py: 1.5, fontWeight: 600 }}>
                {t('home.aiFeature.cta')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Featured Fleet Section ─────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            {t('home.fleet.title')}
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            {t('home.fleet.subtitle')}
          </Typography>
        </Box>

        {loadingCars ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {featuredCars.map((car) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={car.primaryImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={`${car.model.brand.name} ${car.model.name}`}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {car.model.brand.name} {car.model.name}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
                      {car.basePrice.toFixed(2)} € / day
                    </Typography>
                    <Button variant="outlined" fullWidth component={Link} href={`/viewDetails/${car.id}`} sx={{ fontWeight: 600 }}>
                      {t('home.fleet.viewDetails')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};