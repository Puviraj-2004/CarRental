'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCars } from '../../hooks/useCar';
import { useAdminCars } from '../../hooks/useAdminCars';
import { AdminCarsView } from './AdminCarsView';

export const AdminCarsContainer: React.FC = () => {
  const { t } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all cars for admin management (100 items limit for admin overview)
  const { cars, loading, error, refetch } = useCars({
    pagination: { page: 1, pageSize: 100 },
  });

  const { executeDelete } = useAdminCars();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await executeDelete(id);
      if (res.data?.deleteCar) {
        await refetch();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminCarsView
      t={t}
      cars={cars}
      loading={loading}
      error={error ? t('common.error') : null}
      onDelete={handleDelete}
      deletingId={deletingId}
    />
  );
};