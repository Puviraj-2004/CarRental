'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Link from 'next/link';

interface LoginViewProps {
  t: (path: string) => string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  loading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ t, onSubmit, error, loading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {t('auth.login.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
          {t('auth.login.subtitle')}
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
              placeholder={t('auth.login.email')}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '16px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Password input container with integrated eye-toggle */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={t('auth.login.password')}
                style={{
                  padding: '12px',
                  paddingRight: '44px', // Space for the eye button
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666'
                }}
              >
                {showPassword ? (
                  // Eye Open SVG
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                ) : (
                  // Eye Closed (Slashed) SVG
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mt: 1, fontWeight: 600 }}
            >
              {t('auth.login.submit')}
            </Button>
          </div>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: '4px', fontSize: '14px' }}>
          <Typography sx={{ color: 'text.secondary' }}>{t('auth.login.noAccount')}</Typography>
          <Link href="/register" style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'none' }}>
            {t('auth.login.registerLink')}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};