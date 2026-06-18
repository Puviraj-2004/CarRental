'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Link from 'next/link';
import type { Booking} from '../hooks/useBooking';
import { PageInfo } from '../hooks/useBookingRecords';

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
  
  const renderStatusBadge = (status: Booking['status']) => {
    let bgcolor = 'grey.100';
    let color = 'text.secondary';
    let label = status as string;

    switch (status) {
      case 'RESERVED':
        bgcolor = '#fffbeb'; 
        color = '#d97706';
        label = 'Pending Payment';
        break;
      case 'CONFIRMED':
        bgcolor = '#eff6ff'; 
        color = '#2563eb';
        label = 'Confirmed & Paid';
        break;
      case 'ONGOING':
        bgcolor = '#ecfdf5'; 
        color = '#059669';
        label = 'Trip in Progress';
        break;
      case 'COMPLETED':
        bgcolor = '#f3f4f6'; 
        color = '#4b5563';
        label = 'Trip Completed';
        break;
      case 'CANCELLED':
      case 'REJECTED':
        bgcolor = '#fef2f2'; 
        color = '#dc2626';
        label = 'Cancelled';
        break;
    }

    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 1.5,
          py: 0.5,
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 700,
          bgcolor,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </Box>
    );
  };

  const renderVerificationBadge = (booking: Booking) => {
    const docStatus = booking.documents?.status;

    if (!booking.documents) {
      return (
        <Box sx={{ display: 'inline-block', px: 1.2, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #f87171' }}>
          Identity Unverified
        </Box>
      );
    }

    if (docStatus === 'PENDING') {
      return (
        <Box sx={{ display: 'inline-block', px: 1.2, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #fbbf24' }}>
          Verification Pending Approval
        </Box>
      );
    }

    if (docStatus === 'APPROVED') {
      return (
        <Box sx={{ display: 'inline-block', px: 1.2, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669', border: '1px solid #34d399' }}>
          Verified Identity
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'inline-block', px: 1.2, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #f87171' }}>
        Documents Rejected
      </Box>
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

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

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
            const isUnpaid = booking.status === 'RESERVED';
            const hasNoDocs = !booking.documents;

            return (
              <Card 
                key={booking.id} 
                variant="outlined" 
                sx={{ 
                  p: { xs: 2.5, md: 3 }, 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                  transition: '0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }
                }}
              >
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
                        {renderStatusBadge(booking.status)}
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
                          Total Amount Paid
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          {Number(booking.totalPrice).toFixed(2)} €
                        </Typography>
                      </Box>

                      {isUnpaid || hasNoDocs ? (
                        <Button
                          component={Link}
                          // Corrected Path: Point strictly to your /booking/[id]/payment subpath [1]
                          href={hasNoDocs ? `/booking/${booking.id}/documents` : `/booking/${booking.id}/payment`} 
                          variant="contained"
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', alignSelf: { xs: 'auto', sm: 'stretch' } }}
                        >
                          {hasNoDocs ? 'Verify & Pay' : 'Complete Payment'}
                        </Button>
                      ) : (
                        <Button
                          component={Link}
                          href={`/booking/${booking.id}/success`} 
                          variant="outlined"
                          size="small"
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', alignSelf: { xs: 'auto', sm: 'stretch' } }}
                        >
                          View Receipt
                        </Button>
                      )}

                    </Box>
                  </Grid>

                </Grid>
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