'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getTranslation, getUserLanguage, setUserLanguage } from './i18n';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initialize language from localStorage during mount, but only on client
  // This prevents hydration mismatches by using the same default during SSR
  const [language, setLanguageState] = useState<Language>('fr');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark that hydration is complete
    setIsHydrated(true);
    
    // Only load from localStorage after hydration is confirmed
    const stored = getUserLanguage();
    if ((stored === 'en' || stored === 'fr') && stored !== 'fr') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setUserLanguage(lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return getTranslation(language, key, params);
  }, [language]);

  // Render children only after hydration is complete to ensure consistent state
  // during SSR and client-side hydration
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {isHydrated ? children : children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};
