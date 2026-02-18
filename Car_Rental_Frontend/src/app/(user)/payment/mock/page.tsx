import React, { Suspense } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';
import ClientMockPayment from './ClientMockPayment';

// Server component wrapper - renders the client component inside Suspense
export default function MockPaymentPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress size={40} sx={{ color: '#0F172A' }} />
          </Box>
        </Container>
      }
    >
      <ClientMockPayment />
    </Suspense>
  );
}
