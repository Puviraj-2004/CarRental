'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,
  Chip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  PlayArrow,
  Cancel,
  VerifiedUser,
  Schedule,
  DirectionsCar,
  Person,
  Payment,
  Speed,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { PreTripModal } from './PreTripModal';
import { useTranslation } from '@/lib/LanguageContext';

// ============================================================================
// TYPES
// ============================================================================
interface BookingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  actions: any;
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

// Info Card Container
const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Box>
);

// Data Row Component
const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} color={valueColor || 'text.primary'} sx={{ textAlign: 'right' }}>
      {value || '—'}
    </Typography>
  </Box>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AdminBookingDetailsModal = ({ open, onClose, booking, actions }: BookingDetailsModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { t } = useTranslation();

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

  if (!booking) return null;

  // Derived data
  const bookingId = booking.id?.slice(-6).toUpperCase() || 'N/A';
  const isCourtesy = booking.bookingType === 'REPLACEMENT';
  const isWalkIn = booking.isWalkIn;
  const customerName = booking.guestName || booking.user?.fullName || t('admin.guestCustomer');
  const customerPhone = booking.guestPhone || booking.user?.phoneNumber || '—';
  const customerEmail = booking.guestEmail || booking.user?.email || '—';
  const customerId = booking.user?.id?.slice(-8).toUpperCase() || (isWalkIn ? t('admin.walkIn') : '—');
  
  const docStatus = booking.documentVerification?.status || 'NOT_UPLOADED';
  const isDocVerified = docStatus === 'APPROVED';
  const canStartTrip = booking.status === 'CONFIRMED' && (isDocVerified || isWalkIn || isCourtesy);
  const canCancel = !['CANCELLED', 'COMPLETED', 'ONGOING'].includes(booking.status);

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.DRAFT;
  const paymentConfig = PAYMENT_STATUS_CONFIG[booking.payment?.status] || PAYMENT_STATUS_CONFIG.PENDING;
  const docConfig = DOC_STATUS_CONFIG[docStatus] || DOC_STATUS_CONFIG.NOT_UPLOADED;

  // Handlers
  const handleStartTrip = async (data?: { startOdometer: number; pickupNotes?: string }) => {
    if (!data) {
      setPreTripModalOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await actions.startTrip(booking.id, data.startOdometer, data.pickupNotes);
      setSnackbar({ open: true, message: t('admin.tripStarted'), severity: 'success' });
      setPreTripModalOpen(false);
      setTimeout(() => {
        actions.refreshBooking?.();
        onClose();
      }, 1000);
    } catch (error: any) {
      setSnackbar({ open: true, message: t('admin.failedToStartTrip'), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocuments = () => {
    // Navigate to document verification page
    router.push(`/admin/bookings/${booking.id}/documents`);
    onClose();
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      const success = await actions.cancelBooking(booking.id, cancelReason);
      if (success) {
        setSnackbar({ open: true, message: t('admin.bookingCancelledSuccess'), severity: 'success' });
        setCancelDialogOpen(false);
        setTimeout(() => {
          actions.refreshBooking?.();
          onClose();
        }, 1000);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: t('admin.failedCancelBooking'), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? '100%' : '90vh',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 2.5,
            bgcolor: 'grey.900',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="h6" fontWeight={700}>
              #{bookingId}
            </Typography>
            <Chip
              label={t(statusConfig.labelKey)}
              color={statusConfig.color}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
            {isCourtesy && (
              <Chip label={t('admin.courtesyChip')} size="small" sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600 }} />
            )}
            {isWalkIn && (
              <Chip label={t('admin.walkInChip')} size="small" sx={{ bgcolor: 'info.main', color: 'white', fontWeight: 600 }} />
            )}
          </Stack>
          <IconButton onClick={onClose} sx={{ color: 'white' }} aria-label="Close">
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 0, bgcolor: 'grey.100' }}>
          <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
            {/* SECTION 1: Booking Details */}
            <InfoCard title={t('admin.bookingDetails')} icon={<Schedule />}>
              <Stack spacing={0.5} divider={<Divider />}>
                <DataRow label={t('admin.bookingReference')} value={bookingId} />
                <DataRow label={t('admin.bookingType')} value={isCourtesy ? t('admin.courtesyReplacement') : t('admin.standardRental')} />
                <DataRow label={t('admin.created')} value={formatDateForDisplay(booking.createdAt)} />
                <Box sx={{ py: 1.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1, p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="caption" color="success.dark" fontWeight={600}>{t('admin.pickUp')}</Typography>
                      <Typography variant="body1" fontWeight={700}>{formatDateForDisplay(booking.startDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.pickupTime || '—'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                      <Typography variant="caption" color="error.dark" fontWeight={600}>{t('admin.dropOff')}</Typography>
                      <Typography variant="body1" fontWeight={700}>{formatDateForDisplay(booking.endDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.returnTime || '—'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                <DataRow
                  label={t('admin.paymentStatus')}
                  value={
                    <Chip
                      icon={paymentConfig.icon}
                      label={booking.payment?.status || 'PENDING'}
                      color={paymentConfig.color}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  }
                />
                <DataRow
                  label={t('admin.totalAmount')}
                  value={isCourtesy ? t('admin.courtesyFree') : `€${booking.totalPrice?.toFixed(2) || '0.00'}`}
                  valueColor={isCourtesy ? 'success.main' : 'primary.main'}
                />
              </Stack>
            </InfoCard>

            {/* SECTION 2: Customer Information */}
            <InfoCard title={t('admin.customerInfo')} icon={<Person />}>
              <Stack spacing={0.5} divider={<Divider />}>
                <DataRow label={t('admin.name')} value={customerName} />
                <DataRow label={t('admin.phone')} value={customerPhone} />
                <DataRow label={t('admin.email')} value={customerEmail} />
                <DataRow label={t('admin.customerId')} value={customerId} />
                <DataRow
                  label={t('admin.documents')}
                  value={
                    <Chip
                      icon={docConfig.icon}
                      label={t(docConfig.labelKey)}
                      color={docConfig.color}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  }
                />
              </Stack>
            </InfoCard>

            {/* SECTION 3: Vehicle Information */}
            <InfoCard title={t('admin.vehicleInformation')} icon={<DirectionsCar />}>
              <Stack spacing={0.5} divider={<Divider />}>
                <DataRow
                  label={t('admin.vehicleLabel')}
                  value={`${booking.car?.brand?.name || ''} ${booking.car?.model?.name || ''}`.trim() || '—'}
                />
                <DataRow label={t('admin.plateNumber')} value={booking.car?.plateNumber} />
                <DataRow label={t('admin.transmission')} value={booking.car?.transmission} />
                <DataRow label={t('admin.fuelType')} value={booking.car?.fuelType} />
                <DataRow label={t('admin.seats')} value={booking.car?.seats ? t('admin.seatsCount', { count: String(booking.car.seats) }) : '—'} />
                <DataRow
                  label={t('admin.vehicleStatus')}
                  value={
                    <Chip
                      label={booking.car?.status || 'AVAILABLE'}
                      size="small"
                      color={booking.car?.status === 'AVAILABLE' ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  }
                />
                {booking.startOdometer && (
                  <DataRow label={t('admin.startOdometer')} value={`${booking.startOdometer.toLocaleString()} km`} />
                )}
                {booking.endOdometer && (
                  <DataRow label={t('admin.endOdometer')} value={`${booking.endOdometer.toLocaleString()} km`} />
                )}
              </Stack>
            </InfoCard>
          </Stack>
        </DialogContent>

        {/* Action Buttons - Sticky Footer */}
        <DialogActions
          sx={{
            p: 2.5,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1.5,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {/* View Documents Button */}
          {!isWalkIn && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<VerifiedUser />}
              onClick={handleViewDocuments}
              fullWidth={isMobile}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              {t('admin.viewDocuments')}
            </Button>
          )}

          {/* Cancel Button */}
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelDialogOpen(true)}
              fullWidth={isMobile}
              sx={{ order: { xs: 3, sm: 2 } }}
            >
              {t('admin.cancelBooking')}
            </Button>
          )}

          {/* Start Trip Button */}
          {booking.status === 'CONFIRMED' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={() => handleStartTrip()}
              disabled={!canStartTrip || isSubmitting}
              fullWidth={isMobile}
              sx={{
                order: { xs: 1, sm: 3 },
                py: 1.2,
                fontWeight: 700,
                minWidth: 160,
              }}
            >
              {isSubmitting ? t('admin.starting') : t('admin.startTrip')}
            </Button>
          )}

          {/* Disabled state message */}
          {booking.status === 'CONFIRMED' && !canStartTrip && (
            <Typography variant="caption" color="warning.main" sx={{ order: 4 }}>
              {t('admin.docsMustBeVerified')}
            </Typography>
          )}
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('admin.cancelBookingHeader', { id: bookingId })}</DialogTitle>
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
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelBooking}
            disabled={!cancelReason.trim() || isSubmitting}
          >
            {isSubmitting ? t('admin.cancelling') : t('admin.confirmCancellation')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pre-Trip Modal */}
      <PreTripModal
        open={preTripModalOpen}
        onClose={() => setPreTripModalOpen(false)}
        booking={booking}
        onConfirm={handleStartTrip}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminBookingDetailsModal;
