'use client';

import React from 'react';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/lib/LanguageContext';

const sections = [
  { key: 'booking', icon: ReceiptLongRoundedIcon },
  { key: 'tax', icon: CalculateRoundedIcon },
  { key: 'refund', icon: AssignmentReturnRoundedIcon },
] as const;

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '60vh', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Box sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary">
              {t('common.appName')}
            </Typography>
            <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
              {t('home.about.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('home.about.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Grid item xs={12} md={4} key={section.key}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: 'grid',
                            placeItems: 'center',
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                          }}
                        >
                          <Icon />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {t(`home.about.sections.${section.key}.title`)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t(`home.about.sections.${section.key}.description`)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="body2" color="text.secondary">
                {t('home.about.note')}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
