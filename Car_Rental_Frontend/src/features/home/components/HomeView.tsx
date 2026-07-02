'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ManageHistoryRoundedIcon from '@mui/icons-material/ManageHistoryRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import Link from 'next/link';
import Image from 'next/image';
import type { Car } from '../../cars/hooks/useCar';

interface HomeViewProps {
  t: (path: string) => string;
  featuredCars: Car[];
  loadingCars: boolean;
}

const trustItems = [
  {
    icon: ShieldRoundedIcon,
    title: 'home.trust.payments.title',
    description: 'home.trust.payments.description',
  },
  {
    icon: FactCheckRoundedIcon,
    title: 'home.trust.verification.title',
    description: 'home.trust.verification.description',
  },
  {
    icon: ManageHistoryRoundedIcon,
    title: 'home.trust.operations.title',
    description: 'home.trust.operations.description',
  },
];

const processItems = [
  {
    step: '01',
    icon: SearchRoundedIcon,
    title: 'home.process.browse.title',
    description: 'home.process.browse.description',
  },
  {
    step: '02',
    icon: FactCheckRoundedIcon,
    title: 'home.process.verify.title',
    description: 'home.process.verify.description',
  },
  {
    step: '03',
    icon: DirectionsCarRoundedIcon,
    title: 'home.process.drive.title',
    description: 'home.process.drive.description',
  },
];

const heroStats = [
  {
    icon: VerifiedRoundedIcon,
    value: 'home.hero.stats.verified.value',
    label: 'home.hero.stats.verified.label',
  },
  {
    icon: LockRoundedIcon,
    value: 'home.hero.stats.documents.value',
    label: 'home.hero.stats.documents.label',
  },
  {
    icon: SupportAgentRoundedIcon,
    value: 'home.hero.stats.support.value',
    label: 'home.hero.stats.support.label',
  },
];

const quickDetails = [
  {
    icon: SpeedRoundedIcon,
    title: 'home.quickSearch.details.availability.title',
    description: 'home.quickSearch.details.availability.description',
  },
  {
    icon: CalendarMonthRoundedIcon,
    title: 'home.quickSearch.details.dates.title',
    description: 'home.quickSearch.details.dates.description',
  },
  {
    icon: ShieldRoundedIcon,
    title: 'home.quickSearch.details.confidence.title',
    description: 'home.quickSearch.details.confidence.description',
  },
];

const aiCards = [
  {
    icon: PhoneIphoneRoundedIcon,
    title: 'home.aiFeature.cards.upload.title',
    description: 'home.aiFeature.cards.upload.description',
  },
  {
    icon: FactCheckRoundedIcon,
    title: 'home.aiFeature.cards.review.title',
    description: 'home.aiFeature.cards.review.description',
  },
  {
    icon: CheckCircleRoundedIcon,
    title: 'home.aiFeature.cards.approve.title',
    description: 'home.aiFeature.cards.approve.description',
  },
];

const finalCtaItems = [
  { icon: LockRoundedIcon, label: 'home.finalCta.secure' },
  { icon: VerifiedRoundedIcon, label: 'home.finalCta.verified' },
  { icon: ManageHistoryRoundedIcon, label: 'home.finalCta.managed' },
];

const sectionHeaderSx = {
  maxWidth: 780,
  mx: 'auto',
  textAlign: 'center',
  mb: { xs: 4, md: 6 },
};

const premiumCardSx = {
  height: '100%',
  borderRadius: 4,
  border: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
  transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
  willChange: 'transform',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.015)',
    boxShadow: (theme: any) => `0 24px 70px ${alpha(theme.palette.common.black, 0.14)}`,
    borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.35),
  },
};

