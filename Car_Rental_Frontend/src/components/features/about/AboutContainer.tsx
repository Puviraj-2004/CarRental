'use client';

import React from 'react';
import { useTranslation } from '@/lib/LanguageContext';
import { AboutView } from './AboutView';

export const AboutContainer = () => {
  const { t } = useTranslation();

  return <AboutView t={t} />;
};
