'use client';

import React, { useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';
import { formatDateInputForDisplay, getLocalDateInputValue, getNextDateInputValue } from '@/lib/dateUtils';
import { formatMoney } from '@/lib/moneyUtils';
import { replaceToken } from '@/lib/textUtils';
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
  onApplyDates: (start: string, end: string) => void;
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
  const { showToast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalStart, setModalStart] = useState('');
  const [modalEnd, setModalEnd] = useState('');

  const todayStr = getLocalDateInputValue();

  const hasDates = Boolean(startDate && endDate && bookingDuration > 0);

  const imageList = useMemo(() => {
    if (!car) return [];

    const images = [
      car.primaryImageUrl
        ? {
            id: 'primary',
            url: car.primaryImageUrl,
            alt: t('cars.details.primaryImage'),
          }
        : null,
      ...(car.images || []).map((image) => ({
        id: image.id,
        url: image.url,
        alt: t('cars.details.galleryImage'),
      })),
    ].filter(Boolean) as { id: string; url: string; alt: string }[];

    const uniqueImages = new Map<string, { id: string; url: string; alt: string }>();

    images.forEach((image) => {
      if (image.url) uniqueImages.set(image.url, image);
    });

    return Array.from(uniqueImages.values());
  }, [car, t]);

  const calendarCells = useMemo(() => {
    if (!calendar.length) return [];

    const firstDate = new Date(`${calendar[0].date}T00:00:00`);
    const mondayFirstOffset = (firstDate.getDay() + 6) % 7;
    const blanks = Array.from({ length: mondayFirstOffset }, () => null);

    return [...blanks, ...calendar];
  }, [calendar]);

  if (loadingCar || !car) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  const primaryImage = activeImage || car.primaryImageUrl || null;

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

  const openDateDialog = () => {
    setModalStart(startDate || todayStr);
    setModalEnd(endDate || '');
    setOpenModal(true);
  };

  const handleBookingClick = (event: React.MouseEvent) => {
    if (!hasDates) {
      event.preventDefault();
      openDateDialog();
    }
  };

  const handleApplyDatesFromModal = () => {
    if (!modalStart || !modalEnd) return;

    if (new Date(`${modalStart}T00:00:00`) >= new Date(`${modalEnd}T00:00:00`)) {
      showToast(t('cars.details.messages.pickupBeforeReturn'), 'error');
      return;
    }

    const hasConflict = calendar.some((day) => {
      const date = day.date;
      return date >= modalStart && date <= modalEnd && !day.available;
    });

    if (hasConflict) {
      showToast(t('cars.details.messages.periodUnavailable'), 'error');
      return;
    }

    onApplyDates(modalStart, modalEnd);
    setOpenModal(false);
    showToast(t('cars.details.messages.datesUpdated'), 'success');
  };

  const handleCalendarDayClick = (dayDate: string, isAvailable: boolean) => {
    if (dayDate < todayStr) return;

    if (!isAvailable) {
      showToast(t('cars.details.messages.dateBooked'), 'error');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      onApplyDates(dayDate, '');
      showToast(t('cars.details.messages.pickupSet'), 'info');
      return;
    }

    if (dayDate <= startDate) {
      onApplyDates(dayDate, '');
      showToast(t('cars.details.messages.pickupUpdated'), 'info');
      return;
    }

    const hasConflict = calendar.some((day) => {
      const date = day.date;
      return date >= startDate && date <= dayDate && !day.available;
    });

    if (hasConflict) {
      showToast(t('cars.details.messages.selectionUnavailable'), 'error');
      return;
    }

    onApplyDates(startDate, dayDate);
    showToast(t('cars.details.messages.datesUpdated'), 'success');
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100%',
        pb: { xs: 7, md: 9 },
        overflow: 'hidden',
      }}
    >


      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Grid container spacing={{ xs: 3, md: 4.5 }} alignItems="flex-start">
          {/* LEFT: GALLERY + SPECS */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 5,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `0 24px 70px ${alpha(theme.palette.common.black, 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, sm: 420, md: 500 },
                    bgcolor: 'grey.100',
                    overflow: 'hidden',
                  }}
                >
                  {primaryImage ? (
                    <Box
                      component="img"
                      src={primaryImage}
                      alt={`${car.model.brand.name} ${car.model.name}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Stack
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="center"
                      sx={{ height: '100%', color: 'text.secondary' }}
                    >
                      <DirectionsCarRoundedIcon sx={{ fontSize: 58 }} />
                      <Typography sx={{ fontWeight: 800 }}>{t('cars.details.noImage')}</Typography>
                    </Stack>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 58%, rgba(2,6,23,0.42) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  <Chip
                    icon={<VerifiedRoundedIcon />}
                    label={t('cars.details.primaryImage')}
                    sx={{
                      position: 'absolute',
                      left: 18,
                      top: 18,
                      fontWeight: 900,
                      bgcolor: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(12px)',
                      '& .MuiChip-icon': { color: 'primary.main' },
                    }}
                  />
                </Box>

                {imageList.length > 0 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 950, mb: 1.5 }}>
                      {t('cars.details.galleryTitle')}
                    </Typography>

                    <Grid container spacing={1.2}>
                      {imageList.map((image) => {
                        const selected = primaryImage === image.url;

                        return (
                          <Grid item xs={3} sm={2} key={image.id}>
                            <Box
                              component="button"
                              type="button"
                              onClick={() => setActiveImage(image.url)}
                              aria-label={image.alt}
                              sx={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                p: 0,
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '2px solid',
                                borderColor: selected ? 'primary.main' : 'transparent',
                                cursor: 'pointer',
                                bgcolor: 'grey.100',
                                transition: 'transform 180ms ease, border-color 180ms ease, opacity 180ms ease',
                                '&:hover': {
                                  transform: 'translateY(-3px) scale(1.03)',
                                  opacity: 0.9,
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src={image.url}
                                alt={image.alt}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Paper>

            </Stack>
          </Grid>

          {/* RIGHT: PRICE + CALENDAR + CTA */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 5,
                  p: { xs: 2.5, md: 3 },
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `0 22px 70px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
              >
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: '-0.035em' }}>
                      {t('cars.details.bookingCardTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.65 }}>
                      {t('cars.details.bookingCardSubtitle')}
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 850 }}>
                        {t('cars.details.dailyRentalRate')}
                      </Typography>
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                        {formatMoney(Number(car.basePrice))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('cars.details.pricePerDay')}
                      </Typography>
                    </Box>

                    {totalPrice != null && hasDates && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 850 }}>
                          {replaceToken(t('cars.details.totalEstimatedCost'), '{days}', String(bookingDuration))}
                        </Typography>
                        <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                          {formatMoney(totalPrice)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {hasDates ? (
                    <Alert severity="success" sx={{ borderRadius: 3 }}>
                      {t('cars.details.messages.datesReady')}
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                      {t('cars.details.messages.selectDatesFirst')}
                    </Alert>
                  )}

                  {hasDates && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Grid container spacing={1.2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                            {t('cars.details.rentalDuration')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 950 }}>
                            {replaceToken(t('cars.details.durationDays'), '{days}', String(bookingDuration))}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                            {t('cars.details.estimatedReturnDate')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 950 }}>
                            {formatDateInputForDisplay(endDate)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    component={Link}
                    href={checkoutUrl}
                    onClick={handleBookingClick}
                    startIcon={<PaymentsRoundedIcon />}
                    sx={{
                      py: 1.45,
                      fontWeight: 950,
                      textTransform: 'none',
                      borderRadius: 999,
                      fontSize: '0.98rem',
                      transition: 'transform 200ms ease, box-shadow 200ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.01)',
                        boxShadow: (theme) => `0 20px 48px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    {hasDates ? t('cars.details.bookNow') : t('cars.details.selectDatesToBook')}
                  </Button>
                </Stack>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 5,
                  p: { xs: 2.5, md: 3 },
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 950,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <EventAvailableRoundedIcon color="primary" />
                        {t('cars.details.availabilitySchedule')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('cars.details.calendarSubtitle')}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton size="small" onClick={handlePrevMonth} aria-label={t('cars.details.previousMonth')}>
                        <ChevronLeftRoundedIcon />
                      </IconButton>

                      <Typography sx={{ fontWeight: 950, minWidth: 92, textAlign: 'center', fontSize: 14 }}>
                        {new Date(currentYear, currentMonth - 1).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>

                      <IconButton size="small" onClick={handleNextMonth} aria-label={t('cars.details.nextMonth')}>
                        <ChevronRightRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {loadingCalendar ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                      <CircularProgress size={26} />
                    </Box>
                  ) : (
                    <>
                      <Grid container spacing={0.8} columns={7}>
                        {[
                          t('cars.details.weekdays.mon'),
                          t('cars.details.weekdays.tue'),
                          t('cars.details.weekdays.wed'),
                          t('cars.details.weekdays.thu'),
                          t('cars.details.weekdays.fri'),
                          t('cars.details.weekdays.sat'),
                          t('cars.details.weekdays.sun'),
                        ].map((day) => (
                          <Grid item xs={1} key={day}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', textAlign: 'center', fontWeight: 950 }}
                            >
                              {day}
                            </Typography>
                          </Grid>
                        ))}

                        {calendarCells.map((day, index) => {
                          if (!day) {
                            return <Grid item xs={1} key={`blank-${index}`} />;
                          }

                          const isPast = day.date < todayStr;
                          const isStart = Boolean(startDate && day.date === startDate);
                          const isEnd = Boolean(endDate && day.date === endDate);
                          const isSelectedRange = Boolean(hasDates && day.date >= startDate && day.date <= endDate);
                          const isSelected = isStart || isEnd || isSelectedRange;

                          return (
                            <Grid item xs={1} key={day.date}>
                              <Box
                                component="button"
                                type="button"
                                onClick={() => handleCalendarDayClick(day.date, day.available)}
                                disabled={isPast}
                                sx={[
                                  {
                                    width: '100%',
                                    minHeight: 42,
                                    borderRadius: 2.2,
                                    border: '1px solid',
                                    fontSize: 13,
                                    fontWeight: 950,
                                    fontFamily: 'inherit',
                                    cursor: isPast ? 'not-allowed' : 'pointer',
                                    userSelect: 'none',
                                    transition: 'transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
                                    '&:hover': !isPast
                                      ? {
                                          transform: 'translateY(-2px) scale(1.04)',
                                          boxShadow: 2,
                                        }
                                      : {},
                                  },
                                  isPast && {
                                    bgcolor: 'grey.100',
                                    color: 'text.disabled',
                                    borderColor: 'divider',
                                    opacity: 0.6,
                                  },
                                  !isPast &&
                                    day.available &&
                                    !isSelected && {
                                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                      color: 'success.dark',
                                      borderColor: (theme) => alpha(theme.palette.success.main, 0.28),
                                    },
                                  !isPast &&
                                    !day.available &&
                                    !isSelected && {
                                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                      color: 'error.main',
                                      borderColor: (theme) => alpha(theme.palette.error.main, 0.28),
                                    },
                                  isSelected && {
                                    bgcolor: isStart || isEnd ? 'secondary.main' : 'primary.main',
                                    color: isStart || isEnd ? 'secondary.contrastText' : 'primary.contrastText',
                                    borderColor: isStart || isEnd ? 'secondary.main' : 'primary.main',
                                  },
                                ]}
                              >
                                {Number(day.date.split('-')[2])}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={t('cars.details.available')}
                          sx={{
                            fontWeight: 850,
                            color: 'success.dark',
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                          }}
                        />
                        <Chip
                          size="small"
                          label={t('cars.details.reserved')}
                          sx={{
                            fontWeight: 850,
                            color: 'error.main',
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                          }}
                        />
                        <Chip
                          size="small"
                          label={t('cars.details.selected')}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 850 }}
                        />
                      </Stack>

                      <Button
                        variant="outlined"
                        onClick={openDateDialog}
                        fullWidth
                        startIcon={<CalendarMonthRoundedIcon />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 950,
                          borderRadius: 999,
                          py: 1.15,
                        }}
                      >
                        {hasDates ? t('cars.details.modifyTripDates') : t('cars.details.selectTripDates')}
                      </Button>
                    </>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xs"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 5,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950, pb: 0.5 }}>
          {t('cars.details.selectTripDates')}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
            {t('cars.details.dateDialogSubtitle')}
          </Typography>

          <Stack spacing={2.25}>
            <TextField
              fullWidth
              type="date"
              label={t('cars.details.pickupDate')}
              value={modalStart}
              inputProps={{ min: todayStr }}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => {
                setModalStart(event.target.value);

                if (modalEnd && event.target.value && modalEnd <= event.target.value) {
                  setModalEnd('');
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />

            <TextField
              fullWidth
              type="date"
              label={t('cars.details.returnDate')}
              value={modalEnd}
              inputProps={{ min: getNextDateInputValue(modalStart) }}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => setModalEnd(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpenModal(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 900,
              borderRadius: 999,
              px: 2.5,
            }}
          >
            {t('common.cancel')}
          </Button>

          <Button
            onClick={handleApplyDatesFromModal}
            variant="contained"
            disabled={!modalStart || !modalEnd}
            sx={{
              textTransform: 'none',
              fontWeight: 900,
              borderRadius: 999,
              px: 3,
            }}
          >
            {t('cars.details.confirmDates')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
