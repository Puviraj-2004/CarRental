'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField,
  Card, Stack, Divider, Alert, CircularProgress, Chip, Dialog, 
  DialogContent, MenuItem, IconButton, CardActionArea, Snackbar
} from '@mui/material';
import {
  Settings, LocalGasStation, ArrowBack, Edit, 
  EventSeat, ContentCopy, CalendarMonth, LocationOn, Shield, 
  Close, CheckCircle, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import QRCode from 'react-qr-code';

// Generate 30-minute time slots
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => `${Math.floor(i / 2).toString().padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

export const BookingView = ({
  router, car, startDate, setStartDate, startTime, setStartTime, 
  endDate, setEndDate, endTime, setEndTime, generateTimeOptions, getMinPickupDate,
  checkingAvailability, isCarAvailable, hasDates, priceDetails, 
  platformData, createBookingLoading, confirmReservationLoading, updateBookingLoading,
  changeCarDialog, setChangeCarDialog, availableCarsLoading, availableCarsData, startDateTime, endDateTime,
  validationError, emailVerificationPopup, confirmedBookingData, verificationTimer, copySuccess, handleCopyLink, onConfirmAction,
  isEditMode, isAdmin, bookingType, setBookingType, isWalkIn, setIsWalkIn, guestName, setGuestName, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
  walkInRequiresDocs, t
 }: any) => {

  // Document upload and guest info logic
  // Admin walk-in rentals use the AI/OCR verification wizard after saving, so no file upload here.
  const requireDocumentUpload = (!isAdmin && isWalkIn && bookingType !== 'REPLACEMENT');
  const showGuestInfo = isWalkIn;
  const skipDocumentUpload = bookingType === 'REPLACEMENT' || (isAdmin && isWalkIn);

  // Calendar modal state
  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'pickup' | 'return'>('pickup');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Generate calendar days for month view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const openDateTimeModal = (mode: 'pickup' | 'return') => {
    setModalMode(mode);
    setDateTimeModalOpen(true);
  };

  const handleDateSelect = (day: number | null) => {
    if (!day) return;
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    
    if (modalMode === 'pickup') {
      setStartDate(dateString);
      // Store selected date for time calculation
      selectedPickupDateRef.current = dateString;
    } else {
      setEndDate(dateString);
    }
  };

  // Ref to track the selected pickup date for time calculation
  const selectedPickupDateRef = React.useRef<string>(startDate);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    selectedPickupDateRef.current = startDate;
  }, [startDate]);

  const handleTimeSelect = (time: string) => {
    if (modalMode === 'pickup') {
      setStartTime(time);
      
      // Auto-calculate return date/time (+2 hours from pickup)
      // Use ref to get the most current pickup date (handles same-render date selection)
      const currentPickupDate = selectedPickupDateRef.current;
      if (currentPickupDate) {
        const pickupDateTime = new Date(`${currentPickupDate}T${time}:00`);
        const returnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
        const returnDateStr = `${returnDateTime.getFullYear()}-${String(returnDateTime.getMonth() + 1).padStart(2, '0')}-${String(returnDateTime.getDate()).padStart(2, '0')}`;
        const returnTimeStr = `${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`;
        setEndDate(returnDateStr);
        setEndTime(returnTimeStr);
      }
    } else {
      setEndTime(time);
    }
    // Auto close after selection
    setTimeout(() => setDateTimeModalOpen(false), 300);
  };

  const getSelectedDate = () => {
    return modalMode === 'pickup' ? startDate : endDate;
  };

  const getSelectedTime = () => {
    return modalMode === 'pickup' ? startTime : endTime;
  };

  const calendarDays = getDaysInMonth(calendarMonth);
  // Month name for calendar header - locale-aware
  const calMonthName = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    .toLocaleDateString(undefined, { month: 'short' });
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Calculate minimum return date based on pickup + 2 hours (may be next day if pickup is late)
  const getMinReturnDate = () => {
    if (!startDate || !startTime) return startDate || todayString;
    const pickupDateTime = new Date(`${startDate}T${startTime}:00`);
    const minReturnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
    return `${minReturnDateTime.getFullYear()}-${String(minReturnDateTime.getMonth() + 1).padStart(2, '0')}-${String(minReturnDateTime.getDate()).padStart(2, '0')}`;
  };
  
  const minDate = modalMode === 'pickup' ? todayString : getMinReturnDate();
  const minPickupDateTime = new Date(Date.now() + 60 * 60 * 1000);

  // Logic based on isEditMode prop
  const backButtonRoute = isAdmin
    ? (isEditMode ? '/admin/bookings' : `/admin/bookings/cars?bookingType=${bookingType}${isWalkIn ? '&isWalkIn=true' : ''}`)
    : (isEditMode ? '/bookingRecords' : '/cars');
  const backButtonText = isAdmin ? t('common.back') : (isEditMode ? t('booking.backToRecords') : t('booking.backToFleet'));

  const mainActionButtonText = isEditMode ? t('booking.updateBooking') : (isAdmin && isWalkIn ? t('booking.saveWalkIn') : t('booking.confirmReservation'));

  const walkInMissing = isAdmin && isWalkIn && (!guestName?.trim() || !guestPhone?.trim());

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="xl" sx={{ }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            onClick={() => router.push(backButtonRoute)} 
            sx={{ cursor: 'pointer', color: '#64748B' }}
          >
            <ArrowBack fontSize="small" /> <Typography fontWeight={600}>{backButtonText}</Typography>
          </Stack>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            {isEditMode ? t('booking.modifyReservation') : t('booking.secureCheckout')}
          </Typography>
          <Box width={50} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={4}>
              {/* 1. DATE SELECTOR */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                   <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <CalendarMonth sx={{ color: '#7C3AED' }} /> {t('booking.tripDates')}
                   </Typography>
                   {checkingAvailability && <Chip size="small" label={t('booking.checkingAvailability')} />}
                </Box>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" mb={1} display="block">{t('booking.pickup')}</Typography>
                    <Button
                      fullWidth
                      onClick={() => openDateTimeModal('pickup')}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#F8FAFC',
                        color: '#0F172A',
                        fontWeight: 600,
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': { bgcolor: '#F1F5F9', borderColor: '#7C3AED' }
                      }}
                    >
                      <CalendarMonth sx={{ mr: 1, color: '#7C3AED' }} />
                      {startDate && startTime ? `${startDate} ${startTime}` : t('booking.selectDateTime')}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" mb={1} display="block">{t('booking.dropoff')}</Typography>
                    <Button
                      fullWidth
                      onClick={() => openDateTimeModal('return')}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#F8FAFC',
                        color: '#0F172A',
                        fontWeight: 600,
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': { bgcolor: '#F1F5F9', borderColor: '#7C3AED' }
                      }}
                    >
                      <CalendarMonth sx={{ mr: 1, color: '#7C3AED' }} />
                      {endDate && endTime ? `${endDate} ${endTime}` : t('booking.selectDateTime')}
                    </Button>
                  </Grid>
                </Grid>
                {validationError && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    {validationError}
                  </Alert>
                )}
                {!isCarAvailable && hasDates && (
                  <Alert severity="error" sx={{ mt: 3 }} action={<Button color="error" size="small" onClick={() => setChangeCarDialog(true)}>{t('booking.changeCar')}</Button>}>
                    {t('booking.carUnavailable')}
                  </Alert>
                )}
              </Paper>

              {/* 2. VEHICLE INFO */}
              <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <LocationOn sx={{ color: '#7C3AED' }} /> {t('booking.selectedVehicle')}
                   </Typography>
                   <Button startIcon={<Edit />} size="small" onClick={() => setChangeCarDialog(true)} sx={{ color: '#7C3AED', fontWeight: 700 }}>{t('booking.change')}</Button>
                </Box>
                <Grid container alignItems="center">
                   <Grid item xs={12} md={5} sx={{ bgcolor: '#F8FAFC', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, position: 'relative' }}>
                      <Image 
                        src={car?.images?.[0]?.url} 
                        alt="car" 
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={true}
                      />
                   </Grid>
                   <Grid item xs={12} md={7} sx={{ p: 4 }}>
                      <Typography variant="overline" color="primary" fontWeight={800}>{car?.brand?.name}</Typography>
                      <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ mb: 2 }}>{car?.model?.name}</Typography>
                      <Stack direction="row" spacing={1} mb={3}>
                         <Chip label={car?.transmission} size="small" icon={<Settings sx={{fontSize:14}}/>} />
                         <Chip label={car?.fuelType} size="small" icon={<LocalGasStation sx={{fontSize:14}}/>} />
                         <Chip label={`${car?.seats} ${t('carDetails.seats')}`} size="small" icon={<EventSeat sx={{fontSize:14}}/>} />
                      </Stack>
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                      <Box display="flex" gap={4}>
                        <Box><Typography variant="caption" color="text.secondary">{t('booking.dailyLimit')}</Typography><Typography fontWeight={700}>{car?.dailyKmLimit || t('booking.unlimited')} {t('common.km')}</Typography></Box>
                        <Box><Typography variant="caption" color="text.secondary">{t('booking.deposit')}</Typography><Typography fontWeight={700}>€{car?.depositAmount}</Typography></Box>
                      </Box>
                   </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', position: 'sticky', top: 100 }}>
               <Typography variant="h6" fontWeight={800} mb={3}>{t('booking.paymentSummary')}</Typography>

               {isAdmin && (
                 <Box sx={{ mb: 3, p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Chip label={t('profile.admin')} size="small" color="primary" />
                    <Typography fontWeight={700}>{t('booking.adminBookingInternal')}</Typography>
                  </Stack>
                  {/* For admin flow we do not allow changing booking type here. If this is a walk-in, show guest fields only. */}
                  {isWalkIn && (
                    <Stack spacing={1}>
                      <TextField size="small" label={t('booking.guestName')} value={guestName} onChange={(e) => setGuestName(e.target.value)} fullWidth />
                      <TextField size="small" label={t('booking.guestPhone')} value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} fullWidth />
                      <TextField size="small" label={t('booking.guestEmail')} value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} fullWidth />
                      {walkInMissing && <Alert severity="warning" sx={{ mt: 1 }}>{t('booking.guestNamePhoneRequired')}</Alert>}
                    </Stack>
                  )}

                  {/* Document / verification guidance */}
                  {bookingType === 'REPLACEMENT' ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <b>{t('booking.courtesyInfo')}</b>
                    </Alert>
                  ) : isAdmin && isWalkIn ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <b>{t('booking.walkInInfo')}</b>
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <b>{t('booking.standardInfo')}</b>
                    </Alert>
                  )}

                  {requireDocumentUpload && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        type="file"
                        label={t('booking.uploadLicenseId')}
                        inputProps={{ accept: 'image/*,application/pdf' }}
                        required
                        fullWidth
                      />
                    </Box>
                  )}
                </Box>
               )}

               {priceDetails ? (
                 <Stack spacing={2.5}>
                    <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">{t('booking.rentalDuration', { duration: priceDetails.durationLabel })}</Typography><Typography fontWeight={700}>€{priceDetails.basePrice.toFixed(2)}</Typography></Box>
                    <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">{t('booking.vatPercent', { percent: String(platformData?.platformSettings?.taxPercentage || 20) })}</Typography><Typography fontWeight={700}>€{priceDetails.taxAmount.toFixed(2)}</Typography></Box>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end"><Typography variant="h6" fontWeight={800}>{t('booking.total')}</Typography><Typography variant="h4" fontWeight={800} color="#7C3AED">€{priceDetails.totalPrice.toFixed(2)}</Typography></Box>
                    <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0', display: 'flex', gap: 1 }}>
                       <Shield sx={{ color: '#16A34A', fontSize: 20 }} />
                       <Typography variant="caption" color="#15803D" fontWeight={500} lineHeight={1.4}>
                         {t('booking.noChargeVerification')}
                       </Typography>
                    </Box>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large" 
                      onClick={onConfirmAction} 
                      disabled={!isCarAvailable || !!validationError || createBookingLoading || confirmReservationLoading || updateBookingLoading || walkInMissing} 
                      sx={{ mt: 1, bgcolor: '#0F172A', py: 1.5, fontWeight: 800 }}
                    >
                      {mainActionButtonText}
                    </Button>
                 </Stack>
               ) : (
                 <Box textAlign="center" py={4} color="text.secondary">{t('booking.selectDatesForPrice')}</Box>
               )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CHANGE CAR MODAL */}
      <Dialog open={changeCarDialog} onClose={() => setChangeCarDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
           <Typography variant="h6" fontWeight={800} color="#0F172A">{t('booking.availableCarsForDates')}</Typography>
           <IconButton onClick={() => setChangeCarDialog(false)}><Close /></IconButton>
        </Box>
        <DialogContent sx={{ p: 4 }}>
           {availableCarsLoading ? <CircularProgress /> : (
             <Grid container spacing={3}>
                {availableCarsData?.availableCars?.map((c: any) => (
                  <Grid item xs={12} sm={6} md={4} key={c.id}>
                     <Card variant="outlined" sx={{ borderRadius: 4 }} onClick={() => router.push(`/booking?carId=${c.id}&start=${startDateTime}&end=${endDateTime}`)}>
                        <CardActionArea sx={{ p: 2 }}>
                          <Box sx={{ height: 140, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <Image 
                              src={c.images?.[0]?.url} 
                              alt="car" 
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              loading="lazy"
                            />
                          </Box>
                          <Typography fontWeight={900} mt={2}>{c.model.name}</Typography>
                          <Typography variant="h6" color="primary" fontWeight={800}>€{c.pricePerDay}{t('booking.perDay')}</Typography>
                        </CardActionArea>
                     </Card>
                  </Grid>
                ))}
             </Grid>
           )}
        </DialogContent>
      </Dialog>

      {/* VERIFICATION MODAL */}
      <Dialog open={emailVerificationPopup} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }} onClose={()=>{}}>
        <Grid container>
          <Grid item xs={12} md={5} sx={{ bgcolor: '#7C3AED', p: 5, color: 'white' }}>
             <CheckCircle sx={{ fontSize: 60, mb: 3 }} />
             <Typography variant="h4" fontWeight={900} gutterBottom>{t('booking.bookingSaved')}</Typography>
             <Typography sx={{ opacity: 0.9 }}>{t('booking.completeVerification')}</Typography>
             <Box sx={{ mt: 5, p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="caption">{t('booking.timeRemaining')}</Typography>
                <Typography variant="h2" fontWeight={900} sx={{ fontFamily: 'monospace' }}>{verificationTimer}</Typography>
             </Box>
          </Grid>
          <Grid item xs={12} md={7} sx={{ p: 6, textAlign: 'center' }}>
             {confirmedBookingData?.verification?.token && <Box sx={{ p: 2, border: '2px solid #F1F5F9', borderRadius: 4, display: 'inline-block' }}><QRCode value={`${window.location.origin}/verification/${confirmedBookingData.verification.token}`} size={180} /></Box>}
             <Stack spacing={2} sx={{ mt: 4, maxWidth: 320, mx: 'auto' }}>
               <Button fullWidth variant="contained" size="large" onClick={handleCopyLink} startIcon={<ContentCopy />} sx={{ py: 2, borderRadius: 10, bgcolor: '#0F172A' }}>{copySuccess ? t('booking.copied') : t('booking.copyVerificationLink')}</Button>
               <Button fullWidth variant="outlined" size="large" onClick={() => router.push(isAdmin ? '/admin/bookings' : '/bookingRecords')} sx={{ py: 2, borderRadius: 10 }}>{isAdmin ? t('booking.goToAdminBookings') : t('booking.goToBookingRecords')}</Button>
             </Stack>
          </Grid>
        </Grid>
      </Dialog>

      {/* DATE/TIME PICKER MODAL */}
      <Dialog
        open={dateTimeModalOpen}
        onClose={() => setDateTimeModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', bgcolor: '#1E293B', overflow: 'hidden' }
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#1E293B' }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={900} color="#FFFFFF">
              {modalMode === 'pickup' ? t('booking.selectPickupDateTime') : t('booking.selectReturnDateTime')}
            </Typography>
            <IconButton onClick={() => setDateTimeModalOpen(false)} sx={{ color: '#FFFFFF' }}>
              <Close />
            </IconButton>
          </Stack>

          <Grid container spacing={3}>
            {/* Calendar Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'rgba(124, 58, 237, 0.05)', p: 3, borderRadius: '16px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography fontWeight={700} color="#FFFFFF">
                    {calMonthName} {calendarMonth.getFullYear()}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                      sx={{ color: '#7C3AED' }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                      sx={{ color: '#7C3AED' }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Day Headers */}
                <Grid container sx={{ mb: 1 }}>
                  {[t('booking.daysSun'), t('booking.daysMon'), t('booking.daysTue'), t('booking.daysWed'), t('booking.daysThu'), t('booking.daysFri'), t('booking.daysSat')].map((day) => (
                    <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight={700} color="rgba(255, 255, 255, 0.5)">{day}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Days */}
                <Grid container spacing={0.5}>
                  {calendarDays.map((day, idx) => {
                    const isDisabled = !day || new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) < new Date(minDate.split('-').map(Number)[0], minDate.split('-').map(Number)[1] - 1, minDate.split('-').map(Number)[2]);
                    const dateStr = day ? `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                    const isSelected = day && getSelectedDate() === dateStr;

                    return (
                      <Grid item xs={12 / 7} key={idx}>
                        {day ? (
                          <Button
                            onClick={() => handleDateSelect(day)}
                            disabled={isDisabled}
                            fullWidth
                            sx={{
                              aspectRatio: '1',
                              p: 0,
                              borderRadius: '10px',
                              bgcolor: isSelected ? '#7C3AED' : 'rgba(124, 58, 237, 0.05)',
                              color: isSelected ? '#FFFFFF' : '#FFFFFF',
                              fontWeight: isSelected ? 700 : 500,
                              border: isSelected ? '2px solid #7C3AED' : 'none',
                              opacity: isDisabled ? 0.3 : 1,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': !isDisabled ? { bgcolor: isSelected ? '#7C3AED' : 'rgba(124, 58, 237, 0.15)' } : {}
                            }}
                          >
                            {day}
                          </Button>
                        ) : (
                          <Box />
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>

            {/* Time Slots Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'rgba(124, 58, 237, 0.05)', p: 3, borderRadius: '16px', border: '1px solid rgba(124, 58, 237, 0.2)', maxHeight: '400px', overflowY: 'auto' }}>
                <Typography fontWeight={700} color="#FFFFFF" sx={{ mb: 2 }}>{t('booking.selectTime')}</Typography>
                <Grid container spacing={1}>
                  {TIME_SLOTS.filter((time: string) => {
                    const selectedDateStr = getSelectedDate();
                    if (!selectedDateStr) return true; // Show all if no date selected
                    const isPickupToday = modalMode === 'pickup' && selectedDateStr === todayString;
                    const slotDate = new Date(`${selectedDateStr}T${time}:00`);
                    
                    // Filter out unavailable pickup time slots (must be 1h from now)
                    if (isPickupToday && slotDate < minPickupDateTime) return false;
                    
                    // Filter out unavailable return time slots
                    if (modalMode === 'return' && startDate && startTime) {
                      const pickupDateTime = new Date(`${startDate}T${startTime}:00`);
                      const minReturnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
                      const minReturnDateStr = `${minReturnDateTime.getFullYear()}-${String(minReturnDateTime.getMonth() + 1).padStart(2, '0')}-${String(minReturnDateTime.getDate()).padStart(2, '0')}`;
                      
                      // If selected return date is the minimum return date, filter times before minimum return time
                      if (selectedDateStr === minReturnDateStr && slotDate < minReturnDateTime) return false;
                    }
                    return true;
                  }).map((time: string) => {
                    const isSelected = getSelectedTime() === time;
                    return (
                      <Grid item xs={6} key={time}>
                        <Button
                          onClick={() => handleTimeSelect(time)}
                          fullWidth
                          sx={{
                            p: 1.5,
                            borderRadius: '10px',
                            bgcolor: isSelected ? '#7C3AED' : 'rgba(124, 58, 237, 0.05)',
                            color: '#FFFFFF',
                            fontWeight: isSelected ? 700 : 500,
                            border: isSelected ? '2px solid #7C3AED' : '1px solid rgba(124, 58, 237, 0.2)',
                            textTransform: 'none',
                            '&:hover': { bgcolor: isSelected ? '#7C3AED' : 'rgba(124, 58, 237, 0.15)' }
                          }}
                        >
                          {time}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Confirm Button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              onClick={() => setDateTimeModalOpen(false)}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#7C3AED',
                color: '#FFFFFF',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                '&:hover': { bgcolor: '#6D28D9' }
              }}
            >
              {t('booking.confirm')}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar open={copySuccess} autoHideDuration={2000} onClose={() => {}} message={t('booking.linkCopied')} />
    </Box>
  );
};