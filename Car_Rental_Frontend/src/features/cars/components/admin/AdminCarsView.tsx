'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
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
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', py: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary', letterSpacing: '-0.5px' }}>
            {t('adminCars.list.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('adminCars.list.subtitle')}
          </Typography>
        </Box>
        <Tooltip title={t('adminCars.list.addBtn')}>
          <IconButton
            color="primary"
            component={Link}
            href="/admin/cars/add"
            sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', alignSelf: { xs: 'flex-end', sm: 'auto' } }}
          >
            <AddRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : cars.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>{t('common.noData')}</Alert>
      ) : (
        <Box>
          {/* ─── DESKTOP TABLE ───────────────────────────────────────── */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('adminCars.list.table.car')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('adminCars.list.table.plate')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('adminCars.list.table.price')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('adminCars.list.table.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>{t('adminCars.list.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cars.map((car) => (
                    <TableRow key={car.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            component="img"
                            src={car.primaryImageUrl || 'https://via.placeholder.com/96x64?text=Car'}
                            alt={`${car.model.brand.name} ${car.model.name}`}
                            sx={{ width: 72, height: 48, objectFit: 'cover', borderRadius: '6px', bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 750 }}>
                              {car.model.brand.name} {car.model.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {car.fuelType?.name || '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{car.plateNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {Number(car.basePrice).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={car.status}
                          size="small"
                          color={car.status === 'AVAILABLE' ? 'success' : 'default'}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title={t('adminCars.list.gallery')}>
                            <IconButton component={Link} href={`/admin/cars/${car.id}/gallery`} size="small">
                              <PhotoLibraryRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.edit')}>
                            <IconButton component={Link} href={`/admin/cars/${car.id}`} size="small">
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <span>
                              <IconButton
                                color="error"
                                size="small"
                                disabled={deletingId === car.id}
                                onClick={() => handleOpenDeleteDialog(car.id)}
                              >
                                {deletingId === car.id ? <CircularProgress size={18} /> : <DeleteRoundedIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>

          {/* ─── MOBILE CARDS ────────────────────────────────────────── */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
            {cars.map((car) => (
              <Card key={car.id} variant="outlined" sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                  <Box
                    component="img"
                    src={car.primaryImageUrl || 'https://via.placeholder.com/120x80?text=Car'}
                    alt={`${car.model.brand.name} ${car.model.name}`}
                    sx={{ width: 88, height: 64, objectFit: 'cover', borderRadius: '6px', border: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {car.model.brand.name} {car.model.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {car.fuelType?.name || '-'}
                    </Typography>
                  </Box>
                  <Chip
                    label={car.status}
                    size="small"
                    color={car.status === 'AVAILABLE' ? 'success' : 'default'}
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Grid container spacing={1} sx={{ fontSize: '13px', color: 'text.secondary', mb: 2 }}>
                  <Grid item xs={6}><strong>{t('adminCars.list.table.plate')}:</strong></Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'text.primary', fontWeight: 600 }}>
                    {car.plateNumber}
                  </Grid>
                  <Grid item xs={6}><strong>{t('adminCars.list.table.price')}:</strong></Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'primary.main' }}>
                    {Number(car.basePrice).toFixed(2)} €
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                  <Tooltip title={t('adminCars.list.gallery')}>
                    <IconButton component={Link} href={`/admin/cars/${car.id}/gallery`} size="small">
                      <PhotoLibraryRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.edit')}>
                    <IconButton component={Link} href={`/admin/cars/${car.id}`} size="small">
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.delete')}>
                    <span>
                      <IconButton
                        color="error"
                        size="small"
                        disabled={deletingId === car.id}
                        onClick={() => handleOpenDeleteDialog(car.id)}
                      >
                        {deletingId === car.id ? <CircularProgress size={18} /> : <DeleteRoundedIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        sx={{ '& .MuiDialog-paper': { borderRadius: '8px', p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('adminCars.list.deleteDialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '14px' }}>
            {t('adminCars.list.deleteDialog.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2 }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2 }}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
