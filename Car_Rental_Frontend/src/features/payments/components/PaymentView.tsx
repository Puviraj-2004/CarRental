'use client';

import React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { formatMoney } from '@/lib/moneyUtils';

interface PaymentViewProps {
  t: (path: string) => string;
  booking: any;
  bookingId: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxPercentage: number;
  onPay: () => void;
  error: string | null;
  loading: boolean;
}

const MoneyRow = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
    <Typography variant="body2" sx={{ color: strong ? 'text.primary' : 'text.secondary', fontWeight: strong ? 750 : 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: strong ? 800 : 650 }}>
      {value}
    </Typography>
  </Stack>
);

export const PaymentView: React.FC<PaymentViewProps> = ({
  t,
  booking,
  subtotal,
  taxAmount,
  totalAmount,
  taxPercentage,
  onPay,
  error,
  loading,
}) => {
  const carName = `${booking.car.model.brand.name} ${booking.car.model.name}`;
  const reference = String(booking.id).slice(0, 8).toUpperCase();
  const formattedTaxPercentage = Number.isInteger(taxPercentage) ? String(taxPercentage) : taxPercentage.toFixed(2);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%' }}>
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h2" component="h1">
            {t('payment.checkout.title')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', maxWidth: 620 }}>
            {t('payment.checkout.subtitle')}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} divider={<Divider flexItem orientation="vertical" />}>
            {[
              `${t('payment.checkout.steps.reserve')} (${t('payment.checkout.steps.done')})`,
              `${t('payment.checkout.steps.documents')} (${t('payment.checkout.steps.done')})`,
              `${t('payment.checkout.steps.payment')} (${t('payment.checkout.steps.active')})`,
            ].map((label, index) => (
              <Box key={label} sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 750 }}>
                  {index + 1}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: index === 2 ? 800 : 650, color: index === 2 ? 'primary.main' : 'text.primary' }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 380px' }, gap: 3 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t('payment.checkout.summary')}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 96,
                  height: 64,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.100',
                  flexShrink: 0,
                }}
              >
                {booking.car.primaryImageUrl && (
                  <img src={booking.car.primaryImageUrl} alt={carName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                  {carName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('payment.common.plate')}: {booking.car.plateNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('payment.common.bookingReference')}: {reference}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <MoneyRow label={t('payment.common.tripDuration')} value={`${booking.numberOfDays} ${t('payment.common.days')}`} />
              <MoneyRow label={t('payment.common.subtotal')} value={formatMoney(subtotal)} />
              <MoneyRow label={`${t('payment.common.tax')} (${formattedTaxPercentage}%)`} value={formatMoney(taxAmount)} />
              <Divider />
              <MoneyRow label={t('payment.common.total')} value={formatMoney(totalAmount)} strong />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2, height: 'fit-content' }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.dark' }}>
                  <LockOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('payment.checkout.secureNotice')}
                </Typography>
              </Stack>

              <Button
                variant="contained"
                size="large"
                onClick={onPay}
                disabled={loading}
                fullWidth
                startIcon={!loading && <CreditCardRoundedIcon />}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={18} color="inherit" />
                    <span>{t('payment.checkout.redirecting')}</span>
                  </Stack>
                ) : (
                  t('payment.checkout.payNow')
                )}
              </Button>

              <Button
                component={Link}
                href="/bookingRecords"
                variant="outlined"
                disabled={loading}
                fullWidth
                startIcon={<ArrowBackRoundedIcon />}
              >
                {t('payment.checkout.payLater')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
    </Box>
  );
};
