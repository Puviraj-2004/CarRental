'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import type { Booking } from '../hooks/useBooking';
import { PageInfo } from '../hooks/useBookingRecords';
import { Alert, Pagination } from '@mui/material';
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

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    // Find booking and calculate refund
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking && booking.payment?.status === 'PAID') {
      const refund = calculateRefund(Number(booking.totalPrice), new Date(booking.startDate));
      setRefundInfo(refund);
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
    } catch (err) {
      console.error('Cancel booking failed:', err);
    }
  };

  const handleExtendClick = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    const currentEndDate = new Date(booking.endDate);
    setNewEndDate(currentEndDate.toISOString().split('T')[0]);
    setExtendError(null);
    setExtendDialogOpen(true);
  };

  const handleExtendConfirm = async () => {
    if (!selectedBookingId || !onExtend || !newEndDate) return;
    
    // Validation
    const selected = bookings.find((b) => b.id === selectedBookingId);
    if (!selected) return;
    
    const newDate = new Date(newEndDate);
    const currentEndDate = new Date(selected.endDate);
    
    if (newDate <= currentEndDate) {
      setExtendError('New end date must be after current end date');
      return;
    }
    
    try {
      await onExtend(selectedBookingId, new Date(newEndDate).toISOString());
      setExtendDialogOpen(false);
      setSelectedBookingId(null);
      setNewEndDate('');
      setExtendError(null);
    } catch (err) {
      setExtendError((err as Error).message || 'Failed to extend booking');
    }
  };
  
  const renderStatusBadge = (booking: Booking) => {
    let label = booking.status as string;
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

    switch (booking.status) {
      case 'RESERVED':
        if (booking.payment?.status === 'PENDING') {
          color = 'warning';
          label = 'Pending Payment';
        } else {
          color = 'warning';
          label = 'Pending Payment';
        }
        break;
      case 'CONFIRMED':
        color = 'primary';
        label = 'Confirmed & Paid';
        break;
      case 'ONGOING':
        color = 'success';
        label = 'Trip in Progress';
        break;
      case 'COMPLETED':
        color = 'default';
        label = 'Trip Completed';
        break;
      case 'EXPIRED':
        color = 'error';
        label = 'Booking Expired';
        break;
      case 'CANCELLED':
      case 'REJECTED':
        color = 'error';
        label = 'Cancelled';
        break;
    }

    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', borderRadius: '6px' }}
      />
    );
  };

  const renderVerificationBadge = (booking: Booking) => {
    const docStatus = booking.documents?.status;

    if (!booking.documents) {
      return (
        <Chip
          label="Identity Unverified"
          variant="outlined"
          color="error"
          size="small"
          sx={{ fontWeight: 700, fontSize: '11px', borderRadius: '6px' }}
        />
      );
    }

    if (docStatus === 'PENDING') {
      return (
        <Chip
          label="Verification Pending"
          variant="outlined"
          color="warning"
          size="small"
          sx={{ fontWeight: 700, fontSize: '11px', borderRadius: '6px' }}
        />
      );
    }

    if (docStatus === 'APPROVED') {
      return (
        <Chip
          label="Verified Identity"
          variant="outlined"
          color="success"
          size="small"
          sx={{ fontWeight: 700, fontSize: '11px', borderRadius: '6px' }}
        />
      );
    }

    return (
      <Chip
        label="Documents Rejected"
        variant="outlined"
        color="error"
        size="small"
        sx={{ fontWeight: 700, fontSize: '11px', borderRadius: '6px' }}
      />
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
          My Bookings
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '15px' }}>
          Review your upcoming trips, active rentals, and past order history.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}

      {bookings.length === 0 ? (
        <Card variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: '16px' }}>
          <DirectionsCarIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No Bookings Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            You haven't reserved any vehicles yet. Explore our fleet to get started!
          </Typography>
          <Button variant="contained" component={Link} href="/cars" sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}>
            Browse Cars
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {bookings.map((booking) => {
            // Isolates active booking conditions [1.1.5]
            const isUnpaid = booking.status === 'RESERVED' && !booking.payment;
            const hasNoDocs = booking.status === 'RESERVED' && !booking.documents;
            // Only show "Awaiting Approval" if docs are not yet approved (still pending or rejected)
            const isDocsPending = booking.status === 'RESERVED' && booking.payment?.status === 'PENDING' && booking.documents?.status !== 'APPROVED';
            // Ready to pay: RESERVED with authorized hold (PENDING payment) but docs are now approved
            const readyToPay = booking.status === 'RESERVED' && booking.payment?.status === 'PENDING' && booking.documents?.status === 'APPROVED';

            return (
              <Card 
                key={booking.id} 
                variant="outlined" 
                sx={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                  transition: '0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
                  <Grid container spacing={3} alignItems="center">
                    
                    <Grid item xs={12} sm={3}>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          aspectRatio: { xs: '16/9', sm: '4/3' }, 
                          borderRadius: '12px', 
                          overflow: 'hidden', 
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.100'
                        }}
                      >
                        <img 
                          src={booking.car.primaryImageUrl || 'https://via.placeholder.com/200x120?text=No+Image'} 
                          alt="Car Thumbnail" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          {renderStatusBadge(booking)}
                          {renderVerificationBadge(booking)} 
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mt: 0.5 }}>
                          {booking.car.model.brand.name} {booking.car.model.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '13px', fontWeight: 500 }}>
                          <CalendarMonthIcon sx={{ fontSize: 16 }} />
                          <span>
                            {new Date(booking.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} - {new Date(booking.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <strong>{booking.numberOfDays} Days</strong>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-end' }, gap: 1.5 }}>
                        
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Amount
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            {Number(booking.totalPrice).toFixed(2)} €
                          </Typography>
                        </Box>

                        {/* Strict context-driven actions [1.1.2, 1.1.5] */}
                        {booking.status === 'RESERVED' && (isUnpaid || hasNoDocs) ? (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              component={Link}
                              href={hasNoDocs ? `/booking/${booking.id}/documents` : `/booking/${booking.id}/payment`} 
                              variant="contained"
                              size="small"
                              endIcon={<ArrowForwardIcon />}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', flex: 1, minWidth: '120px' }}
                            >
                              {hasNoDocs ? 'Verify & Pay' : 'Complete Payment'}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleCancelClick(booking.id)}
                              disabled={loadingCancel}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EventIcon />}
                              onClick={() => handleExtendClick(booking)}
                              disabled={loadingExtend}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Extend Dates
                            </Button>
                          </Box>
                        ) : readyToPay ? (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              component={Link}
                              href={`/booking/${booking.id}/payment`}
                              variant="contained"
                              size="small"
                              endIcon={<ArrowForwardIcon />}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', flex: 1, minWidth: '120px' }}
                            >
                              Complete Payment
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleCancelClick(booking.id)}
                              disabled={loadingCancel}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EventIcon />}
                              onClick={() => handleExtendClick(booking)}
                              disabled={loadingExtend}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Extend Dates
                            </Button>
                          </Box>
                        ) : isDocsPending ? (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleCancelClick(booking.id)}
                              disabled={loadingCancel}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EventIcon />}
                              onClick={() => handleExtendClick(booking)}
                              disabled={loadingExtend}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Extend Dates
                            </Button>
                          </Box>
                        ) : booking.status === 'CONFIRMED' ? (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              component={Link}
                              href={`/booking/${booking.id}/success`} 
                              variant="outlined"
                              size="small"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', flex: 1, minWidth: '120px' }}
                            >
                              View Receipt
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleCancelClick(booking.id)}
                              disabled={loadingCancel}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        ) : booking.status === 'COMPLETED' ? (
                          <Button
                            component={Link}
                            href={`/booking/${booking.id}/success`} 
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', alignSelf: { xs: 'auto', sm: 'stretch' } }}
                          >
                            View Receipt
                          </Button>
                        ) : (
                          // Display static plain label for cancelled/rejected bookings [1.1.2]
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, py: 1, textTransform: 'uppercase', fontSize: '12px' }}>
                            Closed Booking
                          </Typography>
                        )}

                      </Box>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>
            );
          })}

          {pageInfo && pageInfo.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageInfo.totalPages}
                page={pageInfo.currentPage}
                onChange={(_, page) => onPageChange(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '18px' }}>Cancel Booking</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Are you sure you want to cancel this booking?
          </Typography>
          
          {refundInfo && (
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '8px', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  Refund Policy
                </Typography>
                <Chip
                  label={refundInfo.policyDescription}
                  size="small"
                  color={refundInfo.policy === 'FULL' ? 'success' : refundInfo.policy === 'PARTIAL' ? 'warning' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                {refundInfo.reason}
              </Typography>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Total Paid
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {(refundInfo.refundAmount + refundInfo.keepAmount).toFixed(2)} €
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Refund Amount
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: refundInfo.refundAmount > 0 ? 'success.main' : 'error.main' 
                    }}
                  >
                    {refundInfo.refundAmount.toFixed(2)} €
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Platform Fee
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {refundInfo.keepAmount.toFixed(2)} €
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Days Until Pickup
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {Math.round(refundInfo.hoursUntilPickup / 24)} days
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setCancelConfirmOpen(false);
              setRefundInfo(null);
            }}
            variant="outlined"
          >
            No, Keep It
          </Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
            disabled={loadingCancel}
          >
            {loadingCancel ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Date Extension Dialog */}
      <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '18px' }}>Extend Booking Dates</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {extendError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {extendError}
            </Alert>
          )}
          {selectedBookingId && bookings.find((b) => b.id === selectedBookingId) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                  Current End Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {new Date(bookings.find((b) => b.id === selectedBookingId)!.endDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
              <TextField
                label="New End Date"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date(bookings.find((b) => b.id === selectedBookingId)!.endDate)
                    .toISOString()
                    .split('T')[0],
                }}
              />
              <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: '8px' }}>
                <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 500 }}>
                  ℹ️ The new end date must be after your current booking end date. Your rental rate will be recalculated accordingly.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setExtendDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExtendConfirm}
            variant="contained"
            disabled={loadingExtend || !newEndDate}
          >
            {loadingExtend ? 'Extending...' : 'Extend Dates'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};