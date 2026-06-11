'use client';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function CustomerPaymentPage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}