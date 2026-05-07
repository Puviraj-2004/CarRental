'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditCar } from '@/hooks/graphql/useEditCar';
import { EditCarView } from './EditCarView';
import { Snackbar, Alert, Box, LinearProgress } from '@mui/material';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';
import { useTranslation } from '@/lib/LanguageContext';
import { getSafeErrorMessage } from '@/lib/errorUtils';

export const EditCarContainer = ({ id }: { id: string }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedImagesRef = useRef<Array<{ id: string; file: File; previewUrl: string }>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  const [formData, setFormData] = useState<any>({
    modelId: '',
    brandId: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seats: 5,
    pricePerDay: 0,
    depositAmount: 0,
    dailyKmLimit: 100,
    extraKmCharge: 0,
    currentOdometer: 0,
    critAirRating: 'CRIT_AIR_1',
    status: 'AVAILABLE',
    requiredLicense: 'B',
  });

  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; file: File; previewUrl: string }>>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(-1);

  // enums replaces enumData — static constants, no network request
  const {
    carData, carLoading, brandData, enums, modelData,
    updateCar, uploadCarImages, deleteCarImage, setPrimaryCarImage,
  } = useEditCar(id, formData.brandId);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (carData) {
      const { __typename, images, createdAt, updatedAt, model, id: carId, ...rest } = carData;
      setFormData((prev: any) => ({
        ...prev,
        ...rest,
        modelId: model?.id || '',
        brandId: carData?.brand?.id || '',
      }));
      setExistingImages(images || []);
      const primaryExistingImage = images?.find((img: any) => img.isPrimary);
      setPrimaryImageIndex(primaryExistingImage ? -1 : 0);
    }
  }, [carData]);

  const handleInputChange = useCallback((e: any) => {
    const { name, value } = e.target;
    const numericFields = ['year', 'pricePerDay', 'depositAmount', 'dailyKmLimit', 'extraKmCharge', 'currentOdometer', 'seats'];
    setFormData((p: any) => ({
      ...p,
      [name]: numericFields.includes(name) ? (value === '' ? 0 : Number(value)) : value,
    }));
  }, []);

  const handleBrandChange = useCallback((brandId: string) => {
    setFormData((prev: any) => ({ ...prev, brandId, modelId: '' }));
  }, []);

  const handleSetPrimaryNew = useCallback((index: number) => {
    setPrimaryImageIndex(index);
  }, []);

  const handleSubmit = async () => {
    if (!formData.modelId || !formData.plateNumber) {
      setAlert({ open: true, msg: t('validation.requiredFieldsMissing'), severity: 'warning' });
      return;
    }

    setIsUpdating(true);
    try {
      const { id: _, brand, ...cleanInput } = formData;
      await updateCar({
        variables: { id, input: cleanInput },
        refetchQueries: [{ query: GET_CARS_QUERY }],
      });

      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const isPrimary = i === primaryImageIndex && primaryImageIndex >= 0;
          await uploadCarImages({
            variables: { carId: id, file: selectedImages[i].file, isPrimary },
          });
        }
      }

      setAlert({ open: true, msg: t('containerMessages.updateSuccess'), severity: 'success' });
      redirectTimeoutRef.current = setTimeout(() => {
        setAlert((prev) => ({ ...prev, open: false }));
        router.push('/admin/cars');
      }, 1000);
    } catch (err: any) {
      setAlert({ open: true, msg: getSafeErrorMessage(err, t('errors.generic')), severity: 'error' });
      setIsUpdating(false);
    }
  };

  if (carLoading) return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, width: '100%' }}>
      <EditCarView
        activeTab={activeTab} setActiveTab={setActiveTab}
        formData={formData} setFormData={setFormData}
        brandData={brandData} modelData={modelData}
        enums={enums}
        onInputChange={handleInputChange}
        onBrandChange={handleBrandChange}
        onImageSelect={(e: any) => {
          const files = Array.from(e.target.files || []) as File[];
          if (files.length === 0) return;

          const nextImages = files.map((file, index) => ({
            id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
          }));

          setSelectedImages((prev) => [...prev, ...nextImages]);
          e.target.value = '';
        }}
        existingImages={existingImages}
        selectedImages={selectedImages}
        primaryImageIndex={primaryImageIndex}
        setPrimaryImageIndex={setPrimaryImageIndex}
        onRemoveExistingImage={(imgId: string) =>
          deleteCarImage({ variables: { imageId: imgId } }).then(() =>
            setExistingImages(p => p.filter(x => x.id !== imgId))
          )
        }
        onRemoveNewImage={(idx: number) => {
          setSelectedImages((prev) => {
            const imageToRemove = prev[idx];
            if (imageToRemove) {
              URL.revokeObjectURL(imageToRemove.previewUrl);
            }

            const nextImages = prev.filter((_, i) => i !== idx);
            setPrimaryImageIndex((currentIndex) => {
              if (nextImages.length === 0) return -1;
              if (idx === currentIndex) return -1;
              if (idx < currentIndex) return currentIndex - 1;
              return Math.min(currentIndex, nextImages.length - 1);
            });

            return nextImages;
          });
        }}
        onSetPrimaryExisting={async (imageId: string) => {
          await setPrimaryCarImage({
            variables: { carId: id, imageId },
            refetchQueries: [{ query: GET_CARS_QUERY }],
          });
          setExistingImages((prev) => prev.map((image) => ({
            ...image,
            isPrimary: image.id === imageId,
          })));
          setPrimaryImageIndex(-1);
        }}
        onSetPrimaryNew={handleSetPrimaryNew}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isUpdating={isUpdating}
        t={t}
      />
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert(p => ({ ...p, open: false }))}>
        <Alert severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
};