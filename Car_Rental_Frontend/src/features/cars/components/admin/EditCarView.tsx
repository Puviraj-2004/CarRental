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
import type { DetailedCar } from '../../hooks/useCarDetails';

interface EditCarViewProps {
  t: (path: string) => string;
  car: DetailedCar;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  success: boolean;
  loading: boolean;
  brands: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string; brand: { id: string } }>;
  fuelTypes: Array<{ id: string; name: string }>;
}

export const EditCarView: React.FC<EditCarViewProps> = ({
  t,
  car,
  onSubmit,
  error,
  success,
  loading,
  brands,
  models,
  fuelTypes,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (car.model?.brand?.id) {
      setSelectedBrandId(car.model.brand.id);
    }
    if (car.model?.id) {
      setSelectedModelId(car.model.id);
    }
  }, [car]);

  useEffect(() => {
    if (!selectedFile) {
      setPrimaryPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPrimaryPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const filteredModels = models.filter((m) => m.brand.id === selectedBrandId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemovePrimaryPreview = () => {
    setSelectedFile(null);
    if (primaryInputRef.current) {
      primaryInputRef.current.value = '';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          {t('adminCars.edit.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {t('adminCars.edit.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{t('adminCars.edit.success')}</Alert>}

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
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    setSelectedModelId('');
                  }}
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
                  value={selectedModelId}
                  disabled={!selectedBrandId || loading}
                  onChange={(e) => setSelectedModelId(e.target.value)}
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
                  defaultValue={car.plateNumber}
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
                  defaultValue={car.fuelType?.id || ''}
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
                  defaultValue={car.basePrice}
                  placeholder="49.99"
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '8px' } }}
                />
              </FormControl>
            </Grid>

            {!primaryPreviewUrl && car.primaryImageUrl && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                    Current Cover Image
                  </FormLabel>
                  <Box sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                    <img src={car.primaryImageUrl} alt="Car Cover" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }} />
                  </Box>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '14px' }}>
                  {t('adminCars.add.primaryImage')} (Optional)
                </FormLabel>

                <Box
                  onClick={() => !loading && primaryInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: selectedFile ? 'primary.main' : 'grey.300',
                    borderRadius: '12px',
                    p: 4,
                    textAlign: 'center',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    bgcolor: selectedFile ? 'primary.50' : 'grey.50',
                    transition: '0.2s',
                    '&:hover': { borderColor: loading ? 'grey.300' : 'primary.main', bgcolor: loading ? 'grey.50' : 'primary.50' }
                  }}
                >
                  <input
                    ref={primaryInputRef}
                    name="primaryImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <CloudUploadIcon sx={{ fontSize: 40, color: selectedFile ? 'primary.main' : 'grey.400', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedFile ? selectedFile.name : 'Click to select a new Cover Image'}
                  </Typography>
                </Box>

                {primaryPreviewUrl && (
                  <Box sx={{ mt: 2, position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                    <img src={primaryPreviewUrl} alt="New Cover Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }} />
                    <IconButton
                      disabled={loading}
                      onClick={handleRemovePrimaryPreview}
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
                    t('adminCars.edit.submit')
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