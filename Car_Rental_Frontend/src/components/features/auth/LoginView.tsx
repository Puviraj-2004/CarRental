'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box, Typography, TextField, Button, InputAdornment, 
  Link, Divider, IconButton, Alert, Stack, Grid, CircularProgress,
  Container, alpha, GlobalStyles
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, Google, Facebook,
  Visibility, VisibilityOff, ArrowBack
} from '@mui/icons-material';

interface LoginViewProps {
  settings: any;
  formData: any;
  setFormData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
  onNavigate: (path: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const THEME = {
  bg: '#050505',
  glass: 'rgba(15, 15, 15, 0.85)',
  accent: '#D4AF37',
  text: '#FFFFFF',
  textSub: '#808080',
  border: '#1F1F1F'
};

export const LoginView = ({
  settings,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
  onGoogleLogin,
  onNavigate,
  t
}: LoginViewProps) => {

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#000000',
      color: THEME.text,
      transition: 'all 0.3s ease',
      border: `1px solid ${THEME.border}`,
      '& fieldset': { border: 'none' },
      '&:hover': { borderColor: THEME.accent },
      '&.Mui-focused': { 
        borderColor: THEME.accent,
        boxShadow: `0 0 15px ${alpha(THEME.accent, 0.15)}`,
      },
    },
    '& input': { 
      py: 1.8,
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px #000000 inset !important',
        WebkitTextFillColor: '#FFFFFF !important',
      }
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: THEME.textSub }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: THEME.bg, display: 'flex', overflowX: 'hidden' }}>
      <GlobalStyles styles={{
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px #000000 inset !important',
          WebkitTextFillColor: '#FFFFFF !important',
        },
      }} />

      <Grid container>
        <Grid item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
          <Image src="/images/auth/login.jpg" alt="Fleet" fill style={{ objectFit: 'cover' }} priority />
          <Box sx={{ 
            position: 'absolute', inset: 0,
            background: `linear-gradient(to right, ${THEME.bg}, transparent 70%)`
          }} />
          
          <Box sx={{ position: 'absolute', top: 60, left: 60, zIndex: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ 
                width: 42, height: 42, bgcolor: THEME.accent, borderRadius: '10px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Typography sx={{ fontWeight: 900, color: '#000', fontSize: '1.2rem' }}>
                  {settings?.companyName?.[0]}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: THEME.text, letterSpacing: 2, textTransform: 'uppercase' }}>
                {settings?.companyName}
              </Typography>
            </Box>
            <Typography variant="h1" sx={{ fontWeight: 900, color: THEME.text, fontSize: '4.8rem', lineHeight: 1, letterSpacing: -2 }}>
              {t('auth.eliteAccess').split('.')[0]} <br /> <span style={{ color: THEME.accent }}>{t('auth.eliteAccess').includes('.') ? t('auth.eliteAccess').split('.')[1] + '.' : ''}</span>
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} lg={5} sx={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          px: { xs: 2, sm: 6 }, py: 6, position: 'relative'
        }}>
          
          <IconButton
            onClick={() => onNavigate('/')}
            sx={{
              position: 'absolute', top: 20, left: 20,
              bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', transform: 'scale(1.05)' },
            }}
          >
            <ArrowBack sx={{ fontSize: 20, color: THEME.text }} />
          </IconButton>

          <Container maxWidth="xs" sx={{ 
            bgcolor: THEME.glass, p: { xs: 4, sm: 5 }, borderRadius: '28px',
            border: `1px solid ${THEME.border}`, boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: THEME.text, mb: 1 }}>{t('auth.loginTitle')}</Typography>
                <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    {settings?.companyName} {t('auth.executiveConsole')}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: alpha('#D32F2F', 0.1), color: '#FF8A8A', border: '1px solid rgba(211, 47, 47, 0.2)' }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={onSubmit} autoComplete="off">
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: THEME.textSub, mb: 1, display: 'block', fontWeight: 800, ml: 1 }}>{t('auth.userIdentifier')}</Typography>
                  <TextField 
                    fullWidth placeholder={t('auth.placeholderLoginEmail')} sx={inputStyles}
                    autoComplete="off"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment> }} 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
                    <Typography variant="caption" sx={{ color: THEME.textSub, fontWeight: 800 }}>{t('auth.securityKey')}</Typography>
                    <Link href="#" sx={{ fontSize: '0.75rem', color: THEME.accent, textDecoration: 'none', fontWeight: 800 }}>{t('auth.recovery')}</Link>
                  </Box>
                  <TextField 
                    fullWidth placeholder="••••••••" type={showPassword ? 'text' : 'password'} sx={inputStyles}
                    autoComplete="new-password"
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: THEME.textSub }}>
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Button 
                  type="submit" fullWidth disabled={loading}
                  sx={{ 
                    bgcolor: THEME.accent, color: '#000', py: 2.2, borderRadius: '14px', fontWeight: 900,
                    fontSize: '0.9rem', letterSpacing: 2, mt: 1,
                    '&:hover': { bgcolor: '#FFFFFF', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s ease'
                  }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.secureSignIn')}
                </Button>

                <Box sx={{ position: 'relative', py: 1.5 }}>
                  <Divider sx={{ borderColor: THEME.border }} />
                  <Typography variant="caption" sx={{ 
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    bgcolor: '#121212', px: 2, color: THEME.textSub, fontWeight: 800
                  }}>{t('auth.or')}</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button fullWidth onClick={onGoogleLogin} sx={{ py: 1.5, borderRadius: '12px', border: `1px solid ${THEME.border}`, color: '#FFF', fontWeight: 700 }} startIcon={<Google />}>Google</Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button fullWidth sx={{ py: 1.5, borderRadius: '12px', border: `1px solid ${THEME.border}`, color: '#FFF', fontWeight: 700 }} startIcon={<Facebook />}>Facebook</Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: THEME.textSub }}>
                        {t('auth.newPartner')} {' '}
                        <Link href="/register" sx={{ color: THEME.accent, fontWeight: 800, textDecoration: 'none' }}>{t('auth.applyNow')}</Link>
                    </Typography>
                </Box>
              </Stack>
            </form>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};