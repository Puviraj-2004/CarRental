'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface PageErrorProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageError({ message, actionLabel, onAction }: PageErrorProps) {
  return (
    <Box sx={{ py: 3 }}>
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        <Stack spacing={2} alignItems="flex-start">
          <span>{message}</span>
          {actionLabel && onAction ? (
            <Button variant="outlined" color="error" onClick={onAction} sx={{ fontWeight: 800, textTransform: 'none' }}>
              {actionLabel}
            </Button>
          ) : null}
        </Stack>
      </Alert>
    </Box>
  );
}
