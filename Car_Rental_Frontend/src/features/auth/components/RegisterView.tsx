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
import Paper from '@mui/material/Paper';
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
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
          p: { xs: 2.5, sm: 4 },
          borderRadius: 2,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main' }}>
              {t('auth.register.eyebrow')}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
              {t('auth.register.title')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('auth.register.subtitle')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack component="form" onSubmit={onSubmit} spacing={2}>
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
                      size="small"
                      edge="end"
                      aria-label={showConfirmPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? <CircularProgress color="inherit" size={20} /> : t('auth.register.submit')}
            </Button>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={0.75} justifyContent="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('auth.register.hasAccount')}
            </Typography>
            <Typography
              component={Link}
              href="/login"
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: 750, textDecoration: 'none' }}
            >
              {t('auth.register.loginLink')}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};
