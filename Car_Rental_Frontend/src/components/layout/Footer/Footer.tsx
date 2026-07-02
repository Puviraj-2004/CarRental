'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { useLanguage } from '@/lib/LanguageContext';

const footerLinks = [
  { labelKey: 'navbar.home', href: '/' },
  { labelKey: 'navbar.cars', href: '/cars' },
  { labelKey: 'navbar.about', href: '/about' },
  { labelKey: 'navbar.login', href: '/login' },
];

const trustItems = [
  {
    icon: ShieldRoundedIcon,
    labelKey: 'layout.footer.attributes.verifiedFleet',
  },
  {
    icon: FactCheckRoundedIcon,
    labelKey: 'layout.footer.attributes.documentReview',
  },
  {
    icon: PaymentsRoundedIcon,
    labelKey: 'layout.footer.attributes.securePayments',
  },
];

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          right: -180,
          top: -220,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 4, md: 5 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 52%, #60a5fa 100%)',
                    boxShadow: (theme) => `0 14px 34px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <DirectionsCarRoundedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1 }}>
                    {t('common.appName')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {t('layout.footer.tagline')}
                  </Typography>
                </Box>
              </Stack>

              <Typography color="text.secondary" sx={{ maxWidth: 460, lineHeight: 1.75 }}>
                {t('layout.footer.description')}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {trustItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Chip
                      key={item.labelKey}
                      icon={<Icon />}
                      label={t(item.labelKey)}
                      size="small"
                      sx={{
                        fontWeight: 850,
                        borderRadius: 999,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        '& .MuiChip-icon': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 950, mb: 1.5 }}>
              {t('layout.footer.quickLinks')}
            </Typography>

            <Stack spacing={1}>
              {footerLinks.map((item) => (
                <Typography
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant="body2"
                  sx={{
                    width: 'fit-content',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontWeight: 750,
                    transition: 'all 180ms ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {t(item.labelKey)}
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 950, mb: 1.5 }}>
              {t('layout.footer.securityTitle')}
            </Typography>

            <Stack spacing={1.4}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <LockRoundedIcon color="primary" sx={{ fontSize: 20, mt: 0.15 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {t('layout.footer.securityDescription')}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <PaymentsRoundedIcon color="primary" sx={{ fontSize: 20, mt: 0.15 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {t('layout.footer.paymentDescription')}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} <strong>{t('common.appName')}</strong>. {t('layout.footer.copyright')}
          </Typography>

          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700 }}>
            {t('layout.footer.poweredBy')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};