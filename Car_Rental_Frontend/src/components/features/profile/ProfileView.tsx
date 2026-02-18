'use client';

import React from 'react';
import {
  Box, Container, Typography, Stack, Paper, TextField, Button,
  Avatar, CircularProgress, Snackbar, Alert, IconButton,
  InputAdornment, Chip,
} from '@mui/material';
import {
  Person, Email, Phone, CalendarMonth, LocationOn,
  Edit, Save, Close, Logout, ArrowBack, CheckCircle,
  ListAlt, ChevronRight,
} from '@mui/icons-material';
import { UpdateProfileInput } from '@/hooks/useProfile';

/* ─── Types ─── */
interface ProfileViewProps {
  profile: {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    fullAddress: string | null;
    role: string;
  } | null;
  editing: boolean;
  form: UpdateProfileInput;
  updating: boolean;
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' };
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onFormChange: (form: UpdateProfileInput) => void;
  onLogout: () => void;
  onBack: () => void;
  onNavigateBookings: () => void;
  onSnackbarClose: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

/* ─── Reusable Info Row ─── */
const InfoRow = ({ icon, label, value, verified, t }: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  verified?: boolean;
  t: (key: string) => string;
}) => (
  <Box>
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
      {label}
    </Typography>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ color: '#94A3B8', display: 'flex' }}>{icon}</Box>
      <Typography variant="body1" fontWeight={600} color={value ? '#0F172A' : '#94A3B8'}>
        {value || t('profile.notProvided')}
      </Typography>
      {verified && value && (
        <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
      )}
    </Stack>
  </Box>
);

/* ─── Helpers ─── */
const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/* ─── Main View ─── */
export const ProfileView = ({
  profile, editing, form, updating, snackbar,
  onEdit, onCancelEdit, onSave, onFormChange, onLogout, onBack, onNavigateBookings, onSnackbarClose, t,
}: ProfileViewProps) => {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ pt: { xs: 3, md: 5 } }}>

        {/* Back Button — Desktop */}
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{
            mb: 3, fontWeight: 700, color: '#64748B', textTransform: 'none',
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          {t('common.back')}
        </Button>

        {/* Profile Header Card */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', mb: 3 }}
        >
          <Box
            sx={{
              height: 120,
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
            }}
          />
          <Box sx={{ px: 3, pb: 3, mt: -6 }}>
            <Avatar
              sx={{
                width: 80, height: 80, bgcolor: '#0F172A',
                border: '4px solid white', fontSize: '1.5rem', fontWeight: 900,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              {getInitials(profile?.fullName || null)}
            </Avatar>
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight={900} color="#0F172A">
                  {profile?.fullName || t('profile.noName')}
                </Typography>
                {profile?.role === 'ADMIN' && (
                  <Chip label={t('profile.admin')} size="small" sx={{ bgcolor: '#7C3AED', color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {profile?.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Info / Edit Card */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}
        >
          <Box
            sx={{
              px: 3, py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
              {t('profile.personalInfo')}
            </Typography>
            {!editing ? (
              <Button
                startIcon={<Edit />}
                onClick={onEdit}
                size="small"
                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
              >
                {t('common.edit')}
              </Button>
            ) : (
              <IconButton onClick={onCancelEdit} size="small" sx={{ color: '#64748B' }}>
                <Close />
              </IconButton>
            )}
          </Box>

          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Full Name */}
              {editing ? (
                <TextField
                  label={t('profile.fullName')}
                  value={form.fullName}
                  onChange={(e) => onFormChange({ ...form, fullName: e.target.value })}
                  fullWidth size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                />
              ) : (
                <InfoRow icon={<Person />} label={t('profile.fullName')} value={profile?.fullName} t={t} />
              )}

              {/* Email (always read-only) */}
              <InfoRow icon={<Email />} label={t('profile.email')} value={profile?.email} verified t={t} />

              {/* Phone */}
              {editing ? (
                <TextField
                  label={t('profile.phone')}
                  value={form.phoneNumber}
                  onChange={(e) => onFormChange({ ...form, phoneNumber: e.target.value })}
                  fullWidth size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                />
              ) : (
                <InfoRow icon={<Phone />} label={t('profile.phone')} value={profile?.phoneNumber} t={t} />
              )}

              {/* Date of Birth */}
              {editing ? (
                <TextField
                  label={t('profile.dateOfBirth')}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => onFormChange({ ...form, dateOfBirth: e.target.value })}
                  fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                />
              ) : (
                <InfoRow icon={<CalendarMonth />} label={t('profile.dateOfBirth')} value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null} t={t} />
              )}

              {/* Address */}
              {editing ? (
                <TextField
                  label={t('profile.address')}
                  value={form.fullAddress}
                  onChange={(e) => onFormChange({ ...form, fullAddress: e.target.value })}
                  fullWidth size="small" multiline rows={2}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                />
              ) : (
                <InfoRow icon={<LocationOn />} label={t('profile.address')} value={profile?.fullAddress} t={t} />
              )}
            </Stack>

            {/* Save / Cancel Buttons */}
            {editing && (
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="outlined" onClick={onCancelEdit} fullWidth
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 1.2 }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained" onClick={onSave} disabled={updating} fullWidth
                  startIcon={updating ? <CircularProgress size={18} color="inherit" /> : <Save />}
                  sx={{
                    borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 1.2,
                    bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  {updating ? t('profile.saving') : t('common.save')}
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>

        {/* My Bookings */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 4, border: '1px solid #E2E8F0', mt: 3, overflow: 'hidden' }}
        >
          <Button
            fullWidth startIcon={<ListAlt />} endIcon={<ChevronRight />}
            onClick={onNavigateBookings}
            sx={{
              py: 2, fontWeight: 700, color: '#0F172A', textTransform: 'none',
              justifyContent: 'flex-start', px: 3, '&:hover': { bgcolor: '#F1F5F9' },
              '& .MuiButton-endIcon': { ml: 'auto' },
            }}
          >
            {t('booking.myBookings')}
          </Button>
        </Paper>

        {/* Logout */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 4, border: '1px solid #E2E8F0', mt: 3, overflow: 'hidden' }}
        >
          <Button
            fullWidth startIcon={<Logout />} onClick={onLogout}
            sx={{
              py: 2, fontWeight: 700, color: '#DC2626', textTransform: 'none',
              justifyContent: 'flex-start', px: 3, '&:hover': { bgcolor: '#FEF2F2' },
            }}
          >
            {t('navigation.logout')}
          </Button>
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open} autoHideDuration={4000} onClose={onSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={onSnackbarClose} severity={snackbar.severity} variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
