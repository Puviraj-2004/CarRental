'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Card';
import type { DashboardStats } from './DashboardContainer';

interface DashboardViewProps {
  t: (path: string) => string;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ t, stats, loading, error }) => {
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

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
        {t('admin.dashboard.title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        {t('admin.dashboard.subtitle')}
      </Typography>

      {/* ─── Statistics Grid (Fully Responsive) ─────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { key: 'totalRevenue',  val: `${stats?.totalRevenue.toFixed(2)} €`, color: 'success.main' },
          { key: 'totalBookings', val: stats?.totalBookings || 0,             color: 'primary.main' },
          { key: 'totalCars',     val: stats?.totalCars || 0,                 color: 'secondary.main' },
          { key: 'totalUsers',    val: stats?.totalUsers || 0,                color: 'warning.main' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.key}>
            <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: 1, borderColor: 'grey.100' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                  {t(`admin.dashboard.stats.${stat.key}`)}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color }}>
                  {stat.val}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ─── Recent Bookings Section ───────────────────────────────────── */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
        {t('admin.dashboard.recentBookings')}
      </Typography>

      {/* ─── DESKTOP DATA TABLE (Visible only on desktop viewports) ─────── */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.dashboard.table.id')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.dashboard.table.customer')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.dashboard.table.car')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.dashboard.table.price')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.dashboard.table.status')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.dashboard.table.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(stats?.recentBookings || []).map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {booking.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {booking.isWalkIn ? booking.guestName : booking.user?.fullName}
                  </TableCell>
                  <TableCell>
                    {booking.car.brand.name} {booking.car.model.name}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {booking.totalPrice.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        bgcolor: booking.status === 'CONFIRMED' ? 'success.light' : booking.status === 'EXPIRED' ? 'error.light' : 'warning.light',
                        color: booking.status === 'CONFIRMED' ? 'success.dark' : booking.status === 'EXPIRED' ? 'error.dark' : 'warning.dark',
                      }}
                    >
                      {booking.status}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* ─── MOBILE CARDS LIST (Visible only on mobile/tablet viewports) ── */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {(stats?.recentBookings || []).map((booking) => (
          <Card key={booking.id} sx={{ borderRadius: '12px', p: 2, border: 1, borderColor: 'grey.100' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                #{booking.id.slice(0, 8)}
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  bgcolor: booking.status === 'CONFIRMED' ? 'success.light' : booking.status === 'EXPIRED' ? 'error.light' : 'warning.light',
                  color: booking.status === 'CONFIRMED' ? 'success.dark' : booking.status === 'EXPIRED' ? 'error.dark' : 'warning.dark',
                }}
              >
                {booking.status}
              </Box>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {booking.car.brand.name} {booking.car.model.name}
            </Typography>

            <Grid container spacing={1} sx={{ fontSize: '13px', color: 'text.secondary' }}>
              <Grid item xs={6}>
                <strong>{t('admin.dashboard.table.customer')}:</strong>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right', color: 'text.primary' }}>
                {booking.isWalkIn ? booking.guestName : booking.user?.fullName}
              </Grid>
              <Grid item xs={6}>
                <strong>{t('admin.dashboard.table.price')}:</strong>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
                {booking.totalPrice.toFixed(2)} €
              </Grid>
              <Grid item xs={6}>
                <strong>{t('admin.dashboard.table.date')}:</strong>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
              </Grid>
            </Grid>
          </Card>
        ))}
      </Box>
    </Box>
  );
};