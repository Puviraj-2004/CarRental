'use client';

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/lib/LanguageContext';

export default function WaitingForApprovalPage() {
  const { t } = useLanguage();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '60vh', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <Stack spacing={2.5} alignItems="center">
            <CircularProgress />
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                {t('home.waiting.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.waiting.subtitle')}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
