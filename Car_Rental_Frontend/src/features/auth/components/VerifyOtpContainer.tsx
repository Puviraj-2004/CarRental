'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { VerifyOtpView } from './VerifyOtpView';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useResendOtp } from '../hooks/useResendOtp';

export const VerifyOtpContainer: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { executeVerify, loading: loadingVerify } = useVerifyOtp(
    () => {
      // Upon successful verification, redirect user to login
      router.push('/login');
    },
    (err) => {
      setError(err.message);
    }
  );

  const { executeResend, loading: loadingResend } = useResendOtp(
    () => {
      setResendSuccess(true);
    },
    (err) => {
      setError(err.message);
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(false);

    const formData = new FormData(e.currentTarget);
    const otp = formData.get('otp') as string;

    executeVerify(email, otp);
  };

  const handleResend = () => {
    setError(null);
    setResendSuccess(false);
    if (!email) {
      setError(t('common.error'));
      return;
    }
    executeResend(email);
  };

  return (
    <VerifyOtpView
      t={t}
      email={email}
      onSubmit={handleSubmit}
      error={error}
      loadingVerify={loadingVerify}
      onResend={handleResend}
      loadingResend={loadingResend}
      resendSuccess={resendSuccess}
    />
  );
};