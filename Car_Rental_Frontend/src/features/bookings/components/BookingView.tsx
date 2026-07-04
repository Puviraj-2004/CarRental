'use client';

import React, { useRef, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { formatMoney } from '@/lib/moneyUtils';
import { RefundPolicyDialog } from './RefundPolicyDialog';

interface BookingViewProps {
  t: (path: string) => string;
  car: any;
  startDate: string;
  endDate: string;
  bookingDuration: number;
  subtotal: number;
  taxAmount: number;
  estimatedTotal: number;
  taxPercentage: number;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  loading: boolean;
}

const SummaryRow = ({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
    <Typography variant="body2" sx={{ color: strong ? 'text.primary' : 'text.secondary', fontWeight: strong ? 750 : 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: strong ? 850 : 700 }}>
      {value}
    </Typography>
  </Stack>
);

const formatTripDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const BookingView: React.FC<BookingViewProps> = ({
  t,
  car,
  startDate,
  endDate,
  bookingDuration,
  subtotal,
  taxAmount,
  estimatedTotal,
  taxPercentage,
  onSubmit,
  error,
  loading,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  const carName = `${car.model?.brand?.name ?? ''} ${car.model?.name ?? ''}`.trim();
  const formattedTaxPercentage = Number.isInteger(taxPercentage) ? String(taxPercentage) : taxPercentage.toFixed(2);

  const requestBrowserValidation = () => {
    const form = formRef.current;
    if (!form) return;

    if (typeof form.reportValidity === 'function') {
      form.reportValidity();
      return;
    }

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const handleReserveClick = () => {
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const nameInput = formData.get('guestName') as string;
    const phoneInput = formData.get('guestPhone') as string;

    if (!nameInput?.trim() || !phoneInput?.trim()) {
      requestBrowserValidation();
      return;
    }

    setPolicyDialogOpen(true);
  };

  const handlePolicyConfirm = () => {
    setPolicyDialogOpen(false);
    formRef.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={3.5}>
          <Box>
            <Typography variant="h2" component="h1">
              {t('booking.checkout.title')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 680 }}>
              {t('booking.checkout.subtitle')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" ref={formRef} onSubmit={onSubmit}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.dark' }}>
                        <PersonOutlineRoundedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="h5">{t('booking.checkout.driverDetails')}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('booking.checkout.driverSubtitle')}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestName"
                          label={t('booking.checkout.fullName')}
                          placeholder={t('booking.checkout.fullNamePlaceholder')}
                          disabled={loading}
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestPhone"
                          label={t('booking.checkout.phone')}
                          placeholder={t('booking.checkout.phonePlaceholder')}
                          disabled={loading}
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="notes"
                          label={t('booking.checkout.notes')}
                          placeholder={t('booking.checkout.notesPlaceholder')}
                          disabled={loading}
                          multiline
                          minRows={4}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 2,
                    position: { md: 'sticky' },
                    top: { md: 96 },
                  }}
                >
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 1, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                        <DirectionsCarRoundedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="h5">{t('booking.checkout.summary')}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('booking.checkout.summarySubtitle')}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 108, height: 76, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'grey.100', flexShrink: 0 }}>
                        {car.primaryImageUrl ? (
                          <img src={car.primaryImageUrl} alt={carName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <Box sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'text.secondary' }}>
                            <DirectionsCarRoundedIcon />
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 850 }}>
                          {carName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {car.fuelType?.name || t('booking.checkout.notSpecified')}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack spacing={1.5}>
                      <SummaryRow
                        label={t('booking.checkout.startDate')}
                        value={
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <span>{formatTripDate(startDate)}</span>
                          </Stack>
                        }
                      />
                      <SummaryRow label={t('booking.checkout.endDate')} value={formatTripDate(endDate)} />
                      <SummaryRow label={t('payment.common.tripDuration')} value={`${bookingDuration} ${t('payment.common.days')}`} />
                    </Stack>

                    <Divider />

                    <Stack spacing={1.5}>
                      <SummaryRow label={t('payment.common.subtotal')} value={formatMoney(subtotal)} />
                      <SummaryRow label={`${t('payment.common.tax')} (${formattedTaxPercentage}%)`} value={formatMoney(taxAmount)} />
                      <Divider />
                      <SummaryRow label={t('booking.checkout.estimatedTotal')} value={formatMoney(estimatedTotal)} strong />
                    </Stack>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <ShieldOutlinedIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {t('booking.checkout.policyNotice')}
                        </Typography>
                      </Stack>
                    </Paper>

                    <Stack spacing={1.25}>
                      <Button
                        type="button"
                        onClick={handleReserveClick}
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        startIcon={!loading && <DescriptionOutlinedIcon />}
                      >
                        {loading ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CircularProgress size={18} color="inherit" />
                            <span>{t('booking.checkout.initializing')}</span>
                          </Stack>
                        ) : (
                          t('booking.checkout.reserve')
                        )}
                      </Button>

                      <Button
                        component={Link}
                        href={`/viewDetails/${car.id}?startDate=${startDate}&endDate=${endDate}`}
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        startIcon={<ArrowBackRoundedIcon />}
                      >
                        {t('booking.checkout.backToDetails')}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Stack>

        <RefundPolicyDialog
          open={policyDialogOpen}
          onConfirm={handlePolicyConfirm}
          onCancel={() => setPolicyDialogOpen(false)}
          estimatedTotal={estimatedTotal}
          bookingDuration={bookingDuration}
        />
      </Container>
    </Box>
  );
};
