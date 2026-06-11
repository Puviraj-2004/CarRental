'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { useAdminCars } from '../../hooks/useAdminCars';
import { AddCarView } from './AddCarView';
import { GET_BRANDS_QUERY, GET_MODELS_QUERY } from '../../graphql/queries';
import { validateFileMime, validateFileExtension } from '@/lib/fileValidation';

import { gql } from '@apollo/client';
const GET_FUEL_TYPES_QUERY = gql`
  query GetFuelTypes {
    fuelTypes {
      id
      name
    }
  }
`;

export const AddCarContainer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const { executeAdd, executeUploadImages, loadingAdd, loadingUpload } = useAdminCars();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Centralized controlled file states passed to the presenter
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  // Fetch dropdown static descriptors
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
    const status = formData.get('status') as 'AVAILABLE' | 'UNAVAILABLE';

    if (isNaN(basePrice) || basePrice <= 0) {
      setError(t('adminCars.common.invalidPrice'));
      return;
    }

    // ── 1. Validate Primary Image ───────────────────────────────────────────
    const hasPrimaryFile = primaryFile !== null;
    if (hasPrimaryFile && primaryFile) {
      try {
        validateFileExtension(primaryFile.name, 'car_image');
        validateFileMime(primaryFile.type, 'car_image');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
    }

    // ── 2. Validate Additional Gallery Images ──────────────────────────────
    const validAdditionalImages = additionalFiles.filter(f => f.size > 0 && f.name !== '');
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
      // ── 3. Step 1: Create the vehicle and save primary image ───────────────
      const res = await executeAdd({
        modelId,
        plateNumber,
        fuelTypeId,
        basePrice,
        status,
        primaryImage: hasPrimaryFile ? primaryFile : null,
      });

      const newCarId = res.data?.addCar?.id;

      // ── 4. Step 2: Upload remaining gallery pictures sequentially ─────────
      if (newCarId && validAdditionalImages.length > 0) {
        await executeUploadImages(newCarId, validAdditionalImages, false);
      }

      showToast(t('adminCars.add.success'), 'success');
      setSuccess(true);
      
      // Reset the file states upon successful submission
      setPrimaryFile(null);
      setAdditionalFiles([]);
      e.currentTarget.reset();

      router.push('/admin/cars');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const isPreparing = loadingBrands || loadingModels || loadingFuels;
  const isPending = loadingAdd || loadingUpload;

  if (isPreparing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AddCarView
      t={t}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      loading={isPending}
      brands={brandsData?.brands || []}
      models={modelsData?.models || []}
      fuelTypes={fuelsData?.fuelTypes || []}
      primaryFile={primaryFile}
      setPrimaryFile={setPrimaryFile}
      additionalFiles={additionalFiles}
      setAdditionalFiles={setAdditionalFiles}
    />
  );
};