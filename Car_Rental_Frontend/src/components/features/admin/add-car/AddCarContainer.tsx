'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAddCar } from '@/hooks/graphql/useAddCar';
import { AddCarView } from './AddCarView';
import { Box, Snackbar, Alert } from '@mui/material';
import { useTranslation } from '@/lib/LanguageContext';
import { getSafeErrorMessage } from '@/lib/errorUtils';

export const AddCarContainer = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedImagesRef = useRef<Array<{ id: string; file: File; previewUrl: string }>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  const [formData, setFormData] = useState({
    brandId: '',
    modelId: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    fuelType: '',
    transmission: '',
    seats: 5,
    requiredLicense: '',
    pricePerDay: 0,
    depositAmount: 0,
    dailyKmLimit: null as number | null,
    extraKmCharge: 0,
    currentOdometer: 0,
    critAirRating: '',
    status: '',
  });

  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; file: File; previewUrl: string }>>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // enums is now a static object — no query fired, no introspection needed
  const { enums, brandData, modelData, createCar, uploadImage, deleteCar } = useAddCar(formData.brandId);

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

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'pricePerDay', 'depositAmount', 'dailyKmLimit', 'extraKmCharge', 'currentOdometer', 'seats'].includes(name)
        ? (value === '' ? null : Number(value))
        : value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const nextImages = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...nextImages]);

    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.modelId || !formData.plateNumber || !formData.pricePerDay || formData.currentOdometer === 0) {
      setAlert({ open: true, msg: t('validation.fillRequiredFields'), severity: 'warning' });
      setIsSubmitting(false);
      return;
    }

    if (selectedImages.length === 0) {
      setAlert({ open: true, msg: t('admin.clickToUpload'), severity: 'warning' });
      setIsSubmitting(false);
      return;
    }

    try {
      const carInput = formData;
      const { data } = await createCar({ variables: { input: carInput } });
      const carId = data?.createCar?.id;

      if (carId && selectedImages.length > 0) {
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            await uploadImage({
              variables: { carId, file: selectedImages[i].file, isPrimary: i === primaryImageIndex },
            });
          }
        } catch (err: any) {
          await deleteCar({ variables: { id: carId } });
          throw new Error(t('containerMessages.imageUploadRollback'));
        }
      }

      setAlert({ open: true, msg: t('containerMessages.carAddedSuccess'), severity: 'success' });
      redirectTimeoutRef.current = setTimeout(() => {
        setAlert((prev) => ({ ...prev, open: false }));
        router.push('/admin/cars');
      }, 1500);
    } catch (e: any) {
      setAlert({ open: true, msg: getSafeErrorMessage(e, t('errors.generic')), severity: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <AddCarView
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={setFormData}
        brandData={brandData}
        modelData={modelData}
        enums={enums}
        onInputChange={handleInputChange}
        onImageSelect={handleImageSelect}
        selectedImages={selectedImages}
        primaryImageIndex={primaryImageIndex}
        setPrimaryImageIndex={setPrimaryImageIndex}
        onRemoveNewImage={(idx: number) => {
          setSelectedImages((prev) => {
            const imageToRemove = prev[idx];
            if (imageToRemove) {
              URL.revokeObjectURL(imageToRemove.previewUrl);
            }

            const nextImages = prev.filter((_, i) => i !== idx);
            setPrimaryImageIndex((currentIndex) => {
              if (nextImages.length === 0) return 0;
              if (idx === currentIndex) return 0;
              if (idx < currentIndex) return currentIndex - 1;
              return Math.min(currentIndex, nextImages.length - 1);
            });

            return nextImages;
          });
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
        t={t}
      />
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity}>{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
};