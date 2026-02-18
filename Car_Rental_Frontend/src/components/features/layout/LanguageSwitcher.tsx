'use client';

import React, { useState } from 'react';
import { 
  IconButton, Menu, MenuItem, Box, Typography, Tooltip 
} from '@mui/material';
import { useLanguage, useTranslation } from '@/lib/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'full';
  color?: 'light' | 'dark';
}

const languages = [
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
];

export const LanguageSwitcher = ({ 
  variant = 'icon', 
  color = 'dark' 
}: LanguageSwitcherProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code: 'fr' | 'en') => {
    setLanguage(code);
    handleClose();
  };

  const currentLanguage = languages.find(l => l.code === language);
  const iconColor = color === 'light' ? '#333' : '#fff';
  const bgColor = color === 'light' ? '#f5f5f5' : '#141414';
  const borderColor = color === 'light' ? '#e0e0e0' : '#262626';

  return (
    <>
      <Tooltip title={t('booking.changeLanguage')}>
        <IconButton
          onClick={handleOpen}
          sx={{
            color: iconColor,
            bgcolor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            px: variant === 'full' ? 1.5 : 1,
            '&:hover': { bgcolor: color === 'light' ? '#e8e8e8' : '#1f1f1f' }
          }}
        >
          {variant === 'full' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '1rem' }}>{currentLanguage?.flag}</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {language.toUpperCase()}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: '1.1rem' }}>{currentLanguage?.flag}</Typography>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: color === 'light' ? '#fff' : '#141414',
            borderRadius: '10px',
            border: `1px solid ${borderColor}`,
            minWidth: 140,
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            selected={language === lang.code}
            sx={{
              py: 1.2,
              px: 2,
              gap: 1.5,
              color: color === 'light' ? '#333' : '#fff',
              '&.Mui-selected': {
                bgcolor: color === 'light' ? '#f0f0f0' : '#262626'
              },
              '&:hover': {
                bgcolor: color === 'light' ? '#f5f5f5' : '#1f1f1f'
              }
            }}
          >
            <Typography sx={{ fontSize: '1.1rem' }}>{lang.flag}</Typography>
            <Typography variant="body2" fontWeight={600}>{lang.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
