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
import { validateFileMime, validateFileExtension, validateFileSize } from '@/lib/fileValidation';

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
  const { executeAdd, loadingAdd } = useAdminCars();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);

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

    const hasPrimaryFile = primaryFile !== null;
    if (hasPrimaryFile && primaryFile) {
      try {
        validateFileExtension(primaryFile.name, 'car_image');
        validateFileMime(primaryFile.type, 'car_image');
        validateFileSize(primaryFile.size, primaryFile.name, 'car_image');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
    }

    try {
      await executeAdd({
        modelId,
        plateNumber,
        fuelTypeId,
        basePrice,
        status,
        primaryImage: hasPrimaryFile ? primaryFile : null,
      });

      showToast(t('adminCars.add.success'), 'success');
      setSuccess(true);
      setPrimaryFile(null);
      e.currentTarget.reset();
      router.push('/admin/cars');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const isPreparing = loadingBrands || loadingModels || loadingFuels;

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
      loading={loadingAdd}
      brands={brandsData?.brands || []}
      models={modelsData?.models || []}
      fuelTypes={fuelsData?.fuelTypes || []}
      primaryFile={primaryFile}
      setPrimaryFile={setPrimaryFile}
    />
  );
};