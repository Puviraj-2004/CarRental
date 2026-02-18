'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, 
  Chip, Stack, Avatar, LinearProgress, TextField,
  MenuItem, Select, FormControl, InputLabel, InputAdornment,
  Snackbar, Alert, Button
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { User, AdminUsersFilter } from '@/hooks/useAdminUsers';

// Dynamically import Dialog to reduce bundle size
const Dialog = dynamic(() => import('@mui/material/Dialog'), { ssr: false });
const DialogTitle = dynamic(() => import('@mui/material/DialogTitle'), { ssr: false });
const DialogContent = dynamic(() => import('@mui/material/DialogContent'), { ssr: false });
const DialogActions = dynamic(() => import('@mui/material/DialogActions'), { ssr: false });

interface AdminUsersViewProps {
  users: User[];
  totalCount: number;
  filters: AdminUsersFilter;
  setFilters: (filters: AdminUsersFilter) => void;
  resetFilters: () => void;
  loading: boolean;
  // Delete dialog
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  userToDelete: User | null;
  onDeleteClick: (user: User) => void;
  confirmDelete: () => void;
  // Role dialog
  roleDialogOpen: boolean;
  setRoleDialogOpen: (open: boolean) => void;
  userToEdit: User | null;
  newRole: 'USER' | 'ADMIN';
  setNewRole: (role: 'USER' | 'ADMIN') => void;
  onRoleClick: (user: User) => void;
  confirmRoleChange: () => void;
  // Snackbar
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' };
  setSnackbar: (snackbar: { open: boolean; message: string; severity: 'success' | 'error' }) => void;
  // Translation
  t: (key: string, params?: Record<string, string>) => string;
}

export const AdminUsersView = ({
  users, totalCount, filters, setFilters, resetFilters, loading,
  deleteDialogOpen, setDeleteDialogOpen, userToDelete, onDeleteClick, confirmDelete,
  roleDialogOpen, setRoleDialogOpen, userToEdit, newRole, setNewRole, onRoleClick, confirmRoleChange,
  snackbar, setSnackbar, t
}: AdminUsersViewProps) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const hasActiveFilters = filters.search || filters.role;

  return (
    <Box sx={{ pb: 5 }}>
      {/* 🔝 HEADER SECTION */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2} 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">{t('admin.userManagement')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('adminUsers.manageCount', { count: String(totalCount) })}
          </Typography>
        </Box>
      </Stack>

      {/* 🔍 FILTERS SECTION */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid #E2E8F0', 
          borderRadius: 3,
          bgcolor: 'white'
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder={t('admin.searchUsers')}
            size="small"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ minWidth: 300, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('admin.role')}</InputLabel>
            <Select
              value={filters.role}
              label={t('admin.role')}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <MenuItem value="">{t('admin.allRoles')}</MenuItem>
              <MenuItem value="USER">{t('admin.user')}</MenuItem>
              <MenuItem value="ADMIN">{t('adminUsers.adminRole')}</MenuItem>
            </Select>
          </FormControl>
          {hasActiveFilters && (
            <Button 
              startIcon={<ClearIcon />} 
              onClick={resetFilters}
              sx={{ color: '#64748B' }}
            >
              {t('admin.clear')}
            </Button>
          )}
        </Stack>
      </Paper>

      {/* 📊 TABLE */}
      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid #E2E8F0', 
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {loading && <LinearProgress sx={{ height: 2 }} />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('admin.user')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('admin.contact')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('admin.role')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('admin.joined')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>{t('admin.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <PersonIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                    <Typography color="text.secondary">
                      {hasActiveFilters ? t('admin.noUsersMatch') : t('admin.noUsersFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: user.role === 'ADMIN' ? '#0F172A' : '#E2E8F0',
                            color: user.role === 'ADMIN' ? 'white' : '#64748B',
                            width: 40,
                            height: 40
                          }}
                        >
                          {user.fullName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} color="#0F172A">
                            {user.fullName || t('admin.noName')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#475569">
                        {user.phoneNumber || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.role === 'ADMIN' ? <AdminIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
                        label={user.role}
                        size="small"
                        sx={{
                          bgcolor: user.role === 'ADMIN' ? '#0F172A' : '#F1F5F9',
                          color: user.role === 'ADMIN' ? 'white' : '#475569',
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: user.role === 'ADMIN' ? 'white' : '#475569'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#475569">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          onClick={() => onRoleClick(user)}
                          sx={{ 
                            color: '#64748B',
                            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
                          }}
                          title={t('adminUsers.changeRole')}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onDeleteClick(user)}
                          sx={{ 
                            color: '#64748B',
                            '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' }
                          }}
                          title={t('adminUsers.deleteUser')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Showing count */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="body2" color="text.secondary">
            {t('adminUsers.showingCount', { shown: String(users.length), total: String(totalCount) })}
          </Typography>
        </Box>
      </Paper>

      {/* 🗑️ DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('admin.deleteUser')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.areYouSureDelete')} <b>{userToDelete?.fullName || userToDelete?.email}</b>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {t('admin.cannotBeUndone')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#64748B' }}>
            {t('admin.cancel')}
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            sx={{ borderRadius: 2 }}
          >
            {t('admin.deleteUser')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔄 ROLE CHANGE DIALOG */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('admin.changeUserRole')}</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <Typography sx={{ mb: 2 }}>
            {t('admin.changeUserRole')}: <b>{userToEdit?.fullName || userToEdit?.email}</b>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{t('admin.role')}</InputLabel>
            <Select
              value={newRole}
              label={t('admin.role')}
              onChange={(e) => setNewRole(e.target.value as 'USER' | 'ADMIN')}
            >
              <MenuItem value="USER">
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon fontSize="small" />
                  <span>{t('admin.user')}</span>
                </Stack>
              </MenuItem>
              <MenuItem value="ADMIN">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AdminIcon fontSize="small" />
                  <span>{t('adminUsers.adminRole')}</span>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ color: '#64748B' }}>
            {t('admin.cancel')}
          </Button>
          <Button 
            onClick={confirmRoleChange} 
            variant="contained"
            sx={{ bgcolor: '#0F172A', borderRadius: 2, '&:hover': { bgcolor: '#1E293B' } }}
          >
            {t('admin.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📢 SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
