'use client';

import React from 'react';
import { useFooter } from '@/hooks/useFooter';
import { useTranslation } from '@/lib/LanguageContext';
import { FooterView } from './FooterView';

export default function Footer() {
  const { settings, loading } = useFooter();
  const { t } = useTranslation();

  return (
    <FooterView 
      settings={settings} 
      loading={loading}
      t={t}
    />
  );
}