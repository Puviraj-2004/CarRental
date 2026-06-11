'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { useAdminCars } from '../../hooks/useAdminCars';
import { ManageGalleryView } from './ManageGalleryView';
import { GET_CAR_QUERY } from '../../graphql/queries';
import { validateFileMime, validateFileExtension, validateFileSize } from '@/lib/fileValidation';
import type { GetCarData } from '../../hooks/useCarDetails';

export const ManageGalleryContainer: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const { 
    executeUploadImages, 
    executeDeleteImage, 
    executeSetPrimary, 
    loadingUpload, 
    loadingPrimary, 
    loadingDeleteImg 
  } = useAdminCars();

  const [error, setError] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [imagesPendingDelete, setImagesPendingDelete] = useState<string[]>([]);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  const { data: carData, loading: loadingCar, error: errorCar, refetch: refetchCar } = useQuery<GetCarData, { id: string }>(
    GET_CAR_QUERY,
    { variables: { id }, fetchPolicy: 'network-only' }
  );

  const handleAddFiles = (newFiles: File[]) => {
    setError(null);
    for (const file of newFiles) {
      try {
        validateFileExtension(file.name, 'car_image');
        validateFileMime(file.type, 'car_image');
        validateFileSize(file.size, file.name, 'car_image'); // Context size guard
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
    }
    // Merges previously selected and newly selected files cleanly [1]
    setAdditionalFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemovePendingUpload = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkForDeletion = (imageId: string) => {
    setImagesPendingDelete((prev) => [...prev, imageId]);
  };

  const handleUndoDeletion = (imageId: string) => {
    setImagesPendingDelete((prev) => prev.filter((id) => id !== imageId));
  };

  const handleSetPrimary = async (imageId: string) => {
    setSettingPrimaryId(imageId);
    try {
      const res = await executeSetPrimary(id, imageId);
      if (res.data?.setPrimaryImage) {
        showToast('Cover image updated successfully', 'success');
        await refetchCar();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error setting cover image', 'error');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleSaveChanges = async () => {
    setError(null);
    try {
      // 1. Commit all Pending Deletions at once
      if (imagesPendingDelete.length > 0) {
        await Promise.all(imagesPendingDelete.map((imgId) => executeDeleteImage(imgId)));
      }

      // 2. Commit all Pending Uploads in parallel
      if (additionalFiles.length > 0) {
        await executeUploadImages(id, additionalFiles, false);
      }

      showToast('Gallery changes saved successfully', 'success');
      setAdditionalFiles([]);
      setImagesPendingDelete([]);
      await refetchCar();
      router.push('/admin/cars');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving gallery changes');
    }
  };

  const isPreparing = loadingCar;
  const isPending = loadingUpload || loadingDeleteImg || loadingPrimary;

  if (isPreparing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorCar || !carData?.car) {
    return <Alert severity="error">Failed to fetch car data.</Alert>;
  }

  return (
    <ManageGalleryView
      t={t}
      car={carData.car}
      error={error}
      loading={isPending}
      additionalFiles={additionalFiles}
      onAddFiles={handleAddFiles}
      onRemovePendingUpload={handleRemovePendingUpload}
      imagesPendingDelete={imagesPendingDelete}
      onMarkForDeletion={handleMarkForDeletion}
      onUndoDeletion={handleUndoDeletion}
      onSetPrimary={handleSetPrimary}
      settingPrimaryId={settingPrimaryId}
      onSave={handleSaveChanges}
    />
  );
};