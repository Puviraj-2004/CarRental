'use client';

import React, { useState } from 'react';
import { useAdminUsers, User } from '@/hooks/useAdminUsers';
import { useTranslation } from '@/lib/LanguageContext';
import { AdminUsersView } from './AdminUsersView';

export const AdminUsersContainer = () => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { 
    users, allUsers, filters, setFilters, 
    resetFilters, deleteUser, updateUserRole, loading, error 
  } = useAdminUsers();

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser({ variables: { id: userToDelete.id } });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setSnackbar({ open: true, message: t('containerMessages.userDeletedSuccess'), severity: 'success' });
    } catch (e: any) {
      setSnackbar({ 
        open: true, 
        message: e?.message || t('containerMessages.errorDeletingUser'), 
        severity: 'error' 
      });
    }
  };

  const handleRoleClick = (user: User) => {
    setUserToEdit(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!userToEdit) return;
    try {
      await updateUserRole({ variables: { id: userToEdit.id, role: newRole } });
      setRoleDialogOpen(false);
      setUserToEdit(null);
      setSnackbar({ open: true, message: t('containerMessages.roleUpdatedSuccess'), severity: 'success' });
    } catch (e: any) {
      setSnackbar({ 
        open: true, 
        message: e?.message || t('containerMessages.errorUpdatingRole'), 
        severity: 'error' 
      });
    }
  };

  if (error) return <div>{t('containerMessages.criticalErrorUsers')}</div>;

  return (
    <AdminUsersView
      users={users}
      totalCount={allUsers.length}
      filters={filters}
      setFilters={setFilters}
      resetFilters={resetFilters}
      loading={loading}
      // Delete dialog
      deleteDialogOpen={deleteDialogOpen}
      setDeleteDialogOpen={setDeleteDialogOpen}
      userToDelete={userToDelete}
      onDeleteClick={handleDeleteClick}
      confirmDelete={handleConfirmDelete}
      // Role dialog
      roleDialogOpen={roleDialogOpen}
      setRoleDialogOpen={setRoleDialogOpen}
      userToEdit={userToEdit}
      newRole={newRole}
      setNewRole={setNewRole}
      onRoleClick={handleRoleClick}
      confirmRoleChange={handleConfirmRoleChange}
      // Snackbar
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      t={t}
    />
  );
};
