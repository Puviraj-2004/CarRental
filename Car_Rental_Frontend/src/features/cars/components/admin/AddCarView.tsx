'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

interface AddCarViewProps {
  t: (path: string) => string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  success: boolean;
  loading: boolean;
  brands: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string; brand: { id: string } }>;
  fuelTypes: Array<{ id: string; name: string }>;
  primaryFile: File | null;
  setPrimaryFile: (file: File | null) => void;
}

export const AddCarView: React.FC<AddCarViewProps> = ({
  t,
  onSubmit,
  error,
  success,
  loading,
  brands,
  models,
  fuelTypes,
  primaryFile,
  setPrimaryFile,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!primaryFile) {
      setPrimaryPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(primaryFile);
    setPrimaryPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [primaryFile]);

  const filteredModels = models.filter((m) => m.brand.id === selectedBrandId);

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrimaryFile(e.target.files[0]);
    }
  };

  const handleRemovePrimary = () => {
    setPrimaryFile(null);
    if (primaryInputRef.current) {
      primaryInputRef.current.value = '';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          {t('adminCars.add.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {t('adminCars.add.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{t('adminCars.add.success')}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('cars.catalog.filters.brand')}
                </FormLabel>
                <TextField
                  select
                  required
                  value={selectedBrandId}
                  disabled={loading}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                >
                  <MenuItem value="">{t('cars.catalog.filters.allBrands')}</MenuItem>
                  {brands.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('cars.catalog.filters.model')}
                </FormLabel>
                <TextField
                  select
                  name="modelId"
                  required
                  disabled={!selectedBrandId || loading}
                  defaultValue=""
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                >
                  <MenuItem value="">{t('cars.catalog.filters.allModels')}</MenuItem>
                  {filteredModels.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('adminCars.add.plateNumber')}
                </FormLabel>
                <TextField
                  name="plateNumber"
                  required
                  disabled={loading}
                  placeholder="AA-123-AA"
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('adminCars.add.fuelType')}
                </FormLabel>
                <TextField
                  select
                  name="fuelTypeId"
                  disabled={loading}
                  defaultValue=""
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                >
                  <MenuItem value="">{t('cars.catalog.filters.allFuels')}</MenuItem>
                  {fuelTypes.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('adminCars.add.basePrice')}
                </FormLabel>
                <TextField
                  name="basePrice"
                  type="number"
                  disabled={loading}
                  inputProps={{ step: '0.01', min: '0.01' }}
                  placeholder="49.99"
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('adminCars.add.status')}
                </FormLabel>
                <TextField
                  select
                  name="status"
                  disabled={loading}
                  defaultValue="AVAILABLE"
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                >
                  <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                  <MenuItem value="UNAVAILABLE">UNAVAILABLE</MenuItem>
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('adminCars.add.primaryImage')}
                </FormLabel>
                
                <Box
                  onClick={() => !loading && primaryInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: primaryFile ? 'primary.main' : 'grey.300',
                    borderRadius: '12px',
                    p: 4,
                    textAlign: 'center',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    bgcolor: primaryFile ? 'primary.50' : 'grey.50',
                    transition: '0.2s',
                    '&:hover': { borderColor: loading ? 'grey.300' : 'primary.main', bgcolor: loading ? 'grey.50' : 'primary.50' }
                  }}
                >
                  <input
                    ref={primaryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryChange}
                    style={{ display: 'none' }}
                  />
                  <CloudUploadIcon sx={{ fontSize: 40, color: primaryFile ? 'primary.main' : 'grey.400', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {primaryFile ? primaryFile.name : 'Click to upload Primary Car Photo'}
                  </Typography>
                </Box>

                {primaryPreviewUrl && (
                  <Box sx={{ mt: 2, position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                    <img src={primaryPreviewUrl} alt="Cover Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }} />
                    <IconButton
                      disabled={loading}
                      onClick={handleRemovePrimary}
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button
                  component={Link}
                  href="/admin/cars"
                  variant="outlined"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                >
                  {t('adminCars.common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Uploading to Cloud...</Typography>
                    </Box>
                  ) : (
                    t('adminCars.add.submit')
                  )}
                </Button>
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Card>
    </Container>
  );
};