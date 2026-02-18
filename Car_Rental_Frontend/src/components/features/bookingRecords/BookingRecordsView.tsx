'use client';

import React from 'react';
import {
  Box, Container, Typography, Stack, Chip, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, 
  CircularProgress, Snackbar, Alert, Dialog, DialogContent, 
  DialogTitle, Divider, Grid, TextField, IconButton, Card, CardActionArea, Tooltip
} from '@mui/material';
import {
  ContentCopy as CopyIcon, Close as CloseIcon, OpenInNew as OpenIcon,
  Edit as EditIcon, DeleteForever as CancelIcon, CalendarMonth as DateIcon,
  ChevronRight as ChevronRightIcon, AccountBalanceWallet as WalletIcon,
  VerifiedUser as VerifiedIcon, InfoOutlined as InfoIcon ,CarRental as CarIcon
} from '@mui/icons-material';
import QRCode from 'react-qr-code';

// 🛠️ HELPER: Safe Date Formatter (Industrial Standard)
const formatSecureDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(d);
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', labelKey: 'booking.statusConfirmed' };
    case 'CANCELLED': return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', labelKey: 'booking.statusCancelled' };
    case 'REJECTED': return { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA', labelKey: 'booking.statusRejected' };
    case 'EXPIRED': return { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0', labelKey: 'booking.statusExpired' };
    case 'PENDING': return { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', labelKey: 'booking.statusActionRequired' };
    case 'VERIFIED': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', labelKey: 'booking.statusVerifiedPayNow' };
    case 'ONGOING': return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', labelKey: 'booking.statusActiveTrip' };
    case 'COMPLETED': return { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0', labelKey: 'booking.statusCompleted' };
    default: return { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', labelKey: '' };
  }
};

export const BookingRecordsView = ({
  bookings, loading, onRowClick, detailsOpen, setDetailsOpen, selectedBooking,
  copySnack, setCopySnack, onCopyLink, onCancel, onEdit, onPay, cancelLoading,
  t
}: any) => {

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#0F172A' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh',  pb: 10 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5, px: { xs: 1, md: 0 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}>
              {t('booking.bookingHistory')}
            </Typography>
            <Typography variant="body1" color="text.secondary">{t('booking.manageReservations')}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: { xs: 2, md: 0 }, fontWeight: 700, borderRadius: 2 }}
            href="/cars"
          >
            {t('booking.newBooking')}
          </Button>
        </Box>

        {/* 💻 DESKTOP VIEW: Professional Data Table */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2.5 }}>{t('booking.vehicle')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>{t('booking.bookingId')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>{t('booking.price')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>{t('booking.pickupDate')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>{t('status.status') || t('booking.statusLabel')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking: any) => {
                    const style = getStatusStyles(booking.status);
                    return (
                      <TableRow 
                        key={booking.id} 
                        hover 
                        onClick={() => onRowClick(booking)} 
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ width: 64, height: 40, bgcolor: '#F1F5F9', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                               <img src={booking.car?.images?.[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="car" />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={800} color="#0F172A">{booking.car?.brand?.name} {booking.car?.model?.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{booking.car?.plateNumber}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600} color="#475569" sx={{ fontFamily: 'monospace' }}>#{booking.id.slice(-6).toUpperCase()}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={800} color="#0F172A">€{booking.totalPrice?.toFixed(2)}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#0F172A">{formatSecureDate(booking.startDate)}</Typography>
                          <Typography variant="caption" color="text.secondary">{booking.pickupTime || '10:00 AM'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t(style.labelKey) || status} 
                            size="small" 
                            sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}`, borderRadius: 1.5 }} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* 📱 MOBILE VIEW: Premium List Cards */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2.5}>
            {bookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: '1px solid #E2E8F0' }}>
                <CarIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography color="text.secondary" fontWeight={600}>{t('booking.noBookingHistory')}</Typography>
              </Box>
            ) : (
              bookings.map((booking: any) => {
                const style = getStatusStyles(booking.status);
                return (
                  <Card 
                    key={booking.id} 
                    elevation={0}
                    onClick={() => onRowClick(booking)}
                    sx={{ borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}
                  >
                    <CardActionArea sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 80, height: 55, bgcolor: '#F8FAFC', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F5F9' }}>
                           <img src={booking.car?.images?.[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="car" />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">{booking.car?.brand?.name} {booking.car?.model?.name}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace' }}>#{booking.id.slice(-6).toUpperCase()}</Typography>
                          <Typography variant="subtitle2" fontWeight={900} color="primary.main">€{booking.totalPrice?.toFixed(2)}</Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: '#CBD5E1' }} />
                      </Stack>
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <DateIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography variant="caption" fontWeight={700} color="#475569">{formatSecureDate(booking.startDate)}</Typography>
                        </Stack>
                        <Chip label={t(style.labelKey) || booking.status} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', bgcolor: style.bg, color: style.color, height: 22 }} />
                      </Stack>
                    </CardActionArea>
                  </Card>
                );
              })
            )}
          </Stack>
        </Box>
      </Container>

      {/* 🚀 DYNAMIC CONTROL MODAL */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 6 }, m: { xs: 0, sm: 2 } } }}
      >
        {selectedBooking && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2.5, md: 4 }, borderBottom: '1px solid #F1F5F9' }}>
              <Box>
                <Typography variant="h6" fontWeight={900} component="div" color="#0F172A">{t('booking.bookingOverview')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('booking.reference')}: #{selectedBooking.id.toUpperCase()}</Typography>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ bgcolor: '#F1F5F9' }}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: { xs: 3, md: 5 }, bgcolor: '#F8FAFC' }}>
              
              {/* PENDING: Action Required UI */}
              {selectedBooking.status === 'PENDING' && (
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, mb: 5, border: '2px solid #7C3AED', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.2)' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                    <VerifiedIcon sx={{ color: '#7C3AED' }} />
                    <Typography variant="subtitle1" fontWeight={900} color="#7C3AED">{t('booking.step2Verification')}</Typography>
                  </Stack>
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                       <Box sx={{ p: 2, bgcolor: 'white', border: '1px solid #F1F5F9', borderRadius: 4, display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                          <QRCode value={`${window.location.origin}/verification/${selectedBooking.verification?.token}`} size={140} />
                       </Box>
                       <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#64748B', fontWeight: 600 }}>{t('booking.scanSmartphone')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2.5}>
                        <TextField fullWidth size="small" label={t('booking.magicLink')} value={`${window.location.origin}/verification/${selectedBooking.verification?.token}`} InputProps={{ readOnly: true, sx: { borderRadius: 2, bgcolor: '#F8FAFC', fontSize: '0.8rem', fontFamily: 'monospace' }, endAdornment: <IconButton onClick={() => onCopyLink(selectedBooking.verification?.token)}><CopyIcon fontSize="small"/></IconButton> }} />
                        <Button fullWidth variant="contained" startIcon={<OpenIcon />} onClick={() => window.open(`${window.location.origin}/verification/${selectedBooking.verification?.token}`, '_blank')} sx={{ bgcolor: '#7C3AED', py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#6D28D9' } }}>{t('booking.openVerificationPage')}</Button>
                        <Stack direction="row" spacing={2}>
                          <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(selectedBooking.id)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, borderColor: '#E2E8F0', color: '#0F172A' }}>{t('booking.modifyDates')}</Button>
                          {
                            (() => {
                              const status = selectedBooking?.status;
                              const cannotCancel = ['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(status);
                              
                              if (cannotCancel) {
                                return (
                                  <Tooltip title={t('booking.cannotCancelTooltip')}>
                                    <span style={{ display: 'block', width: '100%' }}>
                                      <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }} disabled>
                                        {t('common.cancel')}
                                      </Button>
                                    </span>
                                  </Tooltip>
                                );
                              }

                              if (status === 'PENDING' || status === 'VERIFIED') {
                                return (
                                  <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => onCancel(selectedBooking.id)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                                    {t('common.cancel')}
                                  </Button>
                                );
                              }

                              if (status === 'ONGOING') {
                                return (
                                  <Tooltip title={t('booking.onlyAdminCancel')}>
                                    <span style={{ display: 'block', width: '100%' }}>
                                      <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }} disabled>
                                        {t('common.cancel')}
                                      </Button>
                                    </span>
                                  </Tooltip>
                                );
                              }

                              if (status === 'CONFIRMED') {
                                let userCanCancel = true;
                                try {
                                  let pickupDt = new Date(selectedBooking.startDate);
                                  if (selectedBooking.pickupTime) {
                                    const datePart = new Date(selectedBooking.startDate).toISOString().split('T')[0];
                                    pickupDt = new Date(`${datePart}T${selectedBooking.pickupTime}:00`);
                                  }
                                  const cutoff = new Date(pickupDt.getTime() - 24 * 60 * 60 * 1000);
                                  userCanCancel = Date.now() <= cutoff.getTime();
                                } catch (e) {
                                  userCanCancel = true;
                                }

                                return (
                                  <Tooltip title={!userCanCancel ? t('booking.cancellationWindowClosed') : ''}>
                                    <span style={{ display: 'block', width: '100%' }}>
                                      <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => onCancel(selectedBooking.id)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }} disabled={!userCanCancel}>
                                        {t('common.cancel')}
                                      </Button>
                                    </span>
                                  </Tooltip>
                                );
                              }

                              return (
                                <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => onCancel(selectedBooking.id)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                                  {t('common.cancel')}
                                </Button>
                              );
                            })()
                          }
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* SHARED INFO: Vehicle & Schedule */}
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>{t('booking.vehicleDetails')}</Typography>
                  <Paper elevation={0} sx={{ p: 2, mt: 1.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 100, height: 65, bgcolor: '#F8FAFC', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <img src={selectedBooking.car?.images?.[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="car" />
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight={800} color="#0F172A">{selectedBooking.car?.brand?.name} {selectedBooking.car?.model?.name}</Typography>
                        <Chip label={selectedBooking.car?.plateNumber} size="small" sx={{ mt: 0.5, fontWeight: 700, height: 20, fontSize: '0.65rem', bgcolor: '#F1F5F9', color: '#475569' }} />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>{t('booking.tripSchedule')}</Typography>
                  <Paper elevation={0} sx={{ p: 2, mt: 1.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{t('booking.pickupLabel')}</Typography>
                        <Typography variant="body2" fontWeight={700}>{formatSecureDate(selectedBooking.startDate)} • {selectedBooking.pickupTime || '10:00 AM'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{t('booking.returnLabel')}</Typography>
                        <Typography variant="body2" fontWeight={700}>{formatSecureDate(selectedBooking.endDate)} • {selectedBooking.returnTime || '10:00 AM'}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              {/* PAYMENT & STATUS SUMMARY */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                   <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1 }}>{t('booking.rentalTotal')}</Typography>
                   <Typography variant="h4" fontWeight={1000} color="primary.main">€{selectedBooking.totalPrice?.toFixed(2)}</Typography>
                   {selectedBooking.depositAmount > 0 && (
                     <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                       + €{selectedBooking.depositAmount?.toFixed(2)} {t('booking.securityDeposit')}
                     </Typography>
                   )}
                </Box>
                <Stack alignItems="flex-end">
                   <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1 }}>{t('booking.statusLabel')}</Typography>
                   <Chip 
                    label={t(getStatusStyles(selectedBooking.status).labelKey) || selectedBooking.status} 
                    size="small" 
                    sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: getStatusStyles(selectedBooking.status).bg, color: getStatusStyles(selectedBooking.status).color, border: `1px solid ${getStatusStyles(selectedBooking.status).border}`, borderRadius: 1.5 }} 
                   />
                </Stack>
              </Box>

              {/* VERIFIED: Pay Now CTA */}
              {selectedBooking.status === 'VERIFIED' && selectedBooking.payment?.status !== 'SUCCEEDED' && (
                <Paper elevation={0} sx={{ mt: 4, p: 3, borderRadius: 4, bgcolor: '#F0F9FF', border: '1px solid #0EA5E9', textAlign: 'center' }}>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="body1" fontWeight={700} color="#0369A1">{t('booking.identityVerifiedSuccess')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('booking.reservationHeldPayment')}</Typography>
                    <Button fullWidth variant="contained" onClick={() => onPay(selectedBooking.id)} startIcon={<WalletIcon />} sx={{ mt: 1, py: 2, borderRadius: 3, fontWeight: 900, bgcolor: '#0F172A', fontSize: '1.1rem', textTransform: 'none', '&:hover': { bgcolor: '#1E293B' } }}>{t('booking.completePaymentNow')}</Button>
                  </Stack>
                </Paper>
              )}

              {selectedBooking.status === 'CANCELLED' && (
                <Alert severity="error" icon={<InfoIcon />} sx={{ mt: 4, borderRadius: 3, fontWeight: 600 }}>{t('booking.bookingCancelledAlert')}</Alert>
              )}
              {selectedBooking.status === 'REJECTED' && (
                <Alert severity="error" icon={<InfoIcon />} sx={{ mt: 4, borderRadius: 3, fontWeight: 600 }}>{t('booking.bookingRejectedAlert')}</Alert>
              )}
              {selectedBooking.status === 'EXPIRED' && (
                <Alert severity="warning" icon={<InfoIcon />} sx={{ mt: 4, borderRadius: 3, fontWeight: 600 }}>{t('booking.bookingExpiredAlert')}</Alert>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar open={copySnack} autoHideDuration={2500} onClose={() => setCopySnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>{t('booking.verificationLinkCopied')}</Alert>
      </Snackbar>
    </Box>
  );
};