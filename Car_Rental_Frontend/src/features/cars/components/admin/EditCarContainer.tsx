'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { useAdminCars } from '../../hooks/useAdminCars';
import { EditCarView } from './EditCarView';
import { GET_CAR_QUERY, GET_BRANDS_QUERY, GET_MODELS_QUERY } from '../../graphql/queries';
import { validateFileMime, validateFileExtension } from '@/lib/fileValidation';
import type { DetailedCar, GetCarData } from '../../hooks/useCarDetails';

import { gql } from '@apollo/client';
const GET_FUEL_TYPES_QUERY = gql`
  query GetFuelTypes {
    fuelTypes {
      id
      name
    }
  }
`;

export const EditCarContainer: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  
  const { executeUpdate, executeUploadImages, executeDeleteImage, loadingUpdate, loadingUpload } = useAdminCars(); // Added executeDeleteImage

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null); // Loader state for deleting individual pictures

  const { data: carData, loading: loadingCar, error: errorCar, refetch: refetchCar } = useQuery<GetCarData, { id: string }>(
    GET_CAR_QUERY,
    { variables: { id } }
  );

  const { data: brandsData, loading: loadingBrands } = useQuery<{ brands: Array<{ id: string; name: string }> }>(GET_BRANDS_QUERY);
  const { data: modelsData, loading: loadingModels } = useQuery<{ models: Array<{ id: string; name: string; brand: { id: string } }> }>(GET_MODELS_QUERY);
  const { data: fuelsData, loading: loadingFuels } = useQuery<{ fuelTypes: Array<{ id: string; name: string }> }>(GET_FUEL_TYPES_QUERY);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const modelId = formData.get('modelId') as string;
    const plateNumber = formData.get('plateNumber') as string;
    const fuelTypeId = (formData.get('fuelTypeId') as string) || null;
    const basePrice = Number(formData.get('basePrice') as string);
    
    const primaryImage = formData.get('primaryImage') as File | null;
    const additionalImages = formData.getAll('additionalImages') as File[];

    if (isNaN(basePrice) || basePrice <= 0) {
      setError(t('adminCars.common.invalidPrice'));
      return;
    }

    const hasPrimaryFile = primaryImage && primaryImage.size > 0 && primaryImage.name !== '';
    if (hasPrimaryFile && primaryImage) {
      try {
        validateFileExtension(primaryImage.name, 'car_image');
        validateFileMime(primaryImage.type, 'car_image');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
    }

    const validAdditionalImages = additionalImages.filter(f => f.size > 0 && f.name !== '');
    if (validAdditionalImages.length > 0) {
      for (const file of validAdditionalImages) {
        try {
          validateFileExtension(file.name, 'car_image');
          validateFileMime(file.type, 'car_image');
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          return;
        }
      }
    }

    try {
      const res = await executeUpdate(id, {
        plateNumber,
        fuelTypeId,
        basePrice,
        primaryImage: hasPrimaryFile ? primaryImage : null,
      });

      if (res.data?.updateCar && validAdditionalImages.length > 0) {
        await executeUploadImages(id, validAdditionalImages, false);
      }

      showToast(t('adminCars.edit.success'), 'success');
      setSuccess(true);
      router.push('/admin/cars');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  // Handles individual on-screen image deletions from your fleet gallery (Rule 2)
  const handleDeleteImage = async (imageId: string) => {
    setDeletingImageId(imageId);
    try {
      const res = await executeDeleteImage(imageId);
      if (res.data?.deleteCarImage) {
        showToast('Image removed from gallery', 'success'); // Shows beautiful UI Toast
        await refetchCar(); // Instantly refetches the car details from DB to refresh UI
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('common.error'), 'error');
    } finally {
      setDeletingImageId(null);
    }
  };

  const isPreparing = loadingCar || loadingBrands || loadingModels || loadingFuels;
  const isPending = loadingUpdate || loadingUpload;

  if (isPreparing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorCar || !carData?.car) {
    return <Alert severity="error">{t('common.noData')}</Alert>;
  }

  return (
    <EditCarView
      t={t}
      car={carData.car}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      loading={isPending}
      brands={brandsData?.brands || []}
      models={modelsData?.models || []}
      fuelTypes={fuelsData?.fuelTypes || []}
      onDeleteImage={handleDeleteImage} // Passed delete handler
      deletingImageId={deletingImageId}   // Passed loading state
    />
  );
};