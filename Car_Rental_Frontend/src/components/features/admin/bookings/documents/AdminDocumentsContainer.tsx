'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import { CREATE_OR_UPDATE_VERIFICATION_MUTATION, VERIFY_DRIVER_PROFILE_MUTATION } from '@/lib/graphql/mutations';
import { AdminDocumentsView } from './AdminDocumentsView';
import { useTranslation } from '@/lib/LanguageContext';

interface AdminDocumentsContainerProps {
  bookingId: string;
}

export const AdminDocumentsContainer = ({ bookingId }: AdminDocumentsContainerProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch booking data
  const { data, loading, error, refetch } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [verifyDocMutation] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const [createOrUpdateVerification] = useMutation(CREATE_OR_UPDATE_VERIFICATION_MUTATION, {
    onCompleted: () => refetch(),
  });

  // Action handlers
  const handleApprove = async () => {
    try {
      await verifyDocMutation({
        variables: {
          userId: bookingId, // Note: backend uses bookingId but param is named userId
          status: 'APPROVED',
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(t('admin.failedToApprove'));
    }
  };

  const handleUpload = async (files: {
    licenseFrontFile?: File | null;
    licenseBackFile?: File | null;
    idCardFile?: File | null;
    idCardBackFile?: File | null;
    addressProofFile?: File | null;
  }) => {
    try {
      await createOrUpdateVerification({
        variables: {
          input: {
            bookingId,
            licenseFrontFile: files.licenseFrontFile || undefined,
            licenseBackFile: files.licenseBackFile || undefined,
            idCardFile: files.idCardFile || undefined,
            idCardBackFile: files.idCardBackFile || undefined,
            addressProofFile: files.addressProofFile || undefined,
          },
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(t('admin.failedToUploadDocuments'));
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await verifyDocMutation({
        variables: {
          userId: bookingId,
          status: 'REJECTED',
          reason,
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(t('admin.failedToReject'));
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography color="error" variant="h6">
            {t('admin.failedToLoadBooking')}
          </Typography>
          <Typography color="text.secondary">{t('errors.generic')}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            {t('admin.goBack')}
          </Button>
        </Stack>
      </Box>
    );
  }

  // Not found state
  if (!data?.booking) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">{t('admin.bookingNotFound')}</Typography>
          <Typography color="text.secondary">{t('admin.bookingNotFoundDesc')}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            {t('admin.goBack')}
          </Button>
        </Stack>
      </Box>
    );
  }

  const actions = {
    approve: handleApprove,
    reject: handleReject,
    upload: handleUpload,
    refresh: refetch,
  };

  return (
    <AdminDocumentsView
      booking={data.booking}
      actions={actions}
      onBack={handleBack}
      t={t}
    />
  );
};

export default AdminDocumentsContainer;
