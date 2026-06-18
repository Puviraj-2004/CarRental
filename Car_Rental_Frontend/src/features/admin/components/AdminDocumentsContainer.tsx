'use client';

import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { AdminDocumentsView } from './AdminDocumentsView';

export const GET_BOOKING_DOCUMENTS_QUERY = gql`
  query GetBookingDocuments($bookingId: ID!) {
    bookingDocuments(bookingId: $bookingId) {
      id
      userId
      bookingId
      licenseFrontUrl
      licenseBackUrl
      idCardFrontUrl
      idCardBackUrl
      addressProofUrl
      licenseNumber
      licenseExpiry
      age
      idNumber
      idExpiry
      address
      status
    }
  }
`;

export const ADMIN_VERIFY_DOCUMENTS_MUTATION = gql`
  mutation AdminVerifyDocuments($userId: ID!, $status: VerificationStatus!) {
    adminVerifyDocuments(userId: $userId, status: $status) {
      id
      status
    }
  }
`;

export const AdminDocumentsContainer: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  // 1. Fetch user documents linked to this bookingId [1]
  const { data, loading, error, refetch } = useQuery(GET_BOOKING_DOCUMENTS_QUERY, {
    variables: { bookingId },
    fetchPolicy: 'network-only',
  });

  // 2. Verification Mutation (Enforces UNAUTHENTICATED error codes securely) [1]
  const [adminVerifyDocuments, { loading: loadingMutation }] = useMutation(
    ADMIN_VERIFY_DOCUMENTS_MUTATION
  );

  const handleVerify = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminVerifyDocuments({
        variables: { userId, status },
      });
      showToast(`Identity documents successfully marked as ${status}.`, 'success');
      await refetch();
      router.push('/admin/bookings'); // Safe redirect back to queue [1]
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Verification failed.', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.bookingDocuments) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">This customer has not uploaded their verification documents yet [1].</Alert>
      </Box>
    );
  }

  return (
    <AdminDocumentsView
      t={t}
      documents={data.bookingDocuments}
      onVerify={handleVerify}
      loading={loadingMutation}
    />
  );
};