'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Link from 'next/link';

interface RegisterViewProps {
  t: (path: string) => string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  loading: boolean;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ t, onSubmit, error, loading }) => {
  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {t('auth.register.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
          {t('auth.register.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              name="email"
              type="email"
              required
              placeholder={t('auth.register.email')}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
            />
            <input
              name="phoneNumber"
              type="tel"
              placeholder={t('auth.register.phone')}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
            />
            <input
              name="password"
              type="password"
              required
              placeholder={t('auth.register.password')}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
            />
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder={t('auth.register.confirmPassword')}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mt: 1, fontWeight: 600 }}
            >
              {t('auth.register.submit')}
            </Button>
          </div>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: '4px', fontSize: '14px' }}>
          <Typography sx={{ color: 'text.secondary' }}>{t('auth.register.hasAccount')}</Typography>
          <Link href="/login" style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'none' }}>
            {t('auth.register.loginLink')}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};