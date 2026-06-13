'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
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
  startDate: string;
  endDate: string;
  bookingDuration: number;
  totalPrice: number | null;
  onApplyDates: (start: string, end: string) => void; // New callback prop
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
  startDate,
  endDate,
  bookingDuration,
  totalPrice,
  onApplyDates,
}) => {
  const [activeImage, setActiveFileUrl] = useState<string | null>(null);
  
  // Modal states for offline date configuration [1]
  const [openModal, setOpenModal] = useState(false);
  const [modalStart, setModalStart] = useState('');
  const [modalEnd, setModalEnd] = useState('');

  if (loadingCar || !car) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasDates = !!(startDate && endDate);
  const primaryImage = activeImage || car.primaryImageUrl || 'https://via.placeholder.com/600x300?text=No+Image';

  // Dynamic booking URL
  const checkoutUrl = hasDates
    ? `/booking?carId=${car.id}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    : '#';

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

  // Intercept button click if dates are missing, opening the focused popup modal instead [1]
  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!hasDates) {
      e.preventDefault(); // Prevents empty redirect loop [1]
      setOpenModal(true); // Triggers date picker popup [1]
    }
  };

  const handleApplyDatesFromModal = () => {
    if (!modalStart || !modalEnd) {
      return;
    }
    if (new Date(modalStart) >= new Date(modalEnd)) {
      alert('Pick-up date must be before Return date.');
      return;
    }
    onApplyDates(modalStart, modalEnd);
    setOpenModal(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* ─── Back Button ──────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/cars"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          {t('common.back') || 'Back to Fleet'}
        </Button>
      </Box>

      <Grid container spacing={5}>
        
        {/* ─── LEFT PANEL: MEDIA GALLERY ───────────────────────────────── */}
        <Grid item xs={12} md={7}>
          <Box sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', bgcolor: 'grey.100' }}>
            <img src={primaryImage} alt={`${car.model.brand.name}`} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }} />
          </Box>
          
          {car.images && car.images.length > 0 && (
            <Grid container spacing={1.5}>
              <Grid item xs={3} sm={2} key="primary">
                <Box
                  onClick={() => setActiveFileUrl(car.primaryImageUrl)}
                  sx={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid', borderColor: primaryImage === car.primaryImageUrl ? 'primary.main' : 'transparent', cursor: 'pointer', aspectRatio: '1/1', transition: '0.15s', '&:hover': { opacity: 0.85 } }}
                >
                  <img src={car.primaryImageUrl} alt="Primary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
              {car.images.map((img) => (
                <Grid item xs={3} sm={2} key={img.id}>
                  <Box
                    onClick={() => setActiveFileUrl(img.url)}
                    sx={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid', borderColor: primaryImage === img.url ? 'primary.main' : 'transparent', cursor: 'pointer', aspectRatio: '1/1', transition: '0.15s', '&:hover': { opacity: 0.85 } }}
                  >
                    <img src={img.url} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* ─── RIGHT PANEL: SPECIFICATIONS & CHECKOUT ─────────────────── */}
        <Grid item xs={12} md={5}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
            {car.model.brand.name} {car.model.name}
          </Typography>
          
          <Typography sx={{ color: 'text.secondary', fontWeight: 600, mb: 4, display: 'flex', gap: 1 }}>
            <span>• {car.fuelType?.name || 'Petrol'}</span>
            <span style={{ fontFamily: 'monospace' }}>• {car.plateNumber}</span>
          </Typography>

          {/* Pricing Overview */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: '16px', mb: 4, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Daily Rental Rate
                </Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                  {car.basePrice.toFixed(2)} €
                </Typography>
              </Box>

              {totalPrice && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Est. Cost ({bookingDuration} days)
                  </Typography>
                  <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 800 }}>
                    {totalPrice.toFixed(2)} €
                  </Typography>
                </Box>
              )}
            </Box>

            {hasDates && (
              <>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1} sx={{ fontSize: '13px', color: 'text.secondary' }}>
                  <Grid item xs={6}>Rental Duration:</Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700 }}>{bookingDuration} Days</Grid>
                  <Grid item xs={6}>Estimated Return Date:</Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700 }}>
                    {new Date(endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Grid>
                </Grid>
              </>
            )}
          </Card>

          {/* Availability Calendar */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: '16px', mb: 4, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventAvailableIcon sx={{ color: 'primary.main' }} />
                Availability Schedule
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button size="small" onClick={handlePrevMonth} sx={{ minWidth: '32px', fontWeight: 700 }}>&lt;</Button>
                <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                  {currentMonth.toString().padStart(2, '0')} / {currentYear}
                </Typography>
                <Button size="small" onClick={handleNextMonth} sx={{ minWidth: '32px', fontWeight: 700 }}>&gt;</Button>
              </Box>
            </Box>

            {loadingCalendar ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
            ) : (
              <Box>
                <Grid container spacing={1} columns={7} sx={{ mb: 2 }}>
                  {calendar.map((day) => (
                    <Grid item xs={1} key={day.date}>
                      <Box
                        sx={{
                          borderRadius: '8px',
                          py: 1,
                          textAlign: 'center',
                          bgcolor: day.available ? '#ecfdf5' : '#fef2f2',
                          color: day.available ? '#059669' : '#dc2626',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid',
                          borderColor: day.available ? '#10b981' : '#f87171',
                          transition: '0.2s',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      >
                        {new Date(day.date).getDate()}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#059669' }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%' }} /> Available
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#dc2626' }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: '#f87171', borderRadius: '50%' }} /> Reserved / Booked
                  </Box>
                </Box>
              </Box>
            )}
          </Card>

          {/* Primary Action Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            component={Link}
            href={checkoutUrl}
            onClick={handleBookingClick} // <-- Intercepts and blocks if no dates exist [1]
            sx={{ py: 1.6, fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '15px' }}
          >
            {hasDates ? 'Book This Car Now' : 'Select Rental Dates to Book'}
          </Button>
        </Grid>
      </Grid>

      {/* ─── NATIVE MODAL DATE SELECTOR DIALOG ────────────────────────── */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: '16px', p: 1.5, width: '100%', maxWidth: '420px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Select Trip Dates
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            
            {/* Pick-up Date */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                Pick-up Date
              </FormLabel>
              <input
                type="date"
                value={modalStart}
                onChange={(e) => setModalStart(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </FormControl>

            {/* Return Date */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                Return Date
              </FormLabel>
              <input
                type="date"
                value={modalEnd}
                onChange={(e) => setModalEnd(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </FormControl>

          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpenModal(false)} 
            variant="outlined" 
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplyDatesFromModal} 
            variant="contained" 
            disabled={!modalStart || !modalEnd}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 3 }}
          >
            Confirm Dates
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};