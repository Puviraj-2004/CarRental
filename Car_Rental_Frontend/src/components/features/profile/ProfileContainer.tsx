'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Box, CircularProgress } from '@mui/material';
import { useProfile, UpdateProfileInput } from '@/hooks/useProfile';
import { useTranslation } from '@/lib/LanguageContext';
import { ProfileView } from './ProfileView';

export const ProfileContainer = () => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation();
  const { profile, loading, updating, updateProfile } = useProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileInput>({
    fullName: '', phoneNumber: '', dateOfBirth: '', fullAddress: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  /* Redirect unauthenticated users */
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/profile');
  }, [status, router]);

  /* Populate form when profile loads */
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        fullAddress: profile.fullAddress || '',
      });
    }
  }, [profile]);

  /* Handlers */
  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditing(false);
      setSnackbar({ open: true, message: t('profile.updateSuccess'), severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: t('profile.updateFailed'), severity: 'error' });
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        fullAddress: profile.fullAddress || '',
      });
    }
    setEditing(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  /* Loading state */
  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#0F172A' }} />
      </Box>
    );
  }

  return (
    <ProfileView
      profile={profile}
      editing={editing}
      form={form}
      updating={updating}
      snackbar={snackbar}
      onEdit={() => setEditing(true)}
      onCancelEdit={handleCancelEdit}
      onSave={handleSave}
      onFormChange={setForm}
      onLogout={handleLogout}
      onBack={() => router.back()}
      onNavigateBookings={() => router.push('/bookingRecords')}
      onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      t={t}
    />
  );
};
