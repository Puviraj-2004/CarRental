'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';

interface AdminBookingsViewProps {
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

export const AdminBookingsView: React.FC<AdminBookingsViewProps> = ({
  bookings,
  pageInfo,
  page,
  onPageChange,
  loading,
  error,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onStatusChange,
}) => {

  const renderStatusChip = (status: string) => {
    let bgcolor = '#f3f4f6';
    let color = '#4b5563';
    switch (status) {
      case 'RESERVED':
        bgcolor = '#fffbeb';
        color = '#d97706';
        break;
      case 'CONFIRMED':
        bgcolor = '#eff6ff';
        color = '#2563eb';
        break;
      case 'ONGOING':
        bgcolor = '#ecfdf5';
        color = '#059669';
        break;
      case 'COMPLETED':
        bgcolor = '#f3f4f6';
        color = '#1f2937';
        break;
      case 'CANCELLED':
      case 'REJECTED':
        bgcolor = '#fef2f2';
        color = '#dc2626';
        break;
    }
    return (
      <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '12px', fontSize: '11px', fontWeight: 700, bgcolor, color }}>
        {status}
      </Box>
    );
  };

  return (
    <Box sx={{ py: 2 }}>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          Fleet Bookings Queue
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage reservations, audit customer documents, and authorize key releases [1].
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Card variant="outlined" sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Plate, Customer Email, or ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Status dropdown strictly reflects active, pre-filtered queue states [1.1.2, 1.1.5] */}
            <TextField
              select
              fullWidth
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              variant="outlined"
              InputProps={{ sx: { borderRadius: '8px' } }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="RESERVED">RESERVED</MenuItem>
              <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
              <MenuItem value="ONGOING">ONGOING</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {loading && bookings.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : bookings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>No bookings match these parameters.</Alert>
      ) : (
        <Box>
          <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer / Driver</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((b) => {
                  const hasUploadedDocs = !!b.documents;
                  const isDocsApproved = b.documents?.status === 'APPROVED';

                  return (
                    <TableRow key={b.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {b.car.model.brand.name} {b.car.model.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                          {b.car.plateNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.guestName || b.user?.email}</Typography>
                        {b.guestPhone && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{b.guestPhone}</Typography>}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {new Date(b.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} - {new Date(b.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700 }}>
                          {b.numberOfDays} Days
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {Number(b.totalPrice).toFixed(2)} €
                      </TableCell>
                      <TableCell>{renderStatusChip(b.status)}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          
                          {hasUploadedDocs && (
                            <Button
                              component={Link}
                              href={`/admin/bookings/${b.id}/documents`}
                              variant="outlined"
                              size="small"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                            >
                              Review KYC
                            </Button>
                          )}

                          {b.status === 'CONFIRMED' && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={!isDocsApproved}
                              onClick={() => onStatusChange(b.id, 'ONGOING')}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                            >
                              Start Rental
                            </Button>
                          )}

                          {b.status === 'ONGOING' && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => onStatusChange(b.id, 'COMPLETED')}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                            >
                              Complete
                            </Button>
                          )}

                          {b.status === 'RESERVED' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => onStatusChange(b.id, 'CANCELLED')}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
                            >
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
                onChange={(_, p) => onPageChange(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};