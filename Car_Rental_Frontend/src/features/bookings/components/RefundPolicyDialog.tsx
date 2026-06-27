import React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  // Calculate example refund amounts for this specific booking
  const fullRefundExample = estimatedTotal;
  const partial75RefundExample = Math.round(estimatedTotal * 0.75 * 100) / 100;
  const partial50RefundExample = Math.round(estimatedTotal * 0.5 * 100) / 100;

  const refundTiers = [
    {
      title: '✓ Full Refund (100%)',
      timeRange: 'More than 7 days before pickup',
      hours: '168+ hours',
      description: 'Cancel more than a week before your rental and receive a full refund.',
      example: fullRefundExample,
      color: 'success',
    },
    {
      title: '⊘ 75% Refund',
      timeRange: '3 to 7 days before pickup',
      hours: '72-168 hours',
      description: 'Cancel 3-7 days before pickup and receive 75% of your payment back.',
      example: partial75RefundExample,
      color: 'warning',
    },
    {
      title: '⊘ 50% Refund',
      timeRange: '24 hours to 3 days before pickup',
      hours: '24-72 hours',
      description: 'Cancel 1-3 days before pickup and receive 50% of your payment back.',
      example: partial50RefundExample,
      color: 'warning',
    },
    {
      title: '✗ No Refund (0%)',
      timeRange: 'Less than 24 hours before pickup',
      hours: '< 24 hours',
      description: 'Cancellations within 24 hours of pickup are non-refundable.',
      example: 0,
      color: 'error',
    },
  ];

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', pb: 1 }}>
        Refund & Cancellation Policy
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Please review our refund policy before confirming your reservation. Your estimated total is{' '}
          <Typography component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {estimatedTotal.toFixed(2)} €
          </Typography>{' '}
          for{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {bookingDuration} days
          </Typography>
          .
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {refundTiers.map((tier, index) => (
            <Card
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: '8px',
                borderColor: tier.color === 'success' ? 'success.light' : tier.color === 'error' ? 'error.light' : 'warning.light',
                backgroundColor: tier.color === 'success' ? 'rgba(76, 175, 80, 0.02)' : tier.color === 'error' ? 'rgba(244, 67, 54, 0.02)' : 'rgba(255, 193, 7, 0.02)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                <Chip
                  icon={tier.color === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
                  label={tier.timeRange}
                  size="small"
                  color={tier.color as any}
                  variant="outlined"
                  sx={{ fontWeight: 600, height: 'auto', py: 0.5 }}
                />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {tier.title}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                {tier.description}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ({tier.hours})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: tier.example > 0 ? 'success.main' : 'error.main',
                  }}
                >
                  Refund: {tier.example.toFixed(2)} €
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '8px', display: 'flex', gap: 1.5 }}>
          <WarningIcon sx={{ color: 'warning.main', flexShrink: 0, mt: 0.5 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Important Notes
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.6, pl: 1, m: 0 }}>
              <Typography component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                Platform fees are non-refundable and retained by our company.
              </Typography>
              <Typography component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                Refund amounts are calculated from the time of cancellation to pickup date.
              </Typography>
              <Typography component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                Refunds are processed within 5-7 business days.
              </Typography>
              <Typography component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                Late returns may incur additional charges regardless of cancellation policy.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined">
          Back
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          I Agree & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
