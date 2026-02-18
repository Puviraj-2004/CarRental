'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/hooks/useAuth';
import { GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';
import { LoginView } from './LoginView';
import { useTranslation } from '@/lib/LanguageContext';

export const LoginContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithCredentials, loginWithGoogle } = useAuth();
  const { t } = useTranslation();

  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
  const settings = platformData?.platformSettings || {};

  const handleNavigate = (path: string) => {
    router.push(path);
  };
  
  const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithCredentials(formData);

    if (result?.error) {
      const msg = String(result.error);
      if (/verify/i.test(msg)) {
        // Redirect to OTP verification if backend blocks unverified users
        setError(t('containerMessages.verifyEmailRedirecting'));
        setLoading(false);
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        return;
      }
      setError(t('containerMessages.invalidCredentials'));
      setLoading(false);
    } else {
      const session = await getSession();
      const userRole = (session?.user as any)?.role;

      // Senior Logic: Targeted Redirection
      if (redirectUrl && redirectUrl !== '/' && redirectUrl.startsWith('/')) {
        router.push(redirectUrl);
      } else if (userRole === "ADMIN") {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle(redirectUrl);
  };

  return (
    <LoginView
      settings={settings}
      formData={formData}
      setFormData={setFormData}
      showPassword={showPassword}
      setShowPassword={setOpen => setShowPassword(!showPassword)}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      onGoogleLogin={handleGoogleLogin}
      onNavigate={handleNavigate}
      t={t}
    />
  );
};