'use client';

import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useToast } from '@/lib/ToastContext';

export default function ProfilePage() {
  const { showToast } = useToast();
  const {
    profile,
    loading,
    error,
    updating,
    changingPassword,
    updateProfile,
    changePassword,
  } = useProfile();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setPhoneNumber(profile?.phoneNumber ?? '');
  }, [profile?.phoneNumber]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({ phoneNumber });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile.', 'error');
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to change password.', 'error');
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">Unable to load your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account details, password, and saved verification status.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Account Details
            </Typography>
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Display name" value={profile?.fullName ?? ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" value={profile?.email ?? ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone number"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    fullWidth
                    placeholder="+94 77 123 4567"
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                disabled={updating}
                sx={{ mt: 3, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                {updating ? <CircularProgress size={20} color="inherit" /> : 'Save Profile'}
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Verification
            </Typography>
            {profile?.documents ? (
              <Box>
                <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '8px', bgcolor: 'grey.100', fontWeight: 800, fontSize: 12 }}>
                  {profile.documents.status}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  License: {profile.documents.licenseNumber || 'Not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {profile.documents.idNumber || 'Not provided'}
                </Typography>
              </Box>
            ) : (
              <Alert severity="info">No saved profile documents yet.</Alert>
            )}
          </Card>

          <Card variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Change Password
            </Typography>
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={changingPassword}
                sx={{ mt: 3, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                {changingPassword ? <CircularProgress size={20} /> : 'Update Password'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
