'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';
import { PaymentSuccessView } from './PaymentSuccessView';

/**
 * Senior Architect Note:
 * This container handles client-side dynamic parameters.
 * Since useSearchParams() can cause pre-render bailing, we wrap the consumer.
 */
export const PaymentSuccessContainer = () => {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const bookingId = searchParams.get('bookingId');

  return <PaymentSuccessView bookingId={bookingId} t={t} />;
};