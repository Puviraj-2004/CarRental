'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import ManageHistoryRoundedIcon from '@mui/icons-material/ManageHistoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import Link from 'next/link';
import type { Car } from '../../cars/hooks/useCar';

interface HomeViewProps {
  t: (path: string) => string;
  featuredCars: Car[];
  loadingCars: boolean;
}

const trustItems = [
  { icon: ShieldRoundedIcon, title: 'home.trust.payments.title', description: 'home.trust.payments.description' },
  { icon: FactCheckRoundedIcon, title: 'home.trust.verification.title', description: 'home.trust.verification.description' },
  { icon: ManageHistoryRoundedIcon, title: 'home.trust.operations.title', description: 'home.trust.operations.description' },
];

const processItems = [
  { icon: SearchRoundedIcon, title: 'home.process.browse.title', description: 'home.process.browse.description' },
  { icon: FactCheckRoundedIcon, title: 'home.process.verify.title', description: 'home.process.verify.description' },
  { icon: DirectionsCarRoundedIcon, title: 'home.process.drive.title', description: 'home.process.drive.description' },
];

export const HomeView: React.FC<HomeViewProps> = ({ t, featuredCars, loadingCars }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Box
        component="section"
        sx={{
          minHeight: { xs: 'calc(100vh - 70px)', md: 'calc(100vh - 86px)' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          backgroundImage: 'linear-gradient(90deg, rgba(2, 6, 23, 0.88) 0%, rgba(15, 23, 42, 0.68) 42%, rgba(15, 23, 42, 0.18) 100%), url("/images/home/HeroSection.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)', letterSpacing: 1 }}>
              {t('home.hero.eyebrow')}
            </Typography>
            <Typography
              variant="h1"
              sx={{
                mt: 1.5,
                mb: 2.5,
                fontWeight: 900,
                lineHeight: 0.98,
                fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem' },
                color: '#fff',
              }}
            >
              {t('home.hero.title')}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 620,
                color: 'rgba(255,255,255,0.84)',
                lineHeight: 1.55,
                fontWeight: 400,
                mb: 4,
              }}
            >
              {t('home.hero.subtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                href="/cars"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ px: 3.5, py: 1.35, fontWeight: 900, borderRadius: '8px' }}
              >
                {t('home.hero.primaryCta')}
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="outlined"
                size="large"
                sx={{
                  px: 3.5,
                  py: 1.35,
                  fontWeight: 900,
                  borderRadius: '8px',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.62)',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                {t('home.hero.secondaryCta')}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <Grid item xs={12} md={4} key={item.title}>
                  <Stack direction="row" spacing={2.25} alignItems="flex-start">
                    <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.75 }}>
                        {t(item.title)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {t(item.description)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                {t('home.quickSearch.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                {t('home.quickSearch.subtitle')}
              </Typography>
              <Button component={Link} href="/cars" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 900, borderRadius: '8px' }}>
                {t('home.quickSearch.cta')}
              </Button>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  height: { xs: 260, sm: 340, md: 430 },
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  backgroundImage: 'url("/images/home/hero-main.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 760, mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5 }}>
              {t('home.process.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {t('home.process.subtitle')}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {processItems.map((item) => {
              const Icon = item.icon;
              return (
                <Grid item xs={12} md={4} key={item.title}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: '8px' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '8px', bgcolor: 'grey.100', color: 'primary.main', display: 'grid', placeItems: 'center', mb: 3 }}>
                        <Icon />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                        {t(item.title)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                        {t(item.description)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  minHeight: { xs: 300, md: 430 },
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  backgroundImage: 'url("/images/home/ai-check.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 900 }}>
                {t('home.aiFeature.eyebrow')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 2 }}>
                {t('home.aiFeature.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                {t('home.aiFeature.description')}
              </Typography>
              <Button component={Link} href="/profile" variant="outlined" endIcon={<FactCheckRoundedIcon />} sx={{ fontWeight: 900, borderRadius: '8px' }}>
                {t('home.aiFeature.cta')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3} sx={{ mb: 5 }}>
            <Box>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 900 }}>
                {t('home.fleet.eyebrow')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 1 }}>
                {t('home.fleet.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, lineHeight: 1.7 }}>
                {t('home.fleet.subtitle')}
              </Typography>
            </Box>
            <Button component={Link} href="/cars" variant="text" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 900 }}>
              {t('home.fleet.browseAll')}
            </Button>
          </Stack>

          {loadingCars ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 7 }}>
              <CircularProgress />
            </Box>
          ) : featuredCars.length === 0 ? (
            <Typography color="text.secondary">{t('home.fleet.emptyState')}</Typography>
          ) : (
            <Grid container spacing={3}>
              {featuredCars.map((car) => (
                <Grid item xs={12} sm={6} md={4} key={car.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
                    {car.primaryImageUrl ? (
                      <CardMedia
                        component="img"
                        height="220"
                        image={car.primaryImageUrl}
                        alt={`${car.model.brand.name} ${car.model.name}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ height: 220, bgcolor: 'grey.100', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
                        <DirectionsCarRoundedIcon />
                      </Box>
                    )}
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {car.model.brand.name} {car.model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {car.plateNumber}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mt: 'auto' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            {formatPrice(Number(car.basePrice))}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('home.fleet.priceSuffix')}
                          </Typography>
                        </Box>
                        <Button component={Link} href={`/viewDetails/${car.id}`} variant="outlined" sx={{ fontWeight: 900, borderRadius: '8px' }}>
                          {t('home.fleet.viewDetails')}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <LocalAtmRoundedIcon sx={{ fontSize: 42, mb: 2, opacity: 0.82 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
            {t('home.finalCta.title')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.8, mb: 3 }}>
            {t('home.finalCta.subtitle')}
          </Typography>
          <Button component={Link} href="/cars" variant="contained" color="secondary" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 900, borderRadius: '8px' }}>
            {t('home.finalCta.cta')}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
