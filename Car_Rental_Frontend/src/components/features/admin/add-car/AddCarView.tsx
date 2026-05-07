'use client';

import React from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Typography, IconButton, Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, Save, CloudUpload, Delete as DeleteIcon,
} from '@mui/icons-material';
import { CAR_ENUMS } from '@/hooks/graphql/useAddCar';

interface AddCarViewProps {
  activeTab: number;
  setActiveTab: (value: number) => void;
  formData: any;
  setFormData: (data: any) => void;
  brandData: any;
  modelData: any;
  // enums replaces enumData — flat readonly arrays, no enumValues nesting
  enums: typeof CAR_ENUMS;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedImages: Array<{ id: string; file: File; previewUrl: string }>;
  primaryImageIndex: number;
  setPrimaryImageIndex: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  t: (key: string, params?: Record<string, string>) => string;
}

export const AddCarView = ({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  brandData,
  modelData,
  enums,
  onInputChange,
  onImageSelect,
  selectedImages,
  primaryImageIndex,
  setPrimaryImageIndex,
  onRemoveNewImage,
  onSubmit,
  onCancel,
  isSubmitting,
  t,
}: AddCarViewProps) => {
  return (
    <Paper elevation={3} sx={{ width: '100%', maxWidth: 900, height: '100%', maxHeight: 680, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label={t('admin.identity')} />
          <Tab icon={<Euro fontSize="small" />} iconPosition="start" label={t('admin.pricing')} />
          <Tab icon={<PhotoCamera fontSize="small" />} iconPosition="start" label={t('admin.media')} />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 4 } }}>
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={brandData?.brands || []}
                getOptionLabel={(opt: any) => opt.name}
                value={brandData?.brands?.find((b: any) => b.id === formData.brandId) || null}
                onChange={(_, v: any) => setFormData({ ...formData, brandId: v?.id || '', modelId: '' })}
                renderInput={(p) => <TextField {...p} label={t('admin.brand')} size="small" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                disabled={!formData.brandId}
                options={modelData?.models || []}
                getOptionLabel={(opt: any) => opt.name}
                value={modelData?.models?.find((m: any) => m.id === formData.modelId) || null}
                onChange={(_, v: any) => setFormData({ ...formData, modelId: v?.id || '' })}
                renderInput={(p) => <TextField {...p} label={t('admin.model')} size="small" required fullWidth />}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField fullWidth label={t('admin.year')} name="year" type="number" size="small" required value={formData.year} onChange={onInputChange} />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{t('admin.critAir')}</InputLabel>
                <Select name="critAirRating" value={formData.critAirRating} label={t('admin.critAir')} onChange={onInputChange as any}>
                  {enums.critAirCategories.map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label={t('admin.plateNumber')} name="plateNumber" size="small" required value={formData.plateNumber} onChange={onInputChange} />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.fuelType')}</InputLabel>
                <Select name="fuelType" value={formData.fuelType} label={t('admin.fuelType')} onChange={onInputChange as any}>
                  {enums.fuelTypes.map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{t('admin.transmission')}</InputLabel>
                <Select name="transmission" value={formData.transmission} label={t('admin.transmission')} onChange={onInputChange as any}>
                  {enums.transmissions.map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField fullWidth label={t('admin.seats')} name="seats" type="number" size="small" required value={formData.seats} onChange={onInputChange} />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{t('admin.license')}</InputLabel>
                <Select name="requiredLicense" value={formData.requiredLicense} label={t('admin.license')} onChange={onInputChange as any}>
                  {enums.licenseCategories.map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{t('admin.status')}</InputLabel>
                <Select name="status" value={formData.status} label={t('admin.status')} onChange={onInputChange as any}>
                  {enums.carStatuses.map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#293D91' }}>
                💰 {t('admin.pricingDeposits')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label={t('admin.pricePerDay')} name="pricePerDay" type="number" required value={formData.pricePerDay || ''} onChange={onInputChange} InputProps={{ startAdornment: '€' }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label={t('admin.securityDeposit')} name="depositAmount" type="number" value={formData.depositAmount || ''} onChange={onInputChange} InputProps={{ startAdornment: '€' }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#293D91' }}>
                🚗 {t('admin.kmLimitsTracking')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label={t('admin.dailyKmLimit')} name="dailyKmLimit" type="number" value={formData.dailyKmLimit || ''} onChange={onInputChange} InputProps={{ endAdornment: formData.dailyKmLimit ? t('common.kmPerDay') : null }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label={t('admin.extraKmCharge')} name="extraKmCharge" type="number" required value={formData.extraKmCharge || ''} onChange={onInputChange} InputProps={{ startAdornment: '€' }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label={t('admin.currentOdometer')} name="currentOdometer" type="number" required value={formData.currentOdometer || ''} onChange={onInputChange} />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="label"
              sx={{ height: 120, border: '2px dashed #CBD5E1', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', mb: 3 }}
            >
              <input hidden accept="image/*" multiple type="file" onChange={onImageSelect} />
              <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">{t('admin.clickToUpload')}</Typography>
            </Box>
            <Grid container spacing={1}>
              {selectedImages.map((image, i: number) => (
                <Grid item xs={3} sm={2} key={image.id}>
                  <Box
                    sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === primaryImageIndex ? '2px solid #293D91' : '1px solid #E2E8F0', cursor: 'pointer' }}
                    onClick={() => setPrimaryImageIndex(i)}
                  >
                    <img src={image.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                    {i === primaryImageIndex && (
                      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px', textAlign: 'center' }}>
                        {t('admin.main')}
                      </Box>
                    )}
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); onRemoveNewImage(i); }}
                      size="small"
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white' }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} color="inherit">{t('admin.cancel')}</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isSubmitting}
          startIcon={<Save />}
          sx={{ bgcolor: '#293D91' }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : t('admin.addCar')}
        </Button>
      </Box>
    </Paper>
  );
};