'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PageLoaderProps {
  label?: string;
  minHeight?: number | string;
}

export function PageLoader({ label, minHeight = '60vh' }: PageLoaderProps) {
  return (
    <Stack minHeight={minHeight} alignItems="center" justifyContent="center" spacing={2}>
      <CircularProgress />
      {label ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      ) : null}
    </Stack>
  );
}
