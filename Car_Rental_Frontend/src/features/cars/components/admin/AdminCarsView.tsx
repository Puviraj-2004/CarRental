'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from 'next/link';
import type { Car } from '../../hooks/useCar';

interface AdminCarsViewProps {
  t: (path: string) => string;
  cars: Car[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export const AdminCarsView: React.FC<AdminCarsViewProps> = ({
  t,
  cars,
  loading,
  error,
  onDelete,
  deletingId,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetCarId, setTargetCarId] = useState<string | null>(null);

  const handleOpenDeleteDialog = (id: string) => {
    setTargetCarId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setTargetCarId(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (targetCarId) {
      onDelete(targetCarId);
    }
    handleCloseDeleteDialog();
  };

  return (
    <Box>
      {/* ─── Header & Add New Car Button ───────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            {t('adminCars.list.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('adminCars.list.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          component={Link}
          href="/admin/cars/add"
          sx={{ fontWeight: 700, textTransform: 'none', px: 3, py: 1.2, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          + {t('adminCars.list.addBtn')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : cars.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>{t('common.noData')}</Alert>
      ) : (
        <Box>
          {/* ─── DESKTOP DATA TABLE ───────────────────────────────────────── */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{t('adminCars.list.table.car')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('adminCars.list.table.plate')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('adminCars.list.table.price')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('adminCars.list.table.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>{t('adminCars.list.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cars.map((car) => (
                    <TableRow key={car.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {car.model.brand.name} {car.model.name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{car.plateNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{car.basePrice.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            bgcolor: car.status === 'AVAILABLE' ? 'success.light' : 'error.light',
                            color: car.status === 'AVAILABLE' ? 'success.dark' : 'error.dark',
                          }}
                        >
                          {car.status}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          component={Link}
                          href={`/admin/cars/${car.id}`}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={deletingId === car.id}
                          onClick={() => handleOpenDeleteDialog(car.id)} // Desktop modal trigger
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {deletingId === car.id ? <CircularProgress size={16} color="inherit" /> : t('common.delete')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>

          {/* ─── MOBILE CARDS LIST ────────────────────────────────────────── */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
            {cars.map((car) => (
              <Card key={car.id} sx={{ p: 2, borderRadius: '12px', border: 1, borderColor: 'grey.100', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {car.model.brand.name} {car.model.name}
                  </Typography>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      bgcolor: car.status === 'AVAILABLE' ? 'success.light' : 'error.light',
                      color: car.status === 'AVAILABLE' ? 'success.dark' : 'error.dark',
                    }}
                  >
                    {car.status}
                  </Box>
                </Box>

                <Grid container spacing={1} sx={{ fontSize: '13px', color: 'text.secondary', mb: 2 }}>
                  <Grid item xs={6}><strong>{t('adminCars.list.table.plate')}:</strong></Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'text.primary' }}>
                    {car.plateNumber}
                  </Grid>
                  <Grid item xs={6}><strong>{t('adminCars.list.table.price')}:</strong></Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
                    {car.basePrice.toFixed(2)} €
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    href={`/admin/cars/${car.id}`}
                    variant="outlined"
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    disabled={deletingId === car.id}
                    onClick={() => handleOpenDeleteDialog(car.id)} // Mobile modal trigger (Fixed!)
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {deletingId === car.id ? <CircularProgress size={16} /> : t('common.delete')}
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* ─── MUI DELETE CONFIRMATION DIALOG ─────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', p: 1 } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700 }}>
          {t('adminCars.list.deleteDialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: 'text.secondary' }}>
            {t('adminCars.list.deleteDialog.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};