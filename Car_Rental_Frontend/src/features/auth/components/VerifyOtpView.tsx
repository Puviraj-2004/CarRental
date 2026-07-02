'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

interface VerifyOtpViewProps {
  t: (path: string) => string;
  email: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  loadingVerify: boolean;
  onResend: () => void;
  loadingResend: boolean;
  resendSuccess: boolean;
}

const otpSteps = [
  'auth.verifyOtp.steps.email',
  'auth.verifyOtp.steps.code',
  'auth.verifyOtp.steps.access',
];

export const VerifyOtpView: React.FC<VerifyOtpViewProps> = ({
  t,
  email,
  onSubmit,
  error,
  loadingVerify,
  onResend,
  loadingResend,
  resendSuccess,
}) => {
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
          `radial-gradient(circle at 14% 18%, ${alpha(theme.palette.primary.main, 0.16)}, transparent 30%),
           radial-gradient(circle at 86% 10%, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 28%)`,
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
                  <Box
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 58,
                      height: 58,
                      borderRadius: 3,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      mb: 2,
                      boxShadow: (theme) => `0 16px 36px ${alpha(theme.palette.primary.main, 0.18)}`,
                    }}
                  >
                    <MarkEmailReadRoundedIcon />
                  </Box>

                  <Chip
                    icon={<SecurityRoundedIcon />}
                    label={t('auth.verifyOtp.eyebrow')}
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
                    {t('auth.verifyOtp.title')}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {t('auth.verifyOtp.subtitle')}{' '}
                    <Box component="strong" sx={{ color: 'text.primary', fontWeight: 900 }}>
                      {email}
                    </Box>
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {error}
                  </Alert>
                )}

                {resendSuccess && (
                  <Alert severity="success" sx={{ borderRadius: 3 }}>
                    {t('auth.verifyOtp.resendSuccess')}
                  </Alert>
                )}

                <Stack component="form" onSubmit={onSubmit} spacing={2}>
                  <TextField
                    name="otp"
                    type="text"
                    label={t('auth.verifyOtp.code')}
                    helperText={t('auth.verifyOtp.codeHelper')}
                    required
                    fullWidth
                    inputProps={{
                      maxLength: 6,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                      '& input': {
                        textAlign: 'center',
                        letterSpacing: 6,
                        typography: 'h5',
                        fontWeight: 950,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loadingVerify}
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
                    {loadingVerify ? <CircularProgress color="inherit" size={22} /> : t('auth.verifyOtp.submit')}
                  </Button>
                </Stack>

                <Button
                  onClick={onResend}
                  disabled={loadingResend}
                  sx={{
                    alignSelf: 'center',
                    fontWeight: 900,
                    borderRadius: 999,
                    textTransform: 'none',
                  }}
                >
                  {loadingResend ? <CircularProgress size={18} /> : t('auth.verifyOtp.resend')}
                </Button>

                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" color="text.secondary">
                  <LockRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {t('auth.verifyOtp.secureNote')}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box
              sx={{
                height: '100%',
                minHeight: { xs: 420, md: 620 },
                position: 'relative',
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => `0 28px 90px ${alpha(theme.palette.common.black, 0.16)}`,
              }}
            >
              <Image
                src="/images/auth/verify-otp-hero.png"
                alt={t('auth.verifyOtp.imageTitle')}
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
                    icon={<MarkEmailReadRoundedIcon />}
                    label={t('auth.verifyOtp.imageBadge')}
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
                    <SecurityRoundedIcon />
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
                    {t('auth.verifyOtp.imageTitle')}
                  </Typography>

                  <Typography sx={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, mb: 3 }}>
                    {t('auth.verifyOtp.imageSubtitle')}
                  </Typography>

                  <Stack spacing={1.3}>
                    {otpSteps.map((item) => (
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