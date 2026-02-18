'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  Alert,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Article as DocumentIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/LanguageContext';

interface PreTripModalProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onConfirm: (data: { startOdometer: number; pickupNotes?: string }) => Promise<void>;
}

export const PreTripModal = ({ open, onClose, booking, onConfirm }: PreTripModalProps) => {
  const { t } = useTranslation();
  const [startOdometer, setStartOdometer] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [documentsChecked, setDocumentsChecked] = useState(false);
  const [exteriorChecked, setExteriorChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!startOdometer || isNaN(Number(startOdometer))) {
      setError(t('admin.enterValidOdometer'));
      return;
    }

    if (Number(startOdometer) < 0) {
      setError(t('admin.odometerCannotNegative'));
      return;
    }

    if (!documentsChecked || !exteriorChecked) {
      setError(t('admin.completeAllChecks'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onConfirm({
        startOdometer: Number(startOdometer),
        pickupNotes: pickupNotes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(t('admin.failedToStartTrip'));
    } finally {
      setLoading(false);
    }
  };

  const isReady = startOdometer && documentsChecked && exteriorChecked;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>{t('admin.preTripChecklist')}</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {t('admin.booking')} #{booking?.id?.slice(-6).toUpperCase()} • {booking?.car?.brand?.name} {booking?.car?.model?.name}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          {/* Pre-Checks Status */}
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon fontSize="small" color={booking?.payment?.status === 'SUCCEEDED' ? 'success' : 'disabled'} />
                <Typography variant="body2" fontWeight={600}>
                  {t('admin.paymentColon')} {booking?.payment?.status === 'SUCCEEDED' ? t('admin.verifiedCheck') : t('admin.pending')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon fontSize="small" color={booking?.user?.verification?.status === 'APPROVED' ? 'success' : 'disabled'} />
                <Typography variant="body2" fontWeight={600}>
                  {t('admin.documentsColon')} {booking?.user?.verification?.status === 'APPROVED' ? t('admin.verifiedCheck') : booking?.isWalkIn ? t('admin.walkinSkip') : t('admin.pending')}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Odometer Input */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <SpeedIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={700}>{t('admin.startOdometerReading')} *</Typography>
            </Stack>
            <TextField
              fullWidth
              type="number"
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
              placeholder={t('admin.odometerPlaceholder')}
              InputProps={{
                endAdornment: <Typography variant="body2" color="text.secondary">km</Typography>
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
              autoFocus
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('admin.currentCarOdometer')}: {booking?.car?.currentOdometer?.toLocaleString() || 'N/A'} km
            </Typography>
          </Box>

          <Divider />

          {/* Physical Checks */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <DocumentIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={700}>{t('admin.physicalVerification')} *</Typography>
            </Stack>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={documentsChecked} 
                    onChange={(e) => setDocumentsChecked(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t('admin.physicalDocsVerified')}
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={exteriorChecked} 
                    onChange={(e) => setExteriorChecked(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t('admin.exteriorInspection')}
                  </Typography>
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* Optional Notes */}
          <Box>
            <Typography variant="body2" fontWeight={700} mb={1}>{t('admin.pickupNotesOptional')}</Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder={t('admin.pickupNotesPlaceholder')}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {t('admin.cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isReady || loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
          sx={{ 
            borderRadius: 2, 
            bgcolor: '#10B981',
            minWidth: 180,
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          {loading ? t('admin.startingTrip') : t('admin.startTripHandover')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
