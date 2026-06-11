'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { RegisterView } from './RegisterView';
import { useRegister } from '../hooks/useRegister';

export const RegisterContainer: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { executeRegister, loading } = useRegister();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    try {
      const res = await executeRegister({  email, password, phoneNumber });
      if (res.data?.register) {
        // Redirect to OTP verification page, passing email in query params
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return <RegisterView t={t} onSubmit={handleSubmit} error={error} loading={loading} />;
};