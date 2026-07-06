'use client';

import React, { useState } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { formatMoney } from '@/lib/moneyUtils';
import type { Booking } from '../hooks/useBooking';
import { PageInfo } from '../hooks/useBookingRecords';
import { calculateRefund, type RefundInfo } from '../utils/refundCalculator';

interface BookingRecordsViewProps {
  t: (path: string) => string;
  bookings: Booking[];
  pageInfo?: PageInfo;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onCancel?: (bookingId: string) => Promise<void>;
  onExtend?: (bookingId: string, newEndDate: string) => Promise<void>;
  loadingCancel?: boolean;
  loadingExtend?: boolean;
}

const formatTripDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString(
    undefined,
    options ?? {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

export const BookingRecordsView: React.FC<BookingRecordsViewProps> = ({
  t,
  bookings,
  pageInfo,
  loading,
  error,
  onPageChange,
  onCancel,
  onExtend,
  loadingCancel,
  loadingExtend,
}) => {
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [extendError, setExtendError] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);

  const selectedBooking = selectedBookingId ? bookings.find((booking) => booking.id === selectedBookingId) : null;

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const booking = bookings.find((item) => item.id === bookingId);

    if (booking && booking.payment?.status === 'PAID') {
      setRefundInfo(calculateRefund(Number(booking.totalPrice), new Date(booking.startDate)));
    } else {
      setRefundInfo(null);
    }

    setCancelConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBookingId || !onCancel) return;
    try {
      await onCancel(selectedBookingId);
      setCancelConfirmOpen(false);
      setSelectedBookingId(null);
      setRefundInfo(null);
    } catch (err) {
      console.error('Cancel booking failed:', err);
    }
  };

  const handleExtendClick = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setNewEndDate(new Date(booking.endDate).toISOString().split('T')[0]);
    setExtendError(null);
    setExtendDialogOpen(true);
  };

  const handleExtendConfirm = async () => {
    if (!selectedBookingId || !onExtend || !newEndDate || !selectedBooking) return;

    const newDate = new Date(newEndDate);
    const currentEndDate = new Date(selectedBooking.endDate);

    if (newDate <= currentEndDate) {
      setExtendError(t('booking.records.extendDialog.validation'));
      return;
    }

    try {
      await onExtend(selectedBookingId, new Date(newEndDate).toISOString());
      setExtendDialogOpen(false);
      setSelectedBookingId(null);
      setNewEndDate('');
      setExtendError(null);
    } catch (err) {
      setExtendError((err as Error).message || t('booking.records.extendDialog.failure'));
    }
  };

  const renderStatusBadge = (booking: Booking) => {
    let label = booking.status as string;
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

    switch (booking.status) {
      case 'RESERVED':
        color = 'warning';
        label = t('booking.records.status.pendingPayment');
        break;
      case 'CONFIRMED':
        color = 'primary';
        label = t('booking.records.status.confirmedPaid');
        break;
      case 'ONGOING':
        color = 'success';
        label = t('booking.records.status.tripInProgress');
        break;
      case 'COMPLETED':
        color = 'default';
        label = t('booking.records.status.tripCompleted');
        break;
      case 'EXPIRED':
        color = 'error';
        label = t('booking.records.status.expired');
        break;
      case 'CANCELLED':
      case 'REJECTED':
        color = 'error';
        label = t('booking.records.status.cancelled');
        break;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  const renderActionButtons = (booking: Booking) => {
    const isUnpaid = booking.status === 'RESERVED' && !booking.payment;
    const hasNoDocs = booking.status === 'RESERVED' && !booking.documents;
    const needsDocumentReupload = ['RESERVED', 'CONFIRMED'].includes(booking.status) && !booking.documents && Boolean(booking.documentReuploadDeadline);
    const isDocsPending = booking.status === 'RESERVED' && booking.payment?.status === 'PENDING' && booking.documents?.status !== 'APPROVED';
    const readyToPay = booking.status === 'RESERVED' && booking.payment?.status === 'PENDING' && booking.documents?.status === 'APPROVED';
    const canCancel = Boolean(onCancel) && ['RESERVED', 'CONFIRMED'].includes(booking.status);
    const canExtend = Boolean(onExtend) && (isUnpaid || hasNoDocs || isDocsPending || readyToPay);

    if ((booking.status === 'RESERVED' && (isUnpaid || hasNoDocs || readyToPay)) || needsDocumentReupload) {
      return (
        <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
          <Button
            component={Link}
            href={needsDocumentReupload || hasNoDocs ? `/booking/${booking.id}/documents` : `/booking/${booking.id}/payment`}
            variant="contained"
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            fullWidth
          >
            {needsDocumentReupload ? t('booking.records.actions.reuploadDocuments') : hasNoDocs ? t('booking.records.actions.verifyAndPay') : t('booking.records.actions.completePayment')}
          </Button>
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => handleCancelClick(booking.id)}
              disabled={loadingCancel}
              fullWidth
            >
              {t('booking.records.actions.cancel')}
            </Button>
          )}
          {canExtend && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EventRoundedIcon />}
              onClick={() => handleExtendClick(booking)}
              disabled={loadingExtend}
              fullWidth
            >
              {t('booking.records.actions.extendDates')}
            </Button>
          )}
        </Stack>
      );
    }

    if (isDocsPending) {
      return (
        <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => handleCancelClick(booking.id)}
              disabled={loadingCancel}
              fullWidth
            >
              {t('booking.records.actions.cancel')}
            </Button>
          )}
          {canExtend && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EventRoundedIcon />}
              onClick={() => handleExtendClick(booking)}
              disabled={loadingExtend}
              fullWidth
            >
              {t('booking.records.actions.extendDates')}
            </Button>
          )}
        </Stack>
      );
    }

    if (booking.status === 'CONFIRMED') {
      return (
        <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
          <Button component={Link} href={`/booking/${booking.id}/success`} variant="outlined" size="small" startIcon={<ReceiptLongRoundedIcon />} fullWidth>
            {t('booking.records.actions.viewReceipt')}
          </Button>
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => handleCancelClick(booking.id)}
              disabled={loadingCancel}
              fullWidth
            >
              {t('booking.records.actions.cancel')}
            </Button>
          )}
        </Stack>
      );
    }

    if (booking.status === 'COMPLETED') {
      return (
        <Button component={Link} href={`/booking/${booking.id}/success`} variant="outlined" size="small" startIcon={<ReceiptLongRoundedIcon />} fullWidth>
          {t('booking.records.actions.viewReceipt')}
        </Button>
      );
    }

    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {t('booking.records.closed')}
      </Typography>
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h2" component="h1">
              {t('booking.records.title')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 680 }}>
              {t('booking.records.subtitle')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {bookings.length === 0 ? (
            <EmptyState
              icon={<DirectionsCarRoundedIcon />}
              title={t('booking.records.emptyTitle')}
              description={t('booking.records.emptySubtitle')}
              action={
                <Button variant="contained" component={Link} href="/cars">
                  {t('booking.records.browseCars')}
                </Button>
              }
            />
          ) : (
            <Stack spacing={2}>
              {bookings.map((booking) => {
                const carName = `${booking.car.model.brand.name} ${booking.car.model.name}`;

                return (
                  <Card key={booking.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
                      <Grid container spacing={2.5} alignItems="center">
                        <Grid item xs={12} sm={4} md={2.4}>
                          <Box sx={{ width: '100%', aspectRatio: '16 / 10', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}>
                            {booking.car.primaryImageUrl ? (
                              <img src={booking.car.primaryImageUrl} alt={carName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <Box sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'text.secondary' }}>
                                <DirectionsCarRoundedIcon />
                              </Box>
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={8} md={5}>
                          <Stack spacing={1.25}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {renderStatusBadge(booking)}
                            </Stack>
                            {['RESERVED', 'CONFIRMED'].includes(booking.status) && booking.documentReuploadDeadline && !booking.documents && (
                              <Alert severity="warning" sx={{ py: 0.75 }}>
                                {t('booking.records.documents.reuploadRequired')} {formatTripDate(booking.documentReuploadDeadline, { day: '2-digit', month: 'short', year: 'numeric' })}.
                              </Alert>
                            )}
                            <Typography variant="h5" noWrap>
                              {carName}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                              <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
                              <Typography variant="body2">
                                {formatTripDate(booking.startDate, { day: '2-digit', month: 'short' })} - {formatTripDate(booking.endDate)}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 750 }}>
                                {booking.numberOfDays} {t('payment.common.days')}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                              {t('booking.records.totalAmount')}
                            </Typography>
                            <Typography variant="h5" color="primary.main">
                              {formatMoney(Number(booking.totalPrice))}
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.6}>
                          {renderActionButtons(booking)}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}

              {pageInfo && pageInfo.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Pagination
                    count={pageInfo.totalPages}
                    page={pageInfo.currentPage}
                    onChange={(_, page) => onPageChange(page)}
                    color="primary"
                    disabled={loading}
                  />
                </Box>
              )}
            </Stack>
          )}
        </Stack>

        <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('booking.records.cancelDialog.title')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Typography color="text.secondary">{t('booking.records.cancelDialog.message')}</Typography>

              {refundInfo && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Stack spacing={1.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {t('booking.records.cancelDialog.refundPolicy')}
                      </Typography>
                      <Chip
                        label={refundInfo.policyDescription}
                        size="small"
                        color={refundInfo.policy === 'FULL' ? 'success' : refundInfo.policy === 'PARTIAL' ? 'warning' : 'default'}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {refundInfo.reason}
                    </Typography>

                    <Divider />

                    <Grid container spacing={1.5}>
                      {[
                        [t('booking.records.cancelDialog.totalPaid'), formatMoney(refundInfo.refundAmount + refundInfo.keepAmount)],
                        [t('booking.records.cancelDialog.refundAmount'), formatMoney(refundInfo.refundAmount)],
                        [t('booking.records.cancelDialog.platformFee'), formatMoney(refundInfo.keepAmount)],
                        [t('booking.records.cancelDialog.daysUntilStart'), String(Math.round(refundInfo.hoursUntilPickup / 24))],
                      ].map(([label, value]) => (
                        <Grid item xs={6} key={label}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                            {label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setCancelConfirmOpen(false);
                setRefundInfo(null);
              }}
              variant="outlined"
            >
              {t('booking.records.cancelDialog.keep')}
            </Button>
            <Button onClick={handleCancelConfirm} variant="contained" color="error" disabled={loadingCancel}>
              {loadingCancel ? t('booking.records.cancelDialog.cancelling') : t('booking.records.cancelDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('booking.records.extendDialog.title')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              {extendError && <Alert severity="error">{extendError}</Alert>}

              {selectedBooking && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700 }}>
                      {t('booking.records.extendDialog.currentEndDate')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 750 }}>
                      {formatTripDate(selectedBooking.endDate, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>

                  <TextField
                    label={t('booking.records.extendDialog.newEndDate')}
                    type="date"
                    value={newEndDate}
                    onChange={(event) => setNewEndDate(event.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date(selectedBooking.endDate).toISOString().split('T')[0],
                    }}
                  />

                  <Alert severity="info">{t('booking.records.extendDialog.helper')}</Alert>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExtendDialogOpen(false)} variant="outlined">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleExtendConfirm} variant="contained" disabled={loadingExtend || !newEndDate}>
              {loadingExtend ? t('booking.records.extendDialog.extending') : t('booking.records.extendDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
