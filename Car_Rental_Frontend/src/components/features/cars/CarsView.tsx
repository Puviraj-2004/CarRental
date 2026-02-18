'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Box, Container, Grid, Typography, Card, Button, Chip, Stack,
  Divider, Snackbar, Alert, MenuItem, Select,
  FormControl, Paper, IconButton, Skeleton, Drawer, Badge,
  Dialog
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  DirectionsCar as DirectionsCarIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Check as CheckIcon,
  LocalGasStation as FuelIcon,
  Settings as GearIcon,
  Person as PersonIcon,
  InfoOutlined as InfoIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

export const CarsView = ({
  mainFilter, onDateChange, onTimeChange, TIME_SLOTS,
  secondaryFilter, onCheckboxChange, brands, enums,
  loading, cars, isValidSelection, onBookClick,
  alert, onAlertClose, topBarRef,
  validationError, showValidation, hasDates,
  bookingType, isWalkIn,
  layoutForAdmin = false,
  t,
}: any) => {

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'pickup' | 'return'>('pickup');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const shouldOffsetForSidebar = isAdminPath && !layoutForAdmin;

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const openDateTimeModal = (mode: 'pickup' | 'return') => {
    setModalMode(mode);
    setDateTimeModalOpen(true);
  };

  const selectedPickupDateRef = useRef<string>(mainFilter.startDate);
  useEffect(() => { selectedPickupDateRef.current = mainFilter.startDate; }, [mainFilter.startDate]);

  const handleDateSelect = (day: number | null) => {
    if (!day) return;
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    if (modalMode === 'pickup') {
      onDateChange('startDate', dateString);
      selectedPickupDateRef.current = dateString;
    } else {
      onDateChange('endDate', dateString);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (modalMode === 'pickup') {
      onTimeChange('startTime', time);
      const currentPickupDate = selectedPickupDateRef.current;
      if (currentPickupDate) {
        const pickupDateTime = new Date(`${currentPickupDate}T${time}:00`);
        const returnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
        const returnDateStr = `${returnDateTime.getFullYear()}-${String(returnDateTime.getMonth() + 1).padStart(2, '0')}-${String(returnDateTime.getDate()).padStart(2, '0')}`;
        const returnTimeStr = `${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`;
        onDateChange('endDate', returnDateStr);
        onTimeChange('endTime', returnTimeStr);
      }
    } else {
      onTimeChange('endTime', time);
    }
    setTimeout(() => setDateTimeModalOpen(false), 300);
  };

  const getSelectedDate = () => modalMode === 'pickup' ? mainFilter.startDate : mainFilter.endDate;
  const getSelectedTime = () => modalMode === 'pickup' ? mainFilter.startTime : mainFilter.endTime;

  const calendarDays = getDaysInMonth(calendarMonth);
  const calMonthName = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    .toLocaleDateString(undefined, { month: 'short' });
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const minDate = modalMode === 'pickup' ? todayString : (mainFilter.startDate || todayString);
  const minPickupDateTime = new Date(Date.now() + 60 * 60 * 1000);

  const handleCheckboxChange = useCallback((key: string, value: string) => {
    onCheckboxChange(key, value);
  }, [onCheckboxChange]);

  const activeFilterCount = 
    secondaryFilter.brandIds.length + 
    secondaryFilter.transmissions.length + 
    secondaryFilter.fuelTypes.length + 
    secondaryFilter.critAirRatings.length;

  const clearAllFilters = useCallback(() => {
    secondaryFilter.brandIds.forEach((id: string) => handleCheckboxChange('brandIds', id));
    secondaryFilter.transmissions.forEach((t: string) => handleCheckboxChange('transmissions', t));
    secondaryFilter.fuelTypes.forEach((f: string) => handleCheckboxChange('fuelTypes', f));
    secondaryFilter.critAirRatings.forEach((c: string) => handleCheckboxChange('critAirRatings', c));
  }, [secondaryFilter, handleCheckboxChange]);

  // Helper for secondary filters in the top bar (Desktop only)
  const FilterDropdown = ({ label, items, activeItems, filterKey, icon }: any) => {
    const count = activeItems.length;
    return (
      <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
        <Select
          multiple
          displayEmpty
          value={activeItems}
          IconComponent={KeyboardArrowDownIcon}
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: count > 0 ? '#3B82F6' : 'rgba(255, 255, 255, 0.7)' }}>
                {label}
              </Typography>
              {count > 0 && (
                <Badge badgeContent={count} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }} />
              )}
            </Box>
          )}
          sx={{ 
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: count > 0 ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          }}
          MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', color: 'white', mt: 1 } } }}
        >
          {items?.map((item: any) => {
            const id = item.id || item.name;
            return (
              <MenuItem key={id} value={id} onClick={() => handleCheckboxChange(filterKey, id)} sx={{ fontSize: '0.8rem' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: '3px', border: '1px solid gray', bgcolor: activeItems.includes(id) ? '#3B82F6' : 'transparent' }} />
                  <Typography variant="body2">{item.name.replace('_', ' ')}</Typography>
                </Stack>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  return (
    <Box sx={{
      bgcolor: '#0F172A',
      minHeight: '100vh',
      ml: shouldOffsetForSidebar ? { md: '260px' } : 0,
      transition: 'all 0.3s',
    }}>
      
      {/* 1. STICKY TOP FILTER BAR */}
      <Paper
        ref={topBarRef}
        elevation={0}
        sx={{
          position: 'sticky',
          top: { xs: 0, md: 0 },
          zIndex: 110,
          pt: { xs: 1, md: 2 },
          pb: { xs: 1, md: 2 },
          px: { xs: 1, md: 0 },
          bgcolor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={1.5}>
            {/* Main Date Controls */}
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <Button
                fullWidth
                onClick={() => openDateTimeModal('pickup')}
                sx={{
                  flex: 1,
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  p: { xs: 1, md: 2 },
                  textTransform: 'none',
                  textAlign: 'left'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 800, fontSize: '0.6rem', display: 'block' }}>{t('cars.pickup')}</Typography>
                  <Typography sx={{ color: '#FFF', fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                    {mainFilter.startDate ? `${mainFilter.startDate} ${mainFilter.startTime}` : t('cars.selectDate')}
                  </Typography>
                </Box>
                <CalendarTodayIcon sx={{ color: '#3B82F6', fontSize: { xs: 16, md: 20 }, mt: { xs: 0.5, md: 0 } }} />
              </Button>

              <Button
                fullWidth
                disabled={!mainFilter.startDate}
                onClick={() => openDateTimeModal('return')}
                sx={{
                  flex: 1,
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  bgcolor: mainFilter.startDate ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  p: { xs: 1, md: 2 },
                  textTransform: 'none',
                  textAlign: 'left'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 800, fontSize: '0.6rem', display: 'block' }}>{t('cars.return')}</Typography>
                  <Typography sx={{ color: '#FFF', fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                    {mainFilter.endDate ? `${mainFilter.endDate} ${mainFilter.endTime}` : t('cars.selectDate')}
                  </Typography>
                </Box>
                <CalendarTodayIcon sx={{ color: '#3B82F6', fontSize: { xs: 16, md: 20 }, mt: { xs: 0.5, md: 0 } }} />
              </Button>
            </Stack>

            {/* Desktop Only Secondary Filters */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <FilterDropdown label={t('cars.brand')} items={brands} activeItems={secondaryFilter.brandIds} filterKey="brandIds" />
              <FilterDropdown label={t('cars.gearbox')} items={enums.transmissionEnum?.enumValues} activeItems={secondaryFilter.transmissions} filterKey="transmissions" />
              <FilterDropdown label={t('cars.fuel')} items={enums.fuelTypeEnum?.enumValues} activeItems={secondaryFilter.fuelTypes} filterKey="fuelTypes" />
              {activeFilterCount > 0 && (
                <IconButton onClick={clearAllFilters} sx={{ color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }}><ClearIcon fontSize="small" /></IconButton>
              )}
            </Stack>

            {/* Validation Alert Overlay */}
            {(!isValidSelection && (showValidation || hasDates)) && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#93C5FD', fontSize: '0.7rem', fontWeight: 700 }}>{validationError}</Typography>
              </Box>
            )}
          </Stack>
        </Container>
      </Paper>

      {/* 2. FLEET LISTING */}
      <Container maxWidth="xl" sx={{ pt: 4, pb: 10 }}>
        <Box sx={{ mb: 4, px: 1 }}>
          <Typography variant="h5" fontWeight={900} color="#FFFFFF">{t('cars.availableFleet')}</Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">{t('cars.foundCars', { count: String(cars.length) })}</Typography>
        </Box>

        <Grid container spacing={3}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.05)' }} />
              </Grid>
            ))
          ) : (
            cars.map((car: any) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card sx={{ 
                  borderRadius: '24px', bgcolor: '#FFF', overflow: 'hidden', height: '100%',
                  transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Box sx={{ position: 'relative', height: 180, bgcolor: '#F1F5F9', p: 2 }}>
                    <Image src={car.images?.[0]?.url || '/placeholder.jpg'} alt="car" fill style={{ objectFit: 'contain' }} />
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="caption" fontWeight={800} color="#3B82F6">{car.brand.name}</Typography>
                    <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>{car.model.name}</Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <GearIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Typography variant="caption" fontWeight={700} color="#64748B">{car.transmission.split('_')[0]}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FuelIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Typography variant="caption" fontWeight={700} color="#64748B">{car.fuelType}</Typography>
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight={900} color="#0F172A">€{car.pricePerDay}<Typography component="span" variant="caption">{t('cars.perDay')}</Typography></Typography>
                      <Button 
                        variant="contained" 
                        disabled={!isValidSelection}
                        onClick={() => onBookClick(car)}
                        sx={{ borderRadius: '10px', bgcolor: '#0F172A', textTransform: 'none', fontWeight: 700 }}
                      >
                        {t('cars.bookNow')}
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* 3. MOBILE FILTERS FLOATING BUTTON */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 20, right: 20, zIndex: 100 }}>
        <Button
          variant="contained"
          onClick={() => setIsFilterDrawerOpen(true)}
          startIcon={<TuneIcon />}
          sx={{ borderRadius: '20px', bgcolor: '#3B82F6', boxShadow: '0 8px 16px rgba(59,130,246,0.4)' }}
        >
          {t('cars.filters')}
        </Button>
      </Box>

      {/* MODALS (Date/Time & Drawer) */}
      <Dialog open={dateTimeModalOpen} onClose={() => setDateTimeModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#1E293B', color: 'white' } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{modalMode === 'pickup' ? t('carsView.pickupDetails') : t('carsView.returnDetails')}</Typography>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
               <Typography variant="subtitle2">{calMonthName} {calendarMonth.getFullYear()}</Typography>
               <Stack direction="row">
                  <IconButton size="small" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} sx={{ color: 'white' }}><ChevronLeftIcon /></IconButton>
                  <IconButton size="small" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} sx={{ color: 'white' }}><ChevronRightIcon /></IconButton>
               </Stack>
            </Stack>
            <Grid container spacing={1}>
              {calendarDays.map((day, i) => {
                const dateStr = day ? `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const isSelected = day && getSelectedDate() === dateStr;
                return (
                  <Grid item xs={12/7} key={i}>
                    {day && (
                      <Button 
                        onClick={() => handleDateSelect(day)}
                        fullWidth 
                        sx={{ minWidth: 0, p: 1, color: isSelected ? '#FFF' : '#AAA', bgcolor: isSelected ? '#3B82F6' : 'transparent', borderRadius: '8px' }}
                      >
                        {day}
                      </Button>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('booking.selectTime')}</Typography>
          <Grid container spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {TIME_SLOTS.map((t: string) => (
              <Grid item xs={4} key={t}>
                <Button 
                  fullWidth 
                  onClick={() => handleTimeSelect(t)}
                  sx={{ border: '1px solid rgba(255,255,255,0.1)', color: getSelectedTime() === t ? '#3B82F6' : 'white', fontSize: '0.75rem' }}
                >
                  {t}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Button fullWidth variant="contained" onClick={() => setDateTimeModalOpen(false)} sx={{ mt: 3, bgcolor: '#3B82F6' }}>{t('booking.confirm')}</Button>
        </Box>
      </Dialog>

      <Drawer anchor="bottom" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3, bgcolor: '#1E293B', color: 'white' } }}>
         <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>{t('cars.filterCars')}</Typography>
         <Stack spacing={3} sx={{ pb: 4 }}>
            {/* Filter sections here simplified for length */}
            <Typography variant="subtitle2">{t('cars.brand')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {brands.map((b: any) => (
                <Chip 
                  key={b.id} 
                  label={b.name} 
                  onClick={() => handleCheckboxChange('brandIds', b.id)} 
                  sx={{ bgcolor: secondaryFilter.brandIds.includes(b.id) ? '#3B82F6' : 'rgba(255,255,255,0.1)', color: 'white' }}
                />
              ))}
            </Box>
         </Stack>
         <Button fullWidth variant="contained" onClick={() => setIsFilterDrawerOpen(false)} sx={{ bgcolor: '#3B82F6', py: 2 }}>{t('cars.showResults')}</Button>
      </Drawer>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={onAlertClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={alert.severity} variant="filled">{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
};