export const HomeView: React.FC<HomeViewProps> = ({ t, featuredCars, loadingCars }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        overflow: 'hidden',
        '@keyframes softFloat': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        '@keyframes softPulse': {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.04)' },
        },
      }}
    >
      {/* HERO */}
      <Box
        component="section"
        sx={{
          minHeight: { xs: 'calc(100svh - 70px)', md: 'calc(100svh - 86px)' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        <Image
          src="/images/home/HeroSection.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.30), transparent 34%), linear-gradient(90deg, rgba(2,6,23,0.94) 0%, rgba(15,23,42,0.78) 48%, rgba(15,23,42,0.22) 100%)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            right: { xs: -180, md: 60 },
            top: { xs: 120, md: 90 },
            borderRadius: '50%',
            background: 'rgba(96,165,250,0.28)',
            filter: 'blur(70px)',
            animation: 'softPulse 6s ease-in-out infinite',
          }}
        />

        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label={t('home.hero.eyebrow')}
                sx={{
                  color: '#fff',
                  fontWeight: 900,
                  borderRadius: 99,
                  border: '1px solid rgba(255,255,255,0.22)',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  mt: 2.5,
                  mb: 2.5,
                  fontWeight: 950,
                  lineHeight: 0.98,
                  letterSpacing: '-0.065em',
                  fontSize: { xs: '3rem', sm: '4.5rem', md: '6.4rem' },
                  color: '#fff',
                  overflowWrap: 'break-word',
                }}
              >
                {t('home.hero.title')}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  maxWidth: 720,
                  color: 'rgba(255,255,255,0.84)',
                  lineHeight: 1.58,
                  fontWeight: 400,
                  mb: 4,
                  overflowWrap: 'break-word',
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
                  sx={{
                    px: 4,
                    py: 1.45,
                    fontWeight: 950,
                    borderRadius: 999,
                    width: { xs: '100%', sm: 'auto' },
                    boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 24px 70px rgba(0,0,0,0.34)',
                    },
                  }}
                >
                  {t('home.hero.primaryCta')}
                </Button>

                <Button
                  component={Link}
                  href="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.45,
                    fontWeight: 950,
                    borderRadius: 999,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(10px)',
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'transform 200ms ease, background-color 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.02)',
                      borderColor: '#fff',
                      bgcolor: 'rgba(255,255,255,0.12)',
                    },
                  }}
                >
                  {t('home.hero.secondaryCta')}
                </Button>
              </Stack>

              <Grid container spacing={2} sx={{ mt: 5 }}>
                {heroStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Grid item xs={12} sm={4} key={item.value}>
                      <Box
                        sx={{
                          p: 2.25,
                          borderRadius: 3,
                          border: '1px solid rgba(255,255,255,0.16)',
                          bgcolor: 'rgba(255,255,255,0.10)',
                          backdropFilter: 'blur(14px)',
                          transition: 'transform 200ms ease, background-color 200ms ease',
                          '&:hover': {
                            transform: 'translateY(-5px) scale(1.02)',
                            bgcolor: 'rgba(255,255,255,0.16)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: 'rgba(255,255,255,0.16)',
                            }}
                          >
                            <Icon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 950, lineHeight: 1 }}>{t(item.value)}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                              {t(item.label)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  animation: { md: 'softFloat 7s ease-in-out infinite' },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,0.18)',
                    bgcolor: 'rgba(15,23,42,0.58)',
                    backdropFilter: 'blur(22px)',
                    boxShadow: '0 30px 90px rgba(0,0,0,0.34)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 950, fontSize: '1.2rem' }}>
                        {t('home.hero.floatingCard.title')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                        {t('home.hero.floatingCard.status')}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: 'rgba(34,197,94,0.16)',
                        color: '#86efac',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <CheckCircleRoundedIcon />
                    </Box>
                  </Stack>

                  {[
                    t('home.hero.floatingCard.pickup'),
                    t('home.hero.floatingCard.documents'),
                    t('home.hero.floatingCard.approval'),
                  ].map((label, index) => (
                    <Stack
                      key={label}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        mb: index === 2 ? 0 : 1.25,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          bgcolor: index === 2 ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.12)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 950,
                          color: index === 2 ? '#86efac' : '#fff',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
                    </Stack>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* TRUST */}
      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 10 },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={sectionHeaderSx}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 950, letterSpacing: 1.1 }}>
              {t('home.trust.eyebrow')}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 950, mt: 1, mb: 2, letterSpacing: '-0.04em' }}>
              {t('home.trust.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {t('home.trust.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <Grid item xs={12} md={4} key={item.title}>
                  <Card
                    variant="outlined"
                    sx={{
                      ...premiumCardSx,
                      background: (theme) =>
                        `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.055)}, ${theme.palette.background.paper} 54%)`,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          display: 'grid',
                          placeItems: 'center',
                          mb: 3,
                          boxShadow: (theme) => `0 16px 38px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 950, mb: 1 }}>
                        {t(item.title)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
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

      {/* QUICK SEARCH */}
      <Box component="section" sx={{ py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 950 }}>
                {t('home.quickSearch.eyebrow')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 950, mt: 1, mb: 2, letterSpacing: '-0.045em' }}>
                {t('home.quickSearch.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85, mb: 3 }}>
                {t('home.quickSearch.subtitle')}
              </Typography>
              <Button
                component={Link}
                href="/cars"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  px: 3,
                  py: 1.2,
                  fontWeight: 950,
                  borderRadius: 999,
                  transition: 'transform 200ms ease',
                  '&:hover': { transform: 'translateY(-3px) scale(1.02)' },
                }}
              >
                {t('home.quickSearch.cta')}
              </Button>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 420, sm: 500, md: 560 },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 280, sm: 360, md: 430 },
                    borderRadius: 5,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => `0 24px 80px ${alpha(theme.palette.common.black, 0.16)}`,
                  }}
                >
                  <Image
                    src="/images/home/hero-main.png"
                    alt={t('home.quickSearch.title')}
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>

                <Grid
                  container
                  spacing={2}
                  sx={{
                    position: { xs: 'relative', md: 'absolute' },
                    left: { md: 28 },
                    right: { md: 28 },
                    bottom: { md: 10 },
                    mt: { xs: -5, md: 0 },
                    px: { xs: 1.5, md: 0 },
                  }}
                >
                  {quickDetails.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Grid item xs={12} sm={4} key={item.title}>
                        <Card
                          sx={{
                            height: '100%',
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(18px)',
                            border: 1,
                            borderColor: 'rgba(255,255,255,0.65)',
                            boxShadow: '0 18px 60px rgba(15,23,42,0.16)',
                            transition: 'transform 220ms ease',
                            '&:hover': { transform: 'translateY(-8px) scale(1.02)' },
                          }}
                        >
                          <CardContent sx={{ p: 2.25 }}>
                            <Icon color="primary" />
                            <Typography sx={{ fontWeight: 950, mt: 1, mb: 0.75 }}>
                              {t(item.title)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.55, display: 'block' }}>
                              {t(item.description)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* PROCESS */}
      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 11 },
          bgcolor: 'background.paper',
          backgroundImage: (theme) =>
            `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent 35%)`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={sectionHeaderSx}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 950 }}>
              {t('home.process.eyebrow')}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 950, mt: 1, mb: 2, letterSpacing: '-0.045em' }}>
              {t('home.process.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.85 }}>
              {t('home.process.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {processItems.map((item) => {
              const Icon = item.icon;

              return (
                <Grid item xs={12} md={4} key={item.title}>
                  <Card variant="outlined" sx={premiumCardSx}>
                    <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            width: 58,
                            height: 58,
                            borderRadius: 3,
                            bgcolor: 'grey.100',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Icon />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '2.4rem',
                            lineHeight: 1,
                            fontWeight: 950,
                            color: 'text.disabled',
                            letterSpacing: '-0.08em',
                          }}
                        >
                          {item.step}
                        </Typography>
                      </Stack>

                      <Typography variant="h6" sx={{ fontWeight: 950, mb: 1 }}>
                        {t(item.title)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
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

      {/* AI FEATURE */}
      <Box component="section" sx={{ py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 340, md: 500 },
                  borderRadius: 5,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  boxShadow: (theme) => `0 26px 90px ${alpha(theme.palette.common.black, 0.16)}`,
                }}
              >
                <Image
                  src="/images/home/ai-check.png"
                  alt={t('home.aiFeature.title')}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 30%, rgba(2,6,23,0.72) 100%)',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    left: 24,
                    right: 24,
                    bottom: 24,
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(18px)',
                    color: '#fff',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ color: '#86efac' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 950 }}>{t('home.aiFeature.title')}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.74)' }}>
                        {t('home.aiFeature.eyebrow')}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 950 }}>
                {t('home.aiFeature.eyebrow')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 950, mt: 1, mb: 2, letterSpacing: '-0.045em' }}>
                {t('home.aiFeature.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85, mb: 3 }}>
                {t('home.aiFeature.description')}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {aiCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Grid item xs={12} sm={4} key={item.title}>
                      <Box
                        sx={{
                          p: 2,
                          height: '100%',
                          borderRadius: 3,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          transition: 'transform 200ms ease, border-color 200ms ease',
                          '&:hover': {
                            transform: 'translateY(-6px) scale(1.015)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Icon color="primary" fontSize="small" />
                        <Typography sx={{ fontWeight: 950, mt: 1, mb: 0.75, fontSize: '0.92rem' }}>
                          {t(item.title)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.55, display: 'block' }}>
                          {t(item.description)}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Button
                component={Link}
                href="/profile"
                variant="outlined"
                endIcon={<FactCheckRoundedIcon />}
                sx={{
                  fontWeight: 950,
                  borderRadius: 999,
                  px: 3,
                  py: 1.15,
                  transition: 'transform 200ms ease',
                  '&:hover': { transform: 'translateY(-3px) scale(1.02)' },
                }}
              >
                {t('home.aiFeature.cta')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURED FLEET */}
      <Box component="section" sx={{ py: { xs: 7, md: 11 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            spacing={3}
            sx={{ mb: 5 }}
          >
            <Box>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 950 }}>
                {t('home.fleet.eyebrow')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 950, mt: 1, mb: 1, letterSpacing: '-0.045em' }}>
                {t('home.fleet.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, lineHeight: 1.75 }}>
                {t('home.fleet.subtitle')}
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/cars"
              variant="text"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ fontWeight: 950, borderRadius: 999 }}
            >
              {t('home.fleet.browseAll')}
            </Button>
          </Stack>

          {loadingCars ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : featuredCars.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <DirectionsCarRoundedIcon color="disabled" sx={{ fontSize: 52, mb: 2 }} />
              <Typography color="text.secondary">{t('home.fleet.emptyState')}</Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {featuredCars.map((car) => (
                <Grid item xs={12} sm={6} md={4} key={car.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      ...premiumCardSx,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      {car.primaryImageUrl ? (
                        <CardMedia
                          component="img"
                          height="230"
                          image={car.primaryImageUrl}
                          alt={`${car.model.brand.name} ${car.model.name}`}
                          loading="lazy"
                          decoding="async"
                          sx={{
                            objectFit: 'cover',
                            transition: 'transform 450ms ease',
                            '.MuiCard-root:hover &': {
                              transform: 'scale(1.06)',
                            },
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 230,
                            bgcolor: 'grey.100',
                            display: 'grid',
                            placeItems: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <DirectionsCarRoundedIcon />
                        </Box>
                      )}

                      <Chip
                        icon={<VerifiedRoundedIcon />}
                        label={t('home.fleet.cardLabels.verified')}
                        size="small"
                        sx={{
                          position: 'absolute',
                          left: 14,
                          top: 14,
                          fontWeight: 900,
                          bgcolor: 'rgba(255,255,255,0.92)',
                          backdropFilter: 'blur(12px)',
                          '& .MuiChip-icon': { color: 'primary.main' },
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.25 }}>
                        {car.model.brand.name} {car.model.name}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
                        <Chip size="small" icon={<DirectionsCarRoundedIcon />} label={car.model.brand.name} />
                        <Chip size="small" icon={<CreditCardRoundedIcon />} label={t('home.fleet.cardLabels.dailyRate')} />
                      </Stack>

                      <Divider sx={{ my: 2.5 }} />

                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mt: 'auto' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 950 }}>
                            {formatPrice(Number(car.basePrice))}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('home.fleet.priceSuffix')}
                          </Typography>
                        </Box>

                        <Button
                          component={Link}
                          href={`/viewDetails/${car.id}`}
                          variant="outlined"
                          sx={{
                            fontWeight: 950,
                            borderRadius: 999,
                            whiteSpace: 'nowrap',
                          }}
                        >
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

      {/* FINAL CTA */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 11 },
          color: 'primary.contrastText',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 18% 20%, rgba(96,165,250,0.38), transparent 32%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #1d4ed8 100%)',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="overline" sx={{ fontWeight: 950, color: 'rgba(255,255,255,0.72)' }}>
            {t('home.finalCta.eyebrow')}
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 950,
              mt: 1,
              mb: 2,
              letterSpacing: '-0.05em',
              color: '#fff',
            }}
          >
            {t('home.finalCta.title')}
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.76)', lineHeight: 1.85, mb: 3 }}>
            {t('home.finalCta.subtitle')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mb: 4 }}>
            {finalCtaItems.map((item) => {
              const Icon = item.icon;

              return (
                <Chip
                  key={item.label}
                  icon={<Icon />}
                  label={t(item.label)}
                  sx={{
                    color: '#fff',
                    fontWeight: 900,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(10px)',
                    '& .MuiChip-icon': { color: '#fff' },
                  }}
                />
              );
            })}
          </Stack>

          <Button
            component={Link}
            href="/cars"
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              px: 4,
              py: 1.35,
              fontWeight: 950,
              borderRadius: 999,
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.03)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.32)',
              },
            }}
          >
            {t('home.finalCta.cta')}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};