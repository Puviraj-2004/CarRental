'use client';

import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface AdminBookingsViewProps {
  title: string;
  subtitle: string;
  lane?: 'ONLINE' | 'ONSITE' | 'COURTESY';
  createHref?: string;
  createLabel?: string;
  bookings: any[];
  pageInfo?: any;
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const renderStatusChip = (status: string) => {
  let bgcolor = '#f3f4f6';
  let color = '#4b5563';

  if (status === 'RESERVED') {
    bgcolor = '#fffbeb';
    color = '#d97706';
  } else if (status === 'CONFIRMED') {
    bgcolor = '#eff6ff';
    color = '#2563eb';
  } else if (status === 'ONGOING' || status === 'COMPLETED') {
    bgcolor = '#ecfdf5';
    color = '#059669';
  } else if (status === 'EXPIRED' || status === 'CANCELLED' || status === 'REJECTED') {
    bgcolor = '#fef2f2';
    color = '#dc2626';
  }

  return (
    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '8px', fontSize: 11, fontWeight: 800, bgcolor, color }}>
      {status}
    </Box>
  );
};

export const AdminBookingsView: React.FC<AdminBookingsViewProps> = ({
  title,
  subtitle,
  createHref,
  createLabel,
  bookings,
  pageInfo,
  onPageChange,
  loading,
  error,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onStatusChange,
}) => {
  const [startBookingId, setStartBookingId] = React.useState<string | null>(null);

  const handleConfirmStart = () => {
    if (!startBookingId) return;
    onStatusChange(startBookingId, 'ONGOING');
    setStartBookingId(null);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>
        {createHref && createLabel && (
          <Button component={Link} href={createHref} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}>
            {createLabel}
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Card variant="outlined" sx={{ p: 3, mb: 4, borderRadius: '8px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by plate, customer, phone, email, or booking ID"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              variant="outlined"
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="RESERVED">RESERVED</MenuItem>
              <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
              <MenuItem value="ONGOING">ONGOING</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="EXPIRED">EXPIRED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {loading && bookings.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '8px' }}>No bookings match these parameters.</Alert>
      ) : (
        <Box>
          <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer / Driver</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => {
                  const isCourtesy = booking.type === 'COURTESY';
                  const isOnsite = booking.type === 'RENTAL' && !booking.user?.id;
                  const hasUploadedDocs = !!booking.documents;
                  const isDocsApproved = booking.documents?.status === 'APPROVED';
                  const isPaymentPaid = booking.payment?.status === 'PAID';
                  const hasContact = !!(booking.guestName && booking.guestPhone);
                  const isReadyToProgress = isCourtesy || (
                    booking.type === 'RENTAL' &&
                    (isOnsite ? hasContact && isDocsApproved && isPaymentPaid : isDocsApproved)
                  );

                  return (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {booking.car.model.brand.name} {booking.car.model.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                          {booking.car.plateNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700 }}>
                          {isCourtesy ? 'Courtesy booking' : isOnsite ? 'Onsite rental' : 'Online booking'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {booking.guestName || booking.user?.email || 'Customer'}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {booking.guestPhone || booking.user?.email || 'No contact'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>
                        {new Date(booking.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} - {new Date(booking.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700 }}>
                          {booking.numberOfDays} Days
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: isCourtesy ? 'text.secondary' : 'primary.main' }}>
                        {isCourtesy ? 'No payment required' : `${Number(booking.totalPrice).toFixed(2)} EUR`}
                        {!isCourtesy && (
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                            {booking.payment?.status || 'NO PAYMENT'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{renderStatusChip(booking.status)}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Button component={Link} href={`/admin/bookings/${booking.id}`} variant="text" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                            Details
                          </Button>

                          {hasUploadedDocs && !isCourtesy && (
                            <Button
                              component={Link}
                              href={`/admin/bookings/${booking.id}/documents`}
                              variant="outlined"
                              size="small"
                              disabled={booking.status === 'CANCELLED'}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Review KYC
                            </Button>
                          )}

                          {booking.status === 'RESERVED' && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={!isReadyToProgress}
                              onClick={() => onStatusChange(booking.id, 'CONFIRMED')}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Confirm
                            </Button>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={!isReadyToProgress}
                              onClick={() => setStartBookingId(booking.id)}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Start
                            </Button>
                          )}

                          {booking.status === 'ONGOING' && (
                            <Button variant="contained" color="success" size="small" onClick={() => onStatusChange(booking.id, 'COMPLETED')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                              Complete
                            </Button>
                          )}

                          {booking.status === 'RESERVED' && (
                            <Button variant="outlined" color="error" size="small" onClick={() => onStatusChange(booking.id, 'CANCELLED')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          {pageInfo && pageInfo.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageInfo.totalPages}
                page={pageInfo.currentPage}
                onChange={(_, nextPage) => onPageChange(nextPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      )}
      <Dialog open={!!startBookingId} onClose={() => setStartBookingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Start trip</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Do you want to start this trip?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStartBookingId(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            No
          </Button>
          <Button variant="contained" onClick={handleConfirmStart} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Yes, Start
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
