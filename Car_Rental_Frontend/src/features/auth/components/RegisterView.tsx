'use client';

import React, { useState } from 'react';
import { alpha } from '@mui/material/styles';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Image from 'next/image';

interface RegisterViewProps {
  t: (path: string) => string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  loading: boolean;
}

const registerBenefits = [
  'auth.register.benefits.profile',
  'auth.register.benefits.documents',
  'auth.register.benefits.booking',
];

export const RegisterView: React.FC<RegisterViewProps> = ({ t, onSubmit, error, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 74px)',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 7 },
        bgcolor: 'background.default',
        overflow: 'hidden',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 12% 16%, ${alpha(theme.palette.primary.main, 0.16)}, transparent 30%),
           radial-gradient(circle at 90% 8%, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 28%)`,
        '@keyframes softFloat': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 5 }} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Paper
              variant="outlined"
              sx={{
                height: '100%',
                width: '100%',
                p: { xs: 2.5, sm: 4 },
                borderRadius: 5,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
                backdropFilter: 'blur(18px)',
                boxShadow: (theme) => `0 28px 90px ${alpha(theme.palette.common.black, 0.12)}`,
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Chip
                    icon={<ShieldRoundedIcon />}
                    label={t('auth.register.eyebrow')}
                    sx={{
                      mb: 2,
                      fontWeight: 900,
                      borderRadius: 999,
                      color: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      '& .MuiChip-icon': { color: 'primary.main' },
                    }}
                  />

                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 950,
                      letterSpacing: '-0.045em',
                      lineHeight: 1.05,
                      mb: 1.5,
                    }}
                  >
                    {t('auth.register.title')}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {t('auth.register.subtitle')}
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {error}
                  </Alert>
                )}

                <Stack component="form" onSubmit={onSubmit} spacing={2}>
                  <TextField
                    name="fullName"
                    type="text"
                    label={t('auth.register.fullName')}
                    helperText={t('auth.register.fullNameHelper')}
                    autoComplete="name"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />

                  <TextField
                    name="email"
                    type="email"
                    label={t('auth.register.email')}
                    helperText={t('auth.register.emailHelper')}
                    autoComplete="email"
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />

                  <TextField
                    name="phoneNumber"
                    type="tel"
                    label={t('auth.register.phone')}
                    helperText={t('auth.register.phoneHelper')}
                    autoComplete="tel"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />

                  <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label={t('auth.register.password')}
                    helperText={t('auth.register.passwordHelper')}
                    autoComplete="new-password"
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            edge="end"
                            aria-label={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />

                  <TextField
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label={t('auth.register.confirmPassword')}
                    helperText={t('auth.register.confirmPasswordHelper')}
                    autoComplete="new-password"
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            edge="end"
                            aria-label={
                              showConfirmPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')
                            }
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOffRoundedIcon fontSize="small" />
                            ) : (
                              <VisibilityRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    sx={{
                      minHeight: 52,
                      borderRadius: 999,
                      fontWeight: 950,
                      textTransform: 'none',
                      boxShadow: (theme) => `0 16px 36px ${alpha(theme.palette.primary.main, 0.28)}`,
                      transition: 'transform 200ms ease, box-shadow 200ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.01)',
                        boxShadow: (theme) => `0 22px 52px ${alpha(theme.palette.primary.main, 0.34)}`,
                      },
                    }}
                  >
                    {loading ? <CircularProgress color="inherit" size={22} /> : t('auth.register.submit')}
                  </Button>
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={0.75} justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    {t('auth.register.hasAccount')}
                  </Typography>
                  <Typography
                    component={Link}
                    href="/login"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 900,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {t('auth.register.loginLink')}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box
              sx={{
                height: '100%',
                minHeight: { xs: 430, md: 720 },
                position: 'relative',
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => `0 28px 90px ${alpha(theme.palette.common.black, 0.16)}`,
              }}
            >
              <Image
                src="/images/auth/register-hero.png"
                alt={t('auth.register.imageTitle')}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 58vw"
                style={{ objectFit: 'cover' }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(2,6,23,0.78) 0%, rgba(15,23,42,0.48) 48%, rgba(15,23,42,0.18) 100%)',
                }}
              />

              <Stack
                spacing={3}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  p: { xs: 3, sm: 4, md: 5 },
                  justifyContent: 'space-between',
                  color: '#fff',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Chip
                    icon={<DirectionsCarRoundedIcon />}
                    label={t('auth.register.imageBadge')}
                    sx={{
                      color: '#fff',
                      fontWeight: 900,
                      borderRadius: 999,
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(14px)',
                      '& .MuiChip-icon': { color: '#fff' },
                    }}
                  />

                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(14px)',
                      animation: 'softFloat 6s ease-in-out infinite',
                    }}
                  >
                    <ShieldRoundedIcon />
                  </Box>
                </Stack>

                <Box sx={{ maxWidth: 560 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 950,
                      letterSpacing: '-0.05em',
                      lineHeight: 1.05,
                      mb: 2,
                      color: '#fff',
                    }}
                  >
                    {t('auth.register.imageTitle')}
                  </Typography>

                  <Typography sx={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, mb: 3 }}>
                    {t('auth.register.imageSubtitle')}
                  </Typography>

                  <Stack spacing={1.3}>
                    {registerBenefits.map((item) => (
                      <Stack
                        key={item}
                        direction="row"
                        spacing={1.4}
                        alignItems="center"
                        sx={{
                          width: 'fit-content',
                          maxWidth: '100%',
                          px: 1.7,
                          py: 1.15,
                          borderRadius: 999,
                          bgcolor: 'rgba(255,255,255,0.13)',
                          border: '1px solid rgba(255,255,255,0.16)',
                          backdropFilter: 'blur(14px)',
                          transition: 'transform 180ms ease, background-color 180ms ease',
                          '&:hover': {
                            transform: 'translateX(5px) scale(1.01)',
                            bgcolor: 'rgba(255,255,255,0.18)',
                          },
                        }}
                      >
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#86efac' }} />
                        <Typography variant="body2" sx={{ fontWeight: 850 }}>
                          {t(item)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};