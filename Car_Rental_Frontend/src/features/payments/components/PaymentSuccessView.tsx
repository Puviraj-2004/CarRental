'use client';

import React from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface PaymentSuccessViewProps {
  t: (path: string) => string;
  booking: any;
  bookingId: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxPercentage: number;
}

const ReceiptRow = ({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
    <Typography variant="body2" sx={{ color: strong ? 'text.primary' : 'text.secondary', fontWeight: strong ? 750 : 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: strong ? 800 : 650 }}>
      {value}
    </Typography>
  </Stack>
);

export const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({
  t,
  booking,
  subtotal,
  taxAmount,
  totalAmount,
  taxPercentage,
}) => {
  const docStatus = booking.documents?.status || 'PENDING';
  const carName = `${booking.car.model.brand.name} ${booking.car.model.name}`;
  const reference = String(booking.id).slice(0, 8).toUpperCase();
  const formattedTaxPercentage = Number.isInteger(taxPercentage) ? String(taxPercentage) : taxPercentage.toFixed(2);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 1, bgcolor: 'success.light', color: 'success.dark' }}>
              <CheckRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h3" component="h1">
                {t('payment.success.title')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                {t('payment.success.subtitle')}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <ArticleOutlinedIcon color="primary" />
              <Typography variant="h5">{t('payment.success.receipt')}</Typography>
            </Stack>
            <Chip label={reference} size="small" variant="outlined" />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ width: 96, height: 64, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
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
                {booking.numberOfDays} {t('payment.common.days')}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <ReceiptRow label={t('payment.success.pickupDate')} value={new Date(booking.startDate).toLocaleDateString()} />
            <ReceiptRow label={t('payment.success.returnDate')} value={new Date(booking.endDate).toLocaleDateString()} />
            <ReceiptRow label={t('payment.common.subtotal')} value={`${subtotal.toFixed(2)} EUR`} />
            <ReceiptRow label={`${t('payment.common.tax')} (${formattedTaxPercentage}%)`} value={`${taxAmount.toFixed(2)} EUR`} />
            <Divider />
            <ReceiptRow label={t('payment.success.totalCharged')} value={`${totalAmount.toFixed(2)} EUR`} strong />
            <Divider />
            <ReceiptRow
              label={t('payment.success.verification')}
              value={
                <Chip
                  size="small"
                  color={docStatus === 'APPROVED' ? 'success' : 'warning'}
                  label={docStatus === 'APPROVED' ? t('payment.success.approved') : t('payment.success.pendingApproval')}
                />
              }
            />
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button component={Link} href="/bookingRecords" variant="contained" fullWidth>
            {t('payment.success.goBookings')}
          </Button>
          <Button component={Link} href="/cars" variant="outlined" fullWidth>
            {t('payment.success.bookAnother')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
