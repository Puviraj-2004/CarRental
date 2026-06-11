'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';
import { en, TranslationKeys } from './locales/en';
import { fr } from './locales/fr';

type Language = 'en' | 'fr';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations: Record<Language, TranslationKeys> = { en, fr };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>('fr'); // Default to French on server and initial client

  useEffect(() => {
    const savedLang = getCookie('NEXT_LOCALE');
    if (savedLang === 'en' || savedLang === 'fr') {
      setLangState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    setCookie('NEXT_LOCALE', lang, { maxAge: 30 * 24 * 60 * 60 }); // 30 days expiry
  };

  const t = (path: string): string => {
    if (path === 'common.appName') {
      return process.env.NEXT_PUBLIC_COMPANY_NAME || 'CarRental';
    }
    if (path === 'common.companyEmail') {
      return process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'support@carrental.com';
    }

    const keys = path.split('.');
    let current: unknown = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }

    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {/* suppressHydrationWarning is standard here to handle local cookie transitions smoothly */}
      <div suppressHydrationWarning style={{ display: 'contents' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};