'use client';

import React from 'react';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 440px' },
          minHeight: { md: 'calc(100vh - 160px)' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.10)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'flex-end',
            minHeight: 620,
            p: 5,
            color: 'common.white',
            backgroundImage: 'linear-gradient(180deg, rgba(2, 6, 23, 0.14), rgba(2, 6, 23, 0.78)), url("/images/auth/register-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box sx={{ maxWidth: 500 }}>
            <Typography variant="overline" sx={{ fontWeight: 900 }}>
              {t('auth.verifyOtp.eyebrow')}
            </Typography>
            <Typography variant="h3" component="p" sx={{ mt: 1, fontWeight: 900, lineHeight: 1.05 }}>
              {t('auth.verifyOtp.imageTitle')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, color: 'rgba(255,255,255,0.82)' }}>
              {t('auth.verifyOtp.imageSubtitle')}
            </Typography>
          </Box>
        </Box>

        <Stack justifyContent="center" sx={{ px: { xs: 3, sm: 5 }, py: { xs: 5, md: 7 } }}>
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                mb: 3,
              }}
            >
              <MarkEmailReadRoundedIcon />
            </Box>

            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900 }}>
              {t('auth.verifyOtp.eyebrow')}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mt: 1, fontWeight: 900 }}>
              {t('auth.verifyOtp.title')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
              {t('auth.verifyOtp.subtitle')} <Box component="strong" sx={{ color: 'text.primary' }}>{email}</Box>
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {resendSuccess && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {t('auth.verifyOtp.resendSuccess')}
              </Alert>
            )}

            <Stack component="form" onSubmit={onSubmit} spacing={2.25} sx={{ mt: 4 }}>
              <TextField
                name="otp"
                type="text"
                label={t('auth.verifyOtp.code')}
                required
                fullWidth
                inputProps={{
                  maxLength: 6,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: { textAlign: 'center', letterSpacing: '0.35em', fontSize: 24, fontWeight: 800 },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loadingVerify}
                sx={{ py: 1.45, borderRadius: 2, fontWeight: 900, textTransform: 'none' }}
              >
                {loadingVerify ? <CircularProgress color="inherit" size={22} /> : t('auth.verifyOtp.submit')}
              </Button>
            </Stack>

            <Button
              onClick={onResend}
              disabled={loadingResend}
              sx={{ mt: 2, px: 0, fontWeight: 800, textTransform: 'none' }}
            >
              {loadingResend ? <CircularProgress size={20} /> : t('auth.verifyOtp.resend')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};
