'use client';

import React from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useLanguage } from '@/lib/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        p: 0.25,
      }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={language}
        onChange={(_, value: 'en' | 'fr' | null) => {
          if (value) setLanguage(value);
        }}
        sx={{
          gap: 0.25,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            borderRadius: '6px !important',
            minWidth: 34,
            height: 28,
            px: 1,
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 750,
            lineHeight: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          },
        }}
      >
        <ToggleButton value="fr" aria-label="Francais">
          FR
        </ToggleButton>
        <ToggleButton value="en" aria-label="English">
          EN
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
