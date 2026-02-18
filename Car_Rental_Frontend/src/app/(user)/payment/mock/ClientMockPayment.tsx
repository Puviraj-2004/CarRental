'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { MOCK_FINALIZE_PAYMENT_MUTATION } from '@/lib/graphql/mutations';
import { useTranslation } from '@/lib/LanguageContext';

export default function ClientMockPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { t } = useTranslation();

  const [finalizeMockPayment] = useMutation(MOCK_FINALIZE_PAYMENT_MUTATION);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError(t('payment.missingBookingId'));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await finalizeMockPayment({ variables: { bookingId, success: true } });
        if (cancelled) return;
        router.replace(`/payment/success?bookingId=${bookingId}`);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || t('payment.mockPaymentFailed'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId, finalizeMockPayment, router]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          {t('payment.mockPaymentFailed2')}
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
        {t('payment.processingMockPayment')}
      </Typography>
      <Typography color="text.secondary">{t('payment.pleaseWait')}</Typography>
    </Container>
  );
}
