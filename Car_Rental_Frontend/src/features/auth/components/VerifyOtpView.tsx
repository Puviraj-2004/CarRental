'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';

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
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {t('auth.verifyOtp.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
          {t('auth.verifyOtp.subtitle')} <strong>{email}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        {resendSuccess && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {t('auth.verifyOtp.resendSuccess')}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              name="otp"
              type="text"
              required
              maxLength={6}
              placeholder={t('auth.verifyOtp.code')}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '24px',
                letterSpacing: '8px',
                textAlign: 'center',
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loadingVerify}
              sx={{ py: 1.5, mt: 1, fontWeight: 600 }}
            >
              {t('auth.verifyOtp.submit')}
            </Button>
          </div>
        </Box>

        <Button
          onClick={onResend}
          disabled={loadingResend}
          sx={{ mt: 3, textTransform: 'none', fontWeight: 600 }}
        >
          {t('auth.verifyOtp.resend')}
        </Button>
      </Box>
    </Container>
  );
};