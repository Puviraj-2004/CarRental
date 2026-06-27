'use client';

import React, { useState } from 'react';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface RegisterViewProps {
  t: (path: string) => string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  loading: boolean;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ t, onSubmit, error, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 460px' },
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
            minHeight: 680,
            p: 5,
            color: 'common.white',
            backgroundImage: 'linear-gradient(180deg, rgba(2, 6, 23, 0.12), rgba(2, 6, 23, 0.78)), url("/images/auth/register-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box sx={{ maxWidth: 520 }}>
            <Typography variant="overline" sx={{ fontWeight: 900 }}>
              {t('auth.register.eyebrow')}
            </Typography>
            <Typography variant="h3" component="p" sx={{ mt: 1, fontWeight: 900, lineHeight: 1.05 }}>
              {t('auth.register.imageTitle')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, color: 'rgba(255,255,255,0.82)' }}>
              {t('auth.register.imageSubtitle')}
            </Typography>
          </Box>
        </Box>

        <Stack justifyContent="center" sx={{ px: { xs: 3, sm: 5 }, py: { xs: 5, md: 7 } }}>
          <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900 }}>
              {t('auth.register.eyebrow')}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mt: 1, fontWeight: 900 }}>
              {t('auth.register.title')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
              {t('auth.register.subtitle')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Stack component="form" onSubmit={onSubmit} spacing={2} sx={{ mt: 4 }}>
              <TextField
                name="email"
                type="email"
                label={t('auth.register.email')}
                autoComplete="email"
                required
                fullWidth
              />
              <TextField
                name="phoneNumber"
                type="tel"
                label={t('auth.register.phone')}
                autoComplete="tel"
                fullWidth
              />
              <TextField
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('auth.register.password')}
                autoComplete="new-password"
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('auth.register.confirmPassword')}
                autoComplete="new-password"
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={showConfirmPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.45, borderRadius: 2, fontWeight: 900, textTransform: 'none' }}
              >
                {loading ? <CircularProgress color="inherit" size={22} /> : t('auth.register.submit')}
              </Button>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('auth.register.hasAccount')}
              </Typography>
              <Typography
                component={Link}
                href="/login"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 800, textDecoration: 'none' }}
              >
                {t('auth.register.loginLink')}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};
