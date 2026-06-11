'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
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
  onDeleteImage: (imageId: string) => void; // New delete callback
  deletingImageId: string | null;            // New loading state
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
  onDeleteImage,
  deletingImageId,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(null);
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>([]);

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

  useEffect(() => {
    if (additionalFiles.length === 0) {
      setAdditionalPreviewUrls([]);
      return;
    }
    const urls = additionalFiles.map((f) => URL.createObjectURL(f));
    setAdditionalPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [additionalFiles]);

  const filteredModels = models.filter((m) => m.brand.id === selectedBrandId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalFiles(Array.from(e.target.files));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {t('adminCars.edit.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {t('adminCars.edit.subtitle')}
        </Typography>

        <Box sx={{ minHeight: error || success ? 'auto' : 0, mb: error || success ? 3 : 0 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{t('adminCars.edit.success')}</Alert>}
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Brand Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('cars.catalog.filters.brand')}
              </label>
              <select
                required
                value={selectedBrandId}
                onChange={(e) => {
                  setSelectedBrandId(e.target.value);
                  setSelectedModelId('');
                }}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              >
                <option value="">{t('cars.catalog.filters.allBrands')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('cars.catalog.filters.model')}
              </label>
              <select
                name="modelId"
                required
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={!selectedBrandId}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              >
                <option value="">{t('cars.catalog.filters.allModels')}</option>
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Plate Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.plateNumber')}
              </label>
              <input
                name="plateNumber"
                type="text"
                required
                defaultValue={car.plateNumber}
                placeholder="AA-123-AA"
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              />
            </div>

            {/* Fuel Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.fuelType')}
              </label>
              <select
                name="fuelTypeId"
                defaultValue={car.fuelType?.id || ''}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              >
                <option value="">{t('cars.catalog.filters.allFuels')}</option>
                {fuelTypes.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Base Rental Price */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.basePrice')}
              </label>
              <input
                name="basePrice"
                type="number"
                step="0.01"
                required
                defaultValue={car.basePrice}
                placeholder="49.99"
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              />
            </div>

            {/* Existing Active Cover Image */}
            {!primaryPreviewUrl && car.primaryImageUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Current Cover Image
                </label>
                <img
                  src={car.primaryImageUrl}
                  alt="Car Cover"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>
            )}

            {/* Update Cover Image */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.primaryImage')} (Optional)
              </label>
              <input
                name="primaryImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ padding: '8px 0', fontSize: '14px' }}
              />
              {primaryPreviewUrl && (
                <Box sx={{ mt: 1, borderRadius: '6px', overflow: 'hidden', border: 1, borderColor: 'grey.200' }}>
                  <img src={primaryPreviewUrl} alt="New Primary Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                </Box>
              )}
            </div>

            {/* Render Existing Database Gallery Images with Interactive Deletion Overlays */}
            {car.images && car.images.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  {t('adminCars.edit.currentGallery')}
                </label>
                <Grid container spacing={1}>
                  {car.images.map((img) => (
                    <Grid item xs={4} key={img.id}>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: 1,
                          borderColor: 'grey.200',
                          aspectRatio: '1/1',
                          '&:hover .delete-overlay-btn': { opacity: 1 } // Shows delete button cleanly on hover
                        }}
                      >
                        <img src={img.url} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Circular Absolute Deletion Overlay Button */}
                        <button
                          type="button"
                          className="delete-overlay-btn"
                          onClick={() => onDeleteImage(img.id)}
                          disabled={deletingImageId === img.id}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 10,
                            transition: 'opacity 0.2s',
                          }}
                        >
                          {deletingImageId === img.id ? (
                            <CircularProgress size={12} color="inherit" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '12px', height: '12px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}

            {/* Update Additional Gallery Images */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.edit.additionalImages')} (Optional)
              </label>
              <input
                name="additionalImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalChange}
                style={{ padding: '8px 0', fontSize: '14px' }}
              />
              {additionalPreviewUrls.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {additionalPreviewUrls.map((url, i) => (
                    <Grid item xs={4} key={i}>
                      <Box sx={{ borderRadius: '6px', overflow: 'hidden', border: 1, borderColor: 'grey.200', aspectRatio: '1/1' }}>
                        <img src={url} alt={`Gallery Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </div>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                component={Link}
                href="/admin/cars"
                variant="outlined"
                fullWidth
                size="large"
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none' }}
              >
                {t('adminCars.common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 0, fontWeight: 700, textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t('adminCars.edit.submit')}
              </Button>
            </Box>

          </div>
        </Box>
      </Box>
    </Container>
  );
};