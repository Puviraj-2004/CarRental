'use client';

import React from 'react';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
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
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 'auto',
          p: { xs: 2.5, sm: 4 },
          borderRadius: 2,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'primary.light',
                color: 'primary.dark',
                mb: 2,
              }}
            >
              <MarkEmailReadRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="overline" sx={{ color: 'primary.main' }}>
              {t('auth.verifyOtp.eyebrow')}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
              {t('auth.verifyOtp.title')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('auth.verifyOtp.subtitle')}{' '}
              <Box component="strong" sx={{ color: 'text.primary', fontWeight: 750 }}>
                {email}
              </Box>
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {resendSuccess && <Alert severity="success">{t('auth.verifyOtp.resendSuccess')}</Alert>}

          <Stack component="form" onSubmit={onSubmit} spacing={2}>
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
                style: { textAlign: 'center', letterSpacing: '0.28em', fontSize: 20, fontWeight: 750 },
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={loadingVerify} fullWidth>
              {loadingVerify ? <CircularProgress color="inherit" size={20} /> : t('auth.verifyOtp.submit')}
            </Button>
          </Stack>

          <Button onClick={onResend} disabled={loadingResend} sx={{ alignSelf: 'center', fontWeight: 750 }}>
            {loadingResend ? <CircularProgress size={18} /> : t('auth.verifyOtp.resend')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
