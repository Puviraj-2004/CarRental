'use client';

import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useToast } from '@/lib/ToastContext';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const {
    users,
    pageInfo,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    loading,
    error,
    updateUserRole,
    deleteUser,
  } = useAdminUsers();

  const handleRoleChange = async (id: string, role: 'USER' | 'ADMIN') => {
    try {
      await updateUserRole(id, role);
      showToast('User role updated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update role.', 'error');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Delete ${email}? Users with active bookings cannot be deleted.`)) return;
    try {
      await deleteUser(id);
      showToast('User deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete user.', 'error');
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Users
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search customers, review verification status, and manage account roles.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="USER">Users</MenuItem>
              <MenuItem value="ADMIN">Admins</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>Unable to load users.</Alert>}

      {loading && users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info">No users match these filters.</Alert>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Verification</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Bookings</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.emailVerified ? 'Verified email' : 'Email pending'}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.phoneNumber || '-'}</TableCell>
                  <TableCell>{user.documents?.status || 'NONE'}</TableCell>
                  <TableCell>{user.bookings.length}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value as 'USER' | 'ADMIN')}
                    >
                      <MenuItem value="USER">USER</MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => handleDelete(user.id, user.email)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {pageInfo?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageInfo.totalPages}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
