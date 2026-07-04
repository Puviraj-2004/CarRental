import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/lib/LanguageContext';
import { formatMoney } from '@/lib/moneyUtils';

interface RefundPolicyDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  estimatedTotal: number;
  bookingDuration: number;
}

export const RefundPolicyDialog: React.FC<RefundPolicyDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  estimatedTotal,
  bookingDuration,
}) => {
  const { t } = useLanguage();
  const fullRefundExample = estimatedTotal;
  const partial75RefundExample = Math.round(estimatedTotal * 0.75 * 100) / 100;
  const partial50RefundExample = Math.round(estimatedTotal * 0.5 * 100) / 100;

  const refundTiers = [
    {
      title: t('booking.refundPolicy.tiers.full.title'),
      timeRange: t('booking.refundPolicy.tiers.full.timeRange'),
      hours: t('booking.refundPolicy.tiers.full.hours'),
      description: t('booking.refundPolicy.tiers.full.description'),
      example: fullRefundExample,
      color: 'success' as const,
    },
    {
      title: t('booking.refundPolicy.tiers.partial75.title'),
      timeRange: t('booking.refundPolicy.tiers.partial75.timeRange'),
      hours: t('booking.refundPolicy.tiers.partial75.hours'),
      description: t('booking.refundPolicy.tiers.partial75.description'),
      example: partial75RefundExample,
      color: 'warning' as const,
    },
    {
      title: t('booking.refundPolicy.tiers.partial50.title'),
      timeRange: t('booking.refundPolicy.tiers.partial50.timeRange'),
      hours: t('booking.refundPolicy.tiers.partial50.hours'),
      description: t('booking.refundPolicy.tiers.partial50.description'),
      example: partial50RefundExample,
      color: 'warning' as const,
    },
    {
      title: t('booking.refundPolicy.tiers.none.title'),
      timeRange: t('booking.refundPolicy.tiers.none.timeRange'),
      hours: t('booking.refundPolicy.tiers.none.hours'),
      description: t('booking.refundPolicy.tiers.none.description'),
      example: 0,
      color: 'error' as const,
    },
  ];

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('booking.refundPolicy.title')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t('booking.refundPolicy.introStart')}{' '}
            <Typography component="span" sx={{ color: 'primary.main', fontWeight: 750 }}>
              {formatMoney(estimatedTotal)}
            </Typography>{' '}
            {t('booking.refundPolicy.introMiddle')}{' '}
            <Typography component="span" sx={{ fontWeight: 750 }}>
              {bookingDuration} {t('payment.common.days').toLowerCase()}
            </Typography>
            {t('booking.refundPolicy.introEnd')}
          </Typography>

          <Stack spacing={1.5}>
            {refundTiers.map((tier) => (
              <Card
                key={tier.title}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: tier.color === 'success' ? 'success.light' : tier.color === 'error' ? 'error.light' : 'warning.light',
                }}
              >
                <Stack spacing={1.25}>
                  <Chip
                    icon={tier.color === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
                    label={tier.timeRange}
                    size="small"
                    color={tier.color}
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start', height: 'auto', py: 0.5 }}
                  />

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
                      {tier.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {tier.description}
                    </Typography>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650 }}>
                      {tier.hours}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 750, color: tier.example > 0 ? 'success.main' : 'error.main' }}>
                      {t('booking.refundPolicy.refundLabel')}: {formatMoney(tier.example)}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Divider />

          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, display: 'flex', gap: 1.5 }}>
            <WarningIcon sx={{ color: 'warning.main', flexShrink: 0, mt: 0.25 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 750, mb: 0.5 }}>
                {t('booking.refundPolicy.notesTitle')}
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                {[
                  t('booking.refundPolicy.notes.platformFees'),
                  t('booking.refundPolicy.notes.calculation'),
                  t('booking.refundPolicy.notes.processing'),
                  t('booking.refundPolicy.notes.lateReturns'),
                ].map((note) => (
                  <Typography component="li" variant="caption" color="text.secondary" key={note}>
                    {note}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} variant="outlined">
          {t('common.back')}
        </Button>
        <Button onClick={onConfirm} variant="contained">
          {t('booking.refundPolicy.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
