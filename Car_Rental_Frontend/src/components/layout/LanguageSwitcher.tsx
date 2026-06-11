'use client';

import React from 'react';
import Button from '@mui/material/Button';
import { useLanguage } from '@/lib/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button
        size="small"
        variant={language === 'fr' ? 'contained' : 'outlined'}
        onClick={() => setLanguage('fr')}
        sx={{ minWidth: '40px', fontWeight: 600 }}
      >
        FR
      </Button>
      <Button
        size="small"
        variant={language === 'en' ? 'contained' : 'outlined'}
        onClick={() => setLanguage('en')}
        sx={{ minWidth: '40px', fontWeight: 600 }}
      >
        EN
      </Button>
    </div>
  );
};