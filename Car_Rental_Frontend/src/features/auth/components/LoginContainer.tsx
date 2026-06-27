'use client';

import React, { useState } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { LoginView } from './LoginView';

export const LoginContainer: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const isNativeApp = useIsNativeApp();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isNativeApp || status !== 'authenticated') return;
    router.replace(session?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/cars');
  }, [isNativeApp, router, session?.user?.role, status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(t('auth.login.errorInvalid'));
      } else {
        if (isNativeApp) {
          const session = await getSession();
          router.replace(session?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/cars');
          return;
        }

        router.refresh();
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return <LoginView t={t} onSubmit={handleSubmit} error={error} loading={loading} />;
};
