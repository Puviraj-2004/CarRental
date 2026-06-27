'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';

interface SetupEntity {
  id: string;
  name: string;
  [key: string]: any;
}

interface SetupManagementProps {
  title: string;
  entityType: 'brand' | 'model' | 'fuelType' | 'paymentMethod';
  getQuery: any;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  brands?: SetupEntity[];
}

export const SetupManagementView: React.FC<SetupManagementProps> = ({
  title,
  entityType,
  getQuery,
  createMutation,
  updateMutation,
  deleteMutation,
  brands,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', brandId: '' });
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { data, loading, refetch } = useQuery(getQuery);

  // Mutations
  const [createItem, { loading: createLoading }] = useMutation(createMutation, {
    onCompleted: () => {
      setOpenDialog(false);
      setFormData({ name: '', brandId: '' });
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [updateItem, { loading: updateLoading }] = useMutation(updateMutation, {
    onCompleted: () => {
      setOpenDialog(false);
      setFormData({ name: '', brandId: '' });
      setEditingId(null);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteItem, { loading: deleteLoading }] = useMutation(deleteMutation, {
    onCompleted: () => refetch(),
    onError: (err) => setError(err.message),
  });

  const handleOpenDialog = (item?: SetupEntity) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        brandId: entityType === 'model' ? item.brand?.id || '' : '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', brandId: '' });
    }
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: '', brandId: '' });
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (entityType === 'model' && !formData.brandId) {
      setError('Brand is required');
      return;
    }

    try {
      if (editingId) {
        const variables: any = { id: editingId, name: formData.name };
        if (entityType === 'model') variables.brandId = formData.brandId;
        await updateItem({ variables });
      } else {
        const variables: any = { name: formData.name };
        if (entityType === 'model') variables.brandId = formData.brandId;
        await createItem({ variables });
      }
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${entityType}?`)) {
      try {
        await deleteItem({ variables: { id } });
      } catch (err) {
        // Error is handled by onError callback
      }
    }
  };

  const getEntityList = (): SetupEntity[] => {
    if (entityType === 'brand') return data?.brands || [];
    if (entityType === 'model') return data?.models || [];
    if (entityType === 'fuelType') return data?.fuelTypes || [];
    if (entityType === 'paymentMethod') return data?.paymentMethods || [];
    return [];
  };

  const entities = getEntityList();

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage {title.toLowerCase()} for your vehicle rental system.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'grey.200' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {entityType === 'brand' && 'Brands'}
            {entityType === 'model' && 'Models'}
            {entityType === 'fuelType' && 'Fuel Types'}
            {entityType === 'paymentMethod' && 'Payment Methods'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
          >
            Add New
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : entities.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body1">No {title.toLowerCase()} found. Create one to get started.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Name</TableCell>
                  {entityType === 'model' && <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Brand</TableCell>}
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary', width: 120 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entities.map((entity) => (
                  <TableRow key={entity.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{entity.name}</TableCell>
                    {entityType === 'model' && <TableCell>{entity.brand?.name || '-'}</TableCell>}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(entity)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(entity.id)}
                        disabled={deleteLoading}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Edit' : 'Add New'} {entityType === 'brand' && 'Brand'}
          {entityType === 'model' && 'Model'}
          {entityType === 'fuelType' && 'Fuel Type'}
          {entityType === 'paymentMethod' && 'Payment Method'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            variant="outlined"
          />

          {entityType === 'model' && brands && brands.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                label="Brand"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={createLoading || updateLoading}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
