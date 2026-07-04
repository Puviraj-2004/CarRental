'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 5 },
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        {icon ? <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center' }}>{icon}</Box> : null}
        <Typography variant="h6" sx={{ fontWeight: 950 }}>
          {title}
        </Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
        {action ?? null}
        {!action && actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1, fontWeight: 900, textTransform: 'none' }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
