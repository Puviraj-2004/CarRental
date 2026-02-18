'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtp } from '@/hooks/graphql/useVerifyOtp';
import { useResendOtp } from '@/hooks/graphql/useResendOtp';
import { VerifyOtpView } from './VerifyOtpView';
import { useTranslation } from '@/lib/LanguageContext';

export const VerifyOtpContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { t } = useTranslation();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');

  const onCompleted = (data: any) => {
    if (data.verifyOTP.success) {
      setSuccess(t('auth.verifiedRedirecting'));
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  const onError = (err: any) => {
    setError(t('auth.enterAllDigits'));
  };

  const onResendCompleted = (data: any) => {
    if (data.resendOTP.success) {
      setResendSuccess(t('containerMessages.otpSentEmail'));
      setError('');
      setResendCooldown(60); // 60 second cooldown
      setTimeout(() => setResendSuccess(''), 3000);
    }
  };

  const onResendError = (err: any) => {
    setError(t('containerMessages.failedResendOtp'));
  };

  const { executeVerify, loading } = useVerifyOtp(onCompleted, onError);
  const { executeResend, loading: resendLoading } = useResendOtp(onResendCompleted, onResendError);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError(t('auth.enterAllDigits'));
      return;
    }
    executeVerify(email, fullOtp);
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !email) return;
    setError('');
    setResendSuccess('');
    executeResend(email);
  };

  return (
    <VerifyOtpView
      email={email}
      otp={otp}
      error={error}
      success={success}
      resendSuccess={resendSuccess}
      loading={loading}
      resendLoading={resendLoading}
      resendCooldown={resendCooldown}
      onOtpChange={handleOtpChange}
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
      onResend={handleResend}
      t={t}
    />
  );
};