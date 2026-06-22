'use client';

import React from 'react';
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
import Link from 'next/link';
import type { Booking } from '../hooks/useBooking';
import { PageInfo } from '../hooks/useBookingRecords';
import { Alert, Pagination } from '@mui/material';

interface BookingRecordsViewProps {
  t: (path: string) => string;
  bookings: Booking[];
  pageInfo?: PageInfo;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

export const BookingRecordsView: React.FC<BookingRecordsViewProps> = ({
  t,
  bookings,
  pageInfo,
  loading,
  error,
  onPageChange,
}) => {
  
  const renderStatusBadge = (booking: Booking) => {
    let label = booking.status as string;
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

    switch (booking.status) {
      case 'RESERVED':
        if (booking.payment?.status === 'PENDING') {
          color = 'warning';
          label = 'Hold Authorized (Awaiting Review)'; // [1.1.5]
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
            const isAuthorized = booking.status === 'RESERVED' && booking.payment?.status === 'PENDING';
            const hasNoDocs = booking.status === 'RESERVED' && !booking.documents;

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
                            {isAuthorized ? 'Authorized Hold' : 'Total Amount'}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            {Number(booking.totalPrice).toFixed(2)} €
                          </Typography>
                        </Box>

                        {/* Strict context-driven actions [1.1.2, 1.1.5] */}
                        {booking.status === 'RESERVED' && (isUnpaid || hasNoDocs) ? (
                          <Button
                            component={Link}
                            href={hasNoDocs ? `/booking/${booking.id}/documents` : `/booking/${booking.id}/payment`} 
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', alignSelf: { xs: 'auto', sm: 'stretch' } }}
                          >
                            {hasNoDocs ? 'Verify & Pay' : 'Complete Payment'}
                          </Button>
                        ) : isAuthorized ? (
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            disabled
                            startIcon={<HourglassEmptyIcon />}
                            sx={{ 
                              textTransform: 'none', 
                              fontWeight: 700, 
                              borderRadius: '8px', 
                              alignSelf: { xs: 'auto', sm: 'stretch' },
                              '&.Mui-disabled': { color: 'warning.main', borderColor: 'warning.light' } 
                            }}
                          >
                            Awaiting Approval
                          </Button>
                        ) : booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? (
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
    </Container>
  );
};