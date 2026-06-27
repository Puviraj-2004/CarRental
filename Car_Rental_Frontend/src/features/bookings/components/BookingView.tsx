'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
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
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  const handleReserveClick = (e: React.MouseEvent) => {
    // Find the form
    const form = document.querySelector('form') as HTMLFormElement;
    if (!form) return;

    // Get form values
    const formData = new FormData(form);
    const nameInput = formData.get('guestName') as string;
    const phoneInput = formData.get('guestPhone') as string;

    // Validate required fields
    if (!nameInput?.trim() || !phoneInput?.trim()) {
      // Let the form validation handle it - try to submit to trigger browser validation
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
      return;
    }

    // If valid, show policy dialog
    setPolicyDialogOpen(true);
  };

  const handlePolicyConfirm = () => {
    setPolicyDialogOpen(false);
    // Trigger form submission
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
          Checkout & Reservation
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '15px', fontWeight: 500 }}>
          Confirm your trip details and proceed securely to checkout.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={4}>
          
          {/* ─── LEFT COLUMN: RENTER DETAILS (FORM) ───────────────────────── */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', bgcolor: 'background.paper' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.5px' }}>
                Driver Details
              </Typography>
              
              <Grid container spacing={3}>
                
                {/* Full Name (Manual Entry) [1] */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                      Driver's Full Name
                    </FormLabel>
                    <TextField
                      name="guestName"
                      required
                      placeholder="e.g. John Doe"
                      disabled={loading}
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: '8px' } }}
                    />
                  </FormControl>
                </Grid>

                {/* Phone Number (Manual Entry) [1] */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                      Contact Phone Number
                    </FormLabel>
                    <TextField
                      name="guestPhone"
                      required
                      placeholder="e.g. +33 6 12 34 56 78"
                      disabled={loading}
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: '8px' } }}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                      Special Requests / Notes (Optional)
                    </FormLabel>
                    <TextField
                      name="notes"
                      placeholder="e.g., Requesting a child seat, pickup instructions..."
                      disabled={loading}
                      multiline
                      rows={3}
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: '8px' } }}
                    />
                  </FormControl>
                </Grid>

              </Grid>
            </Card>
          </Grid>

          {/* ─── RIGHT COLUMN: ORDER SUMMARY & COST ───────────────────────── */}
          <Grid item xs={12} md={5}>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: '16px', 
                bgcolor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                top: 90
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.5px' }}>
                Order Summary
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box 
                  sx={{ 
                    width: 90, 
                    height: 60, 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0 
                  }}
                >
                  <img 
                    src={car.primaryImageUrl || 'https://via.placeholder.com/200x120?text=No+Image'} 
                    alt="Vehicle" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {car.model.brand.name} {car.model.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {car.fuelType?.name || 'Petrol'} • {car.plateNumber}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={1} sx={{ fontSize: '13px', color: 'text.secondary', mb: 3 }}>
                <Grid item xs={5}><strong>Pick-up Date:</strong></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
                  {new Date(startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </Grid>
                <Grid item xs={5}><strong>Return Date:</strong></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
                  {new Date(endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </Grid>
                <Grid item xs={5}><strong>Duration:</strong></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
                  {bookingDuration} Days
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={1.5} sx={{ fontSize: '14px', color: 'text.secondary', mb: 3 }}>
                <Grid item xs={6}>Subtotal (Net):</Grid>
                <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>
                  {subtotal.toFixed(2)} €
                </Grid>
                
                <Grid item xs={6}>VAT / Tax ({taxPercentage}%):</Grid> 
                <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>
                  {taxAmount.toFixed(2)} €
                </Grid>
                
                <Grid item xs={12} sx={{ my: 0.5 }}>
                  <Divider />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '16px' }}>
                    Total Estimated
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography color="secondary.main" sx={{ fontWeight: 900, fontSize: '18px' }}>
                    {estimatedTotal.toFixed(2)} €
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  type="button"
                  onClick={handleReserveClick}
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Initializing checkout...</Typography>
                    </Box>
                  ) : (
                    'Reserve & Upload Documents'
                  )}
                </Button>
                
                <Button
                  component={Link}
                  href={`/viewDetails/${car.id}?startDate=${startDate}&endDate=${endDate}`}
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                >
                  Back to Vehicle Specs
                </Button>
              </Box>

            </Card>
          </Grid>

        </Grid>
      </Box>

      <RefundPolicyDialog
        open={policyDialogOpen}
        onConfirm={handlePolicyConfirm}
        onCancel={() => setPolicyDialogOpen(false)}
        estimatedTotal={estimatedTotal}
        bookingDuration={bookingDuration}
      />
    </Container>
  );
};