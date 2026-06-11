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
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import type { DetailedCar } from '../../hooks/useCarDetails';
import { FormLabel } from '@mui/material';

interface ManageGalleryViewProps {
  t: (path: string) => string;
  car: DetailedCar;
  error: string | null;
  loading: boolean;
  additionalFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemovePendingUpload: (index: number) => void;
  imagesPendingDelete: string[];
  onMarkForDeletion: (imageId: string) => void;
  onUndoDeletion: (imageId: string) => void;
  onSetPrimary: (imageId: string) => void;
  settingPrimaryId: string | null;
  onSave: () => void;
}

export const ManageGalleryView: React.FC<ManageGalleryViewProps> = ({
  t,
  car,
  error,
  loading,
  additionalFiles,
  onAddFiles,
  onRemovePendingUpload,
  imagesPendingDelete,
  onMarkForDeletion,
  onUndoDeletion,
  onSetPrimary,
  settingPrimaryId,
  onSave,
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (additionalFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = additionalFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [additionalFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddFiles(Array.from(e.target.files));
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clean input
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
          Manage Vehicle Gallery
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Manage and add images for {car.model.brand.name} {car.model.name} ({car.plateNumber})
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

        {/* ─── Drag & Drop Selection Area ──────────────────────────────── */}
        <Box sx={{ mb: 4 }}>
          <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.primary', fontSize: '14px' }}>
            Queue New Images
          </FormLabel>
          <Box
            onClick={() => !loading && fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: additionalFiles.length > 0 ? 'primary.main' : 'grey.300',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              bgcolor: additionalFiles.length > 0 ? 'primary.50' : 'grey.50',
              transition: '0.2s',
              '&:hover': { borderColor: loading ? 'grey.300' : 'primary.main', bgcolor: loading ? 'grey.50' : 'primary.50' }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={loading}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: additionalFiles.length > 0 ? 'primary.main' : 'grey.400', mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {additionalFiles.length > 0 ? `${additionalFiles.length} files selected` : 'Click or drop files to select new images'}
            </Typography>
          </Box>

          {previewUrls.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                Pending Upload Grid ({additionalFiles.length} images)
              </Typography>
              <Grid container spacing={2}>
                {previewUrls.map((url, i) => (
                  <Grid item xs={4} sm={3} key={i}>
                    <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'primary.200', aspectRatio: '1/1' }}>
                      <img src={url} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <IconButton
                        disabled={loading}
                        onClick={() => onRemovePendingUpload(i)}
                        size="small"
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, p: 0.5 }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* ─── Existing Database Assets Grid ───────────────────────────── */}
        {car.images && car.images.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Current Gallery Grid ({car.images.length} images)
            </Typography>
            <Grid container spacing={2}>
              {car.images.map((img) => {
                const isImageCurrentlyPrimary = car.primaryImageUrl === img.url;
                const isPendingDelete = imagesPendingDelete.includes(img.id);

                return (
                  <Grid item xs={6} sm={4} md={3} key={img.id}>
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: isImageCurrentlyPrimary ? 'primary.main' : 'grey.200',
                        boxShadow: isImageCurrentlyPrimary ? '0 0 0 2px #3b82f6' : 'none',
                        aspectRatio: '1/1',
                        opacity: isPendingDelete ? 0.35 : 1, // Visual strike-through indication [1]
                        filter: isPendingDelete ? 'grayscale(80%)' : 'none',
                        '&:hover .gallery-overlay': { opacity: 1 }
                      }}
                    >
                      <img src={img.url} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      
                      {isImageCurrentlyPrimary && (
                        <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'primary.main', color: '#fff', borderRadius: '50%', p: 0.5, display: 'flex', boxShadow: 1 }}>
                          <StarIcon sx={{ fontSize: 12 }} />
                        </Box>
                      )}

                      <Box
                        className="gallery-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(0,0,0,0.5)',
                          opacity: 0,
                          transition: '0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        {isPendingDelete ? (
                          <IconButton
                            disabled={loading}
                            onClick={() => onUndoDeletion(img.id)}
                            size="small"
                            sx={{ bgcolor: 'success.main', color: '#fff', '&:hover': { bgcolor: 'success.dark' }, width: 32, height: 32 }}
                            title="Undo Deletion"
                          >
                            <UndoIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        ) : (
                          <>
                            {!isImageCurrentlyPrimary && (
                              <IconButton
                                disabled={loading}
                                onClick={() => onSetPrimary(img.id)}
                                size="small"
                                sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 32, height: 32 }}
                                title="Set as Cover"
                              >
                                {settingPrimaryId === img.id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <StarIcon sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            )}

                            <IconButton
                              disabled={loading}
                              onClick={() => onMarkForDeletion(img.id)}
                              size="small"
                              sx={{ bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, width: 32, height: 32 }}
                              title="Delete Image"
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* ─── Form Actions ────────────────────────────────────────────── */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'grey.100', pt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
            onClick={onSave}
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Processing Gallery...</Typography>
              </Box>
            ) : (
              'Save Gallery Changes'
            )}
          </Button>
        </Box>

      </Card>
    </Container>
  );
};