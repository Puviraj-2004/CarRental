'use client';

import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Stack, TextField, InputAdornment,
  MenuItem, Button, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Search as SearchIcon, 
  CalendarMonth as DateIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { formatDateForDisplay } from '@/lib/dateUtils';

const statusStyles: any = {
  PENDING: { bg: '#FFF7ED', color: '#C2410C', labelKey: 'admin.actionRequired' },
  VERIFIED: { bg: '#F0F9FF', color: '#0369A1', labelKey: 'admin.identityVerified' },
  CONFIRMED: { bg: '#F0FDF4', color: '#15803D', labelKey: 'admin.confirmed' },
  ONGOING: { bg: '#F5F3FF', color: '#6D28D9', labelKey: 'admin.inTrip' },
  COMPLETED: { bg: '#F8FAFC', color: '#475569', labelKey: 'admin.completed' },
  CANCELLED: { bg: '#FEF2F2', color: '#991B1B', labelKey: 'admin.cancelled' },
  REJECTED: { bg: '#FEE2E2', color: '#DC2626', labelKey: 'admin.rejected' },
  EXPIRED: { bg: '#F1F5F9', color: '#64748B', labelKey: 'admin.expired' },
};

export const AdminBookingsView = ({ 
  bookings, onRowClick, searchQuery, setSearchQuery, 
  statusFilter, setStatusFilter, onCreateClick, viewLabel, t 
}: any) => {
  return (
    <Box sx={{ p: 4 }}>
      {/* Header & Actions */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">{t('admin.bookingRecords')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {viewLabel ? `${viewLabel} · ` : ''}{t('admin.visibleReservations', { count: String(bookings.length) })}
          </Typography>
        </Box>
        {/* Show New Booking button only for Onsite or Replacement views */}
        {!!viewLabel && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {t('admin.newBooking')}
          </Button>
        )}
      </Stack>

      {/* Filters Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField 
            size="small" 
            placeholder={t('admin.searchBookings')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} 
            sx={{ width: 350, bgcolor: 'white' }} 
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('admin.statusFilter')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('admin.statusFilter')}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">{t('admin.allStatuses')}</MenuItem>
              <MenuItem value="PENDING">{t('admin.pendingVerification')}</MenuItem>
              <MenuItem value="CONFIRMED">{t('admin.confirmed')}</MenuItem>
              <MenuItem value="ONGOING">{t('admin.ongoingTrip')}</MenuItem>
              <MenuItem value="COMPLETED">{t('admin.completed')}</MenuItem>
              <MenuItem value="CANCELLED">{t('admin.cancelled')}</MenuItem>
              <MenuItem value="REJECTED">{t('admin.rejected')}</MenuItem>
              <MenuItem value="EXPIRED">{t('admin.expired')}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{t('admin.refType')}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{t('admin.customer')}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{t('admin.vehicle')}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{t('admin.period')}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{t('admin.financials')}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{t('admin.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
               <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>{t('admin.noBookingsFound')}</TableCell></TableRow>
            ) : (
              bookings.map((b: any) => {
                const style = statusStyles[b.status] || { bg: '#f5f5f5', color: '#333' };
                const isCourtesy = b.bookingType === 'REPLACEMENT';
                const isWalkIn = b.isWalkIn;
                const displayName = b.guestName || b.user?.fullName || 'Guest';
                const displayContact = b.guestPhone || b.user?.email || b.guestEmail;
                
                return (
                  <TableRow key={b.id} hover onClick={() => onRowClick(b)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} fontFamily="monospace">#{b.id.slice(-6).toUpperCase()}</Typography>
                      <Stack direction="row" spacing={0.5} mt={0.5}>
                        {isCourtesy && <Chip label={t('admin.courtesy')} size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}
                        {isWalkIn && <Chip label={t('admin.walkIn')} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{displayName}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{displayContact}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{b.car?.model?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.car?.plateNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DateIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{formatDateForDisplay(b.startDate)}</Typography>
                          <Typography variant="caption" color="text.secondary">{b.pickupTime || '10:00'}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {isCourtesy ? (
                        <Typography variant="body2" fontWeight={700} color="text.secondary">{t('admin.free')}</Typography>
                      ) : (
                        <Typography variant="body2" fontWeight={800}>€{b.totalPrice?.toFixed(2)}</Typography>
                      )}
                    </TableCell>
                    <TableCell><Chip label={style.labelKey ? t(style.labelKey) : b.status} size="small" sx={{ fontWeight: 800, bgcolor: style.bg, color: style.color }} /></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};