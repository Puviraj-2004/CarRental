'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import type { DetailedCar, CalendarDay } from '../hooks/useCarDetails';

interface DetailsViewProps {
  t: (path: string) => string;
  car: DetailedCar | null;
  loadingCar: boolean;
  calendar: CalendarDay[];
  loadingCalendar: boolean;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  t,
  car,
  loadingCar,
  calendar,
  loadingCalendar,
  currentMonth,
  currentYear,
  onMonthChange,
}) => {
  const [activeImage, setActiveFileUrl] = useState<string | null>(null);

  if (loadingCar || !car) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const primaryImage = activeImage || car.primaryImageUrl || 'https://via.placeholder.com/600x300?text=No+Image';

  const handlePrevMonth = () => {
    let nextMonth = currentMonth - 1;
    let nextYear = currentYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    onMonthChange(nextMonth, nextYear);
  };

  const handleNextMonth = () => {
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    onMonthChange(nextMonth, nextYear);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={5}>
        {/* ─── LEFT PANEL: MEDIA GALLERY ───────────────────────────────── */}
        <Grid item xs={12} md={7}>
          <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: 1, borderColor: 'grey.100', mb: 2 }}>
            <img src={primaryImage} alt={`${car.model.brand.name}`} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
          </Box>
          
          {car.images && car.images.length > 0 && (
            <Grid container spacing={1}>
              {/* Add primary cover to thumbnails list */}
              <Grid item xs={3} key="primary">
                <Box
                  onClick={() => setActiveFileUrl(car.primaryImageUrl)}
                  sx={{ borderRadius: '6px', overflow: 'hidden', border: 2, borderColor: primaryImage === car.primaryImageUrl ? 'primary.main' : 'grey.200', cursor: 'pointer', aspectRatio: '1/1' }}
                >
                  <img src={car.primaryImageUrl} alt="Primary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
              {car.images.map((img) => (
                <Grid item xs={3} key={img.id}>
                  <Box
                    onClick={() => setActiveFileUrl(img.url)}
                    sx={{ borderRadius: '6px', overflow: 'hidden', border: 2, borderColor: primaryImage === img.url ? 'primary.main' : 'grey.200', cursor: 'pointer', aspectRatio: '1/1' }}
                  >
                    <img src={img.url} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* ─── RIGHT PANEL: SPECIFICATIONS & CALENDAR ────────────────── */}
        <Grid item xs={12} md={5}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            {car.model.brand.name} {car.model.name}
          </Typography>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800, mb: 4 }}>
            {car.basePrice.toFixed(2)} € <span style={{ fontSize: '16px', fontWeight: 500, color: '#666' }}>{t('cars.details.price')}</span>
          </Typography>

          <Card variant="outlined" sx={{ p: 3, borderRadius: '12px', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('cars.details.title')}</Typography>
            <Grid container spacing={2} sx={{ fontSize: '15px' }}>
              {[
                { label: t('cars.details.specs.plate'), val: car.plateNumber },
                { label: t('cars.details.specs.fuel'),  val: car.fuelType?.name || 'Essence' },
              ].map((spec, i) => (
                <React.Fragment key={i}>
                  <Grid item xs={6} sx={{ color: 'text.secondary' }}>{spec.label}</Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600 }}>{spec.val}</Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Card>

          {/* ─── INTERACTIVE HTML AVAILABILITY CALENDAR ─────────────────── */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: '12px', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('cars.details.calendarTitle')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button size="small" onClick={handlePrevMonth} sx={{ minWidth: '32px' }}>&lt;</Button>
                <Typography sx={{ fontWeight: 700 }}>{currentMonth.toString().padStart(2, '0')} / {currentYear}</Typography>
                <Button size="small" onClick={handleNextMonth} sx={{ minWidth: '32px' }}>&gt;</Button>
              </Box>
            </Box>

            {loadingCalendar ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
            ) : (
              <Grid container spacing={1} columns={7}>
                {calendar.map((day) => (
                  <Grid item xs={1} key={day.date}>
                    <Box
                      sx={{
                        borderRadius: '6px',
                        py: 1,
                        textAlign: 'center',
                        bgcolor: day.available ? 'success.light' : 'error.light',
                        color: day.available ? 'success.dark' : 'error.dark',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: 1,
                        borderColor: day.available ? 'success.main' : 'error.main',
                        opacity: day.available ? 1 : 0.6,
                      }}
                    >
                      {new Date(day.date).getDate()}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Card>

          {/* Core Handover CTA */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            component={Link}
            href={`/booking?carId=${car.id}`}
            sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
          >
            {t('cars.details.bookBtn')}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};