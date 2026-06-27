'use client';

import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { DashboardStats } from './DashboardContainer';

interface DashboardViewProps {
  t: (path: string) => string;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const statusTone = (status: string) => {
  if (status === 'CONFIRMED' || status === 'COMPLETED') {
    return { bgcolor: 'success.light', color: 'success.dark' };
  }
  if (status === 'CANCELLED' || status === 'REJECTED' || status === 'EXPIRED') {
    return { bgcolor: 'error.light', color: 'error.dark' };
  }
  if (status === 'ONGOING') {
    return { bgcolor: 'info.light', color: 'info.dark' };
  }
  return { bgcolor: 'warning.light', color: 'warning.dark' };
};

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const summaryCards = [
    { label: 'Total Revenue', value: `${(stats?.totalRevenue ?? 0).toFixed(2)} EUR`, color: 'success.main' },
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, color: 'primary.main' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'warning.main' },
    { label: 'Total Cars', value: stats?.totalCars ?? 0, color: 'secondary.main' },
    { label: 'Available Cars', value: stats?.availableCars ?? 0, color: 'info.main' },
    { label: 'Pending Documents', value: stats?.pendingDocuments ?? 0, color: 'warning.dark' },
    { label: 'Pending Payments', value: stats?.pendingPayments ?? 0, color: 'error.main' },
    { label: 'Active Rentals', value: stats?.ongoingBookings ?? 0, color: 'success.dark' },
  ];

  const bookingBreakdown = [
    { label: 'Reserved', value: stats?.reservedBookings ?? 0 },
    { label: 'Confirmed', value: stats?.confirmedBookings ?? 0 },
    { label: 'Ongoing', value: stats?.ongoingBookings ?? 0 },
    { label: 'Completed', value: stats?.completedBookings ?? 0 },
    { label: 'Cancelled', value: stats?.cancelledBookings ?? 0 },
    { label: 'Rejected', value: stats?.rejectedBookings ?? 0 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        Live operational stats from bookings, payments, vehicles, users, and verification records.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: 1, borderColor: 'grey.100' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {bookingBreakdown.map((item) => (
          <Grid item xs={6} sm={4} md={2} key={item.label}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {item.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {item.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Recent Bookings
        </Typography>
        <Button component={Link} href="/admin/bookings/online" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
          View Queue
        </Button>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Booking</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Car</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(stats?.recentBookings || []).map((booking) => {
                const tone = statusTone(booking.status);
                return (
                  <TableRow key={booking.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      #{booking.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {booking.guestName || booking.user?.fullName || booking.user?.email || 'Customer'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.guestPhone || booking.user?.phoneNumber || booking.user?.email || 'No contact'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {booking.car.brand.name} {booking.car.model.name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {booking.totalPrice.toFixed(2)} EUR
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '8px', fontSize: 12, fontWeight: 800, ...tone }}>
                        {booking.status}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button component={Link} href={`/admin/bookings/${booking.id}`} size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {(stats?.recentBookings || []).map((booking) => {
          const tone = statusTone(booking.status);
          return (
            <Card key={booking.id} variant="outlined" sx={{ borderRadius: '8px', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                  #{booking.id.slice(0, 8)}
                </Typography>
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: '8px', fontSize: 11, fontWeight: 800, ...tone }}>
                  {booking.status}
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {booking.car.brand.name} {booking.car.model.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.guestName || booking.user?.fullName || booking.user?.email || 'Customer'}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, mt: 1 }}>
                {booking.totalPrice.toFixed(2)} EUR
              </Typography>
              <Button component={Link} href={`/admin/bookings/${booking.id}`} sx={{ mt: 2, textTransform: 'none', fontWeight: 700 }}>
                Details
              </Button>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
