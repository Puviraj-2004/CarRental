'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
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
  
  // Controlled file states passed from the container
  primaryFile: File | null;
  setPrimaryFile: (file: File | null) => void;
  additionalFiles: File[];
  setAdditionalFiles: (files: File[] | ((prev: File[]) => File[])) => void;
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
  additionalFiles,
  setAdditionalFiles,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  
  // Previews managed locally
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(null);
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>([]);

  // Input references to programmatically clear files from the native DOM element
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate and clean up object URLs to prevent browser memory leaks
  useEffect(() => {
    if (!primaryFile) {
      setPrimaryPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(primaryFile);
    setPrimaryPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [primaryFile]);

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

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrimaryFile(e.target.files[0]);
    }
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalFiles(Array.from(e.target.files));
    }
  };

  // Clears the selected primary cover image
  const handleRemovePrimary = () => {
    setPrimaryFile(null);
    if (primaryInputRef.current) {
      primaryInputRef.current.value = ''; // Synchronizes the DOM input
    }
  };

  // Removes a specific image from the gallery selection list before upload
  const handleRemoveAdditional = (indexToRemove: number) => {
    setAdditionalFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (additionalInputRef.current) {
      // Clear file input value as it cannot hold partially updated FileLists natively
      additionalInputRef.current.value = ''; 
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {t('adminCars.add.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {t('adminCars.add.subtitle')}
        </Typography>

        <Box sx={{ minHeight: error || success ? 'auto' : 0, mb: error || success ? 3 : 0 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{t('adminCars.add.success')}</Alert>}
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
                onChange={(e) => setSelectedBrandId(e.target.value)}
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
                placeholder="49.99"
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              />
            </div>

            {/* Vehicle Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.status')}
              </label>
              <select
                name="status"
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>

            {/* Primary Cover Image File Upload & Live Preview with Remove button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.primaryImage')}
              </label>
              <input
                ref={primaryInputRef} // Linked Ref
                name="primaryImage"
                type="file"
                accept="image/*"
                onChange={handlePrimaryChange}
                style={{ padding: '8px 0', fontSize: '14px' }}
              />
              {primaryPreviewUrl && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ borderRadius: '6px', overflow: 'hidden', border: 1, borderColor: 'grey.200', mb: 1 }}>
                    <img src={primaryPreviewUrl} alt="Primary Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                  </Box>
                  <Button variant="outlined" color="error" size="small" onClick={handleRemovePrimary} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Remove Cover
                  </Button>
                </Box>
              )}
            </div>

            {/* Additional Gallery Images & Live Previews with Hover Deletion Overlays */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t('adminCars.add.additionalImages')}
              </label>
              <input
                ref={additionalInputRef} // Linked Ref
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
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: 1,
                          borderColor: 'grey.200',
                          aspectRatio: '1/1',
                          '&:hover .remove-preview-btn': { opacity: 1 }
                        }}
                      >
                        <img src={url} alt={`Gallery Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Circular Absolute Removal Overlay Button */}
                        <button
                          type="button"
                          className="remove-preview-btn"
                          onClick={() => handleRemoveAdditional(i)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            zIndex: 10,
                            padding: 0,
                            transition: 'opacity 0.2s',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '10px', height: '10px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </div>

            {/* Actions */}
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
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t('adminCars.add.submit')}
              </Button>
            </Box>

          </div>
        </Box>
      </Box>
    </Container>
  );
};