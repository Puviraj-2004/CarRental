'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { useLanguage } from '@/lib/LanguageContext';

type Language = 'en' | 'fr';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: Language | null) => {
    if (value && value !== language) {
      setLanguage(value);
    }
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.45,
        borderRadius: 999,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) => `0 8px 28px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          display: { xs: 'none', sm: 'grid' },
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
        }}
      >
        <TranslateRoundedIcon sx={{ fontSize: 17 }} />
      </Box>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={language}
        onChange={handleChange}
        aria-label={t('layout.language.label')}
        sx={{
          gap: 0.35,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            mx: 0,
            borderRadius: '999px !important',
          },
          '& .MuiToggleButton-root': {
            minWidth: 42,
            height: 30,
            px: 1.25,
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1,
            textTransform: 'uppercase',
            transition: 'all 180ms ease',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-1px)',
            },
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: (theme) => `0 8px 22px ${alpha(theme.palette.primary.main, 0.32)}`,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          },
        }}
      >
        <ToggleButton value="fr" aria-label={t('layout.language.french')}>
          FR
        </ToggleButton>
        <ToggleButton value="en" aria-label={t('layout.language.english')}>
          EN
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};