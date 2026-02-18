'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Cancel,
  VerifiedUser,
  Schedule,
  DirectionsCar,
  Person,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { PreTripModal } from './PreTripModal';

// ============================================================================
// TYPES
// ============================================================================
interface AdminBookingDetailsViewProps {
  booking: any;
  actions: any;
  onBack: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================
const STATUS_CONFIG: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; labelKey: string }> = {
  DRAFT: { color: 'default', labelKey: 'admin.draft' },
  PENDING: { color: 'warning', labelKey: 'admin.pending' },
  VERIFIED: { color: 'info', labelKey: 'admin.verified' },
  CONFIRMED: { color: 'primary', labelKey: 'admin.confirmed' },
  ONGOING: { color: 'secondary', labelKey: 'admin.ongoing' },
  COMPLETED: { color: 'success', labelKey: 'admin.completed' },
  CANCELLED: { color: 'error', labelKey: 'admin.cancelled' },
  REJECTED: { color: 'error', labelKey: 'admin.rejected' },
  EXPIRED: { color: 'default', labelKey: 'admin.expired' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { color: 'default' | 'success' | 'error' | 'warning'; icon: React.ReactElement }> = {
  PENDING: { color: 'warning', icon: <Schedule fontSize="small" /> },
  SUCCEEDED: { color: 'success', icon: <CheckCircle fontSize="small" /> },
  FAILED: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
  REFUNDED: { color: 'default', icon: <Info fontSize="small" /> },
};

const DOC_STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; icon: React.ReactElement; labelKey: string }> = {
  APPROVED: { color: 'success', icon: <CheckCircle fontSize="small" />, labelKey: 'admin.verified' },
  PENDING: { color: 'warning', icon: <Warning fontSize="small" />, labelKey: 'admin.pendingReview' },
  REJECTED: { color: 'error', icon: <ErrorIcon fontSize="small" />, labelKey: 'admin.rejected' },
  NOT_UPLOADED: { color: 'warning', icon: <Warning fontSize="small" />, labelKey: 'admin.notUploaded' },
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const InfoCard = ({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {action}
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography component="div" variant="body2" fontWeight={600} color={valueColor || 'text.primary'} sx={{ textAlign: 'right' }}>
      {value || '—'}
    </Typography>
  </Box>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AdminBookingDetailsView = ({ booking, actions, onBack, t }: AdminBookingDetailsViewProps) => {
  const router = useRouter();

  // State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [preTripModalOpen, setPreTripModalOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Derived data
  const bookingRef = booking.id?.slice(-6).toUpperCase() || 'N/A';
  const isCourtesy = booking.bookingType === 'REPLACEMENT';
  const isWalkIn = booking.isWalkIn;
  const customerName = booking.guestName || booking.user?.fullName || t('adminBookingDetails.guestCustomer');
  const customerPhone = booking.guestPhone || booking.user?.phoneNumber || '—';
  const customerEmail = booking.guestEmail || booking.user?.email || '—';
  const customerId = booking.user?.id?.slice(-8).toUpperCase() || (isWalkIn ? t('adminBookingDetails.walkInLabel') : '—');

  const docStatus = booking.documentVerification?.status || 'NOT_UPLOADED';
  const isDocVerified = docStatus === 'APPROVED';
  const canStartTrip = booking.status === 'CONFIRMED' && (isDocVerified || isCourtesy);
  const canCancel = !['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED', 'ONGOING'].includes(booking.status);

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.DRAFT;
  const paymentConfig = PAYMENT_STATUS_CONFIG[booking.payment?.status] || PAYMENT_STATUS_CONFIG.PENDING;
  const docConfig = DOC_STATUS_CONFIG[docStatus] || DOC_STATUS_CONFIG.NOT_UPLOADED;

  // Format created date with time
  const formatCreatedDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      const day = date.getUTCDate();
      const month = new Date(date.getUTCFullYear(), date.getUTCMonth(), 1)
        .toLocaleDateString(undefined, { month: 'short' });
      const year = date.getUTCFullYear();
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const mins = date.getUTCMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}`;
    } catch {
      return 'N/A';
    }
  };

  // Handlers
  const handleStartTrip = async (data?: { startOdometer: number; pickupNotes?: string }) => {
    if (!data) {
      setPreTripModalOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await actions.startTrip(booking.id, data.startOdometer, data.pickupNotes);
      setSnackbar({ open: true, message: t('adminBookingDetails.tripStartedSuccess'), severity: 'success' });
      setPreTripModalOpen(false);
      actions.refreshBooking?.();
    } catch (error: any) {
      setSnackbar({ open: true, message: t('adminBookingDetails.failedToStartTrip'), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocuments = () => {
    router.push(`/admin/bookings/${booking.id}/documents`);
  };

  const handleGenerateVerification = async () => {
    if (!actions.confirmReservation) return;
    setVerifyLoading(true);
    try {
      await actions.confirmReservation(booking.id);
      setSnackbar({ open: true, message: t('adminBookingDetails.verificationLinkGenerated'), severity: 'success' });
      actions.refreshBooking?.();
    } catch (e: any) {
      setSnackbar({ open: true, message: t('adminBookingDetails.failedToGenerateVerification'), severity: 'error' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCopyVerificationLink = async (token?: string) => {
    if (!token) return;
    try {
      const link = `${window.location.origin}/verification/${token}`;
      await navigator.clipboard.writeText(link);
      setSnackbar({ open: true, message: t('adminBookingDetails.verificationLinkCopied'), severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: t('adminBookingDetails.failedToCopyLink'), severity: 'error' });
    }
  };

  const handleOpenVerificationPage = (token?: string) => {
    if (!token) return;
    window.open(`${window.location.origin}/verification/${token}`, '_blank');
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      const success = await actions.cancelBooking(booking.id, cancelReason);
      if (success) {
        setSnackbar({ open: true, message: t('adminBookingDetails.bookingCancelledSuccess'), severity: 'success' });
        setCancelDialogOpen(false);
        setTimeout(() => {
          actions.refreshBooking?.();
        }, 1000);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: t('adminBookingDetails.failedToCancelBooking'), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={3}>
        {/* Page Header (match other admin pages) */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button variant="text" startIcon={<ArrowBack />} onClick={onBack} sx={{ fontWeight: 700 }}>
              {t('admin.back')}
            </Button>
            <Typography variant="h4" fontWeight={900} color="#0F172A">
              {t('admin.booking')} #{bookingRef}
            </Typography>
            <Chip label={t(statusConfig.labelKey)} color={statusConfig.color} size="small" sx={{ fontWeight: 700 }} />
            {isCourtesy && <Chip label={t('admin.courtesy')} size="small" color="secondary" sx={{ fontWeight: 700 }} />}
            {isWalkIn && <Chip label={t('admin.walkIn')} size="small" color="primary" sx={{ fontWeight: 700 }} />}
          </Stack>
        </Stack>

          {/* Action Bar - Desktop */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
              <Button variant="outlined" startIcon={<VerifiedUser />} onClick={handleViewDocuments}>
                {t('admin.viewVerifyDocuments')}
              </Button>
              {canCancel && (
                <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialogOpen(true)}>
                  {t('admin.cancelBooking')}
                </Button>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={() => handleStartTrip()}
                  disabled={!canStartTrip || isSubmitting}
                  sx={{ minWidth: 140 }}
                >
                  {isSubmitting ? t('admin.starting') : t('admin.startTrip')}
                </Button>
              )}
            </Stack>
            {booking.status === 'CONFIRMED' && !canStartTrip && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                {t('admin.documentsVerifyFirst')}
              </Typography>
            )}
          </Paper>

          {/* Main Content Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Booking Details */}
            <InfoCard title={t('admin.bookingDetails')} icon={<Schedule />}>
              <Stack spacing={0} divider={<Divider />}>
                <DataRow label={t('admin.bookingReference')} value={bookingRef} />
                <DataRow label={t('admin.bookingType')} value={isCourtesy ? t('admin.courtesyReplacement') : t('admin.standardRental')} />
                <DataRow label={t('admin.created')} value={formatCreatedDate(booking.createdAt)} />
                <Box sx={{ py: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1, p: 2, bgcolor: 'success.50', borderRadius: 1.5, border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="caption" color="success.dark" fontWeight={700}>{t('admin.pickUp')}</Typography>
                      <Typography variant="body1" fontWeight={700}>{formatDateForDisplay(booking.startDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.pickupTime || '—'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 2, bgcolor: 'error.50', borderRadius: 1.5, border: '1px solid', borderColor: 'error.200' }}>
                      <Typography variant="caption" color="error.dark" fontWeight={700}>{t('admin.dropOff')}</Typography>
                      <Typography variant="body1" fontWeight={700}>{formatDateForDisplay(booking.endDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.returnTime || '—'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                <DataRow
                  label={t('admin.paymentStatus')}
                  value={
                    <Chip icon={paymentConfig.icon} label={booking.payment?.status || 'PENDING'} color={paymentConfig.color} size="small" sx={{ fontWeight: 600 }} />
                  }
                />
                <DataRow
                  label={t('admin.totalAmount')}
                  value={isCourtesy ? `€0.00 (${t('admin.courtesy')})` : `€${booking.totalPrice?.toFixed(2) || '0.00'}`}
                  valueColor={isCourtesy ? 'success.main' : 'primary.main'}
                />
              </Stack>
            </InfoCard>

            {/* Customer Information */}
            <InfoCard title={t('admin.customerInfo')} icon={<Person />}>
              <Stack spacing={0} divider={<Divider />}>
                <DataRow label={t('admin.name')} value={customerName} />
                <DataRow label={t('admin.phone')} value={customerPhone} />
                <DataRow label={t('admin.email')} value={customerEmail} />
                <DataRow label={t('admin.customerId')} value={customerId} />
                <DataRow
                  label={t('admin.documents')}
                  value={
                    <Chip icon={docConfig.icon} label={t(docConfig.labelKey)} color={docConfig.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  }
                />
              </Stack>
            </InfoCard>

            {/* Pending: Verification QR/Link */}
            {booking.status === 'PENDING' && (
              <InfoCard
                title={t('admin.walkinVerification')}
                icon={<VerifiedUser />}
                action={
                  <Stack direction="row" spacing={1}>
                    {!booking.verification?.token && (
                      <Button size="small" variant="outlined" onClick={handleGenerateVerification} disabled={verifyLoading}>
                        {verifyLoading ? t('admin.generating') : t('admin.generateLink')}
                      </Button>
                    )}
                  </Stack>
                }
              >
                <Stack spacing={2} alignItems="center" justifyContent="center">
                  {!booking.verification?.token && (
                    <Typography variant="body2" color="text.secondary">{t('admin.noVerificationLink')}</Typography>
                  )}
                  {booking.verification?.token && (
                    <Stack spacing={1} alignItems="center">
                      <Box sx={{ p: 2, border: '2px solid #F1F5F9', borderRadius: 2 }}>
                        <QRCode value={`${window.location.origin}/verification/${booking.verification.token}`} size={160} />
                      </Box>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button size="small" variant="contained" onClick={() => handleOpenVerificationPage(booking.verification.token)}>{t('admin.openVerificationPage')}</Button>
                            <Button size="small" variant="outlined" onClick={() => handleCopyVerificationLink(booking.verification.token)}>{t('admin.copyVerificationLink')}</Button>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{t('admin.expires')}: {booking.verification?.expiresAt ? formatCreatedDate(booking.verification.expiresAt) : '—'}</Typography>
                    </Stack>
                  )}
                </Stack>
              </InfoCard>
            )}

            {/* Verified: Payments info */}
            {booking.status === 'VERIFIED' && (
              <InfoCard title={t('admin.payments')} icon={<Schedule />}>
                <Stack spacing={1}>
                  <DataRow
                    label={t('admin.paymentStatus')}
                    value={
                      <Chip icon={paymentConfig.icon} label={booking.payment?.status || 'PENDING'} color={paymentConfig.color} size="small" sx={{ fontWeight: 600 }} />
                    }
                  />
                  <DataRow label={t('admin.amount')} value={`€${booking.payment?.amount?.toFixed?.(2) || booking.totalPrice?.toFixed?.(2) || '0.00'}`} />
                  <DataRow label={t('admin.paymentId')} value={booking.payment?.stripeId || '—'} />
                  {booking.payment?.createdAt && <DataRow label={t('admin.created')} value={formatCreatedDate(booking.payment.createdAt)} />}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        if (!actions.createCheckoutSession) return;
                        try {
                          const res = await actions.createCheckoutSession(booking.id);
                          const url = res?.url;
                          if (url) window.open(url, '_blank');
                          else setSnackbar({ open: true, message: t('adminBookingDetails.paymentUrlNotAvailable'), severity: 'error' });
                        } catch (e: any) {
                          setSnackbar({ open: true, message: t('adminBookingDetails.failedToCreateCheckout'), severity: 'error' });
                        }
                      }}
                    >
                      {t('admin.payNow')}
                    </Button>
                  </Stack>
                </Stack>
              </InfoCard>
            )}

            {/* Confirmed: Start Trip */}
            {booking.status === 'CONFIRMED' && (
              <InfoCard title={t('admin.startTripTitle')} icon={<PlayArrow />}
              >
                <Stack spacing={2} alignItems="flex-start">
                  <Typography variant="body2" color="text.secondary">{t('admin.startTripDesc')}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="success" startIcon={<PlayArrow />} onClick={() => handleStartTrip()} disabled={!canStartTrip}>
                      {t('admin.startTrip')}
                    </Button>
                    {!canStartTrip && (
                      <Button variant="outlined" startIcon={<VerifiedUser />} onClick={handleViewDocuments}>
                        {t('admin.viewDocuments')}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </InfoCard>
            )}

            {/* Financial Summary - Only show if not courtesy */}
            {!isCourtesy && (
              <InfoCard title={t('admin.financialSummary')} icon={<Schedule />}>
                <Stack spacing={0} divider={<Divider />}>
                  <DataRow label={t('admin.basePrice')} value={`€${booking.basePrice?.toFixed(2) || '0.00'}`} />
                  <DataRow label={t('admin.tax')} value={`€${booking.taxAmount?.toFixed(2) || '0.00'}`} />
                  <DataRow label={t('admin.deposit')} value={`€${booking.depositAmount?.toFixed(2) || '0.00'}`} />
                  {booking.extraKmFee > 0 && <DataRow label={t('admin.extraKmFee')} value={`€${booking.extraKmFee?.toFixed(2)}`} valueColor="error.main" />}
                  <Box sx={{ py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>{t('admin.total')}</Typography>
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        €{booking.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </InfoCard>
            )}
          </Box>

          {/* Mobile Action Buttons */}
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              display: { xs: 'block', md: 'none' },
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              zIndex: 1000,
            }}
          >
            <Stack spacing={1.5}>
              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => handleStartTrip()}
                  disabled={!canStartTrip || isSubmitting}
                >
                  {isSubmitting ? t('admin.starting') : t('admin.startTrip')}
                </Button>
              )}
              <Button variant="outlined" fullWidth startIcon={<VerifiedUser />} onClick={handleViewDocuments}>
                {t('admin.viewDocuments')}
              </Button>
              {canCancel && (
                <Button variant="outlined" color="error" fullWidth startIcon={<Cancel />} onClick={() => setCancelDialogOpen(true)}>
                  {t('admin.cancelBooking')}
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Spacer for mobile fixed buttons */}
          <Box sx={{ height: { xs: 180, md: 0 } }} />
      </Stack>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('admin.cancelBookingTitle')} #{bookingRef}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {booking.payment?.status === 'SUCCEEDED'
              ? t('admin.cancelConfirmPaid')
              : t('admin.cancelConfirmNotPaid')}
          </Alert>
          <TextField
            autoFocus
            label={t('admin.reasonForCancellation')}
            placeholder={t('admin.reasonPlaceholder')}
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={isSubmitting}>
            {t('admin.back')}
          </Button>
          <Button variant="contained" color="error" onClick={handleCancelBooking} disabled={!cancelReason.trim() || isSubmitting}>
            {isSubmitting ? t('admin.cancelling') : t('admin.confirmCancellation')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pre-Trip Modal */}
      <PreTripModal open={preTripModalOpen} onClose={() => setPreTripModalOpen(false)} booking={booking} onConfirm={handleStartTrip} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBookingDetailsView;
