'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { MOCK_FINALIZE_PAYMENT_MUTATION } from '@/features/payments/graphql/mutations'; // Updated import path
import { useLanguage } from '@/lib/LanguageContext'; // Updated i18n hook

export default function ClientMockPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { t } = useLanguage(); // Solved import hook

  const [finalizeMockPayment] = useMutation(MOCK_FINALIZE_PAYMENT_MUTATION);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError(t('common.error'));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await finalizeMockPayment({ variables: { bookingId, success: true } });
        if (cancelled) return;
        router.replace(`/payment/success?bookingId=${bookingId}`);
      } catch (e: unknown) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(message || t('common.error'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId, finalizeMockPayment, router, t]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          {t('common.error')}
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <CircularProgress size={40} sx={{ color: '#0F172A' }} />
      </Box>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        {t('common.loading')}
      </Typography>
    </Container>
  );
}