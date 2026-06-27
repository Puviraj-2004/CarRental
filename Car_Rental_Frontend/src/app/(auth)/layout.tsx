// src/app/(auth)/layout.tsx
import React from 'react';
import { Box } from '@mui/material';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      overflow: 'auto',
      bgcolor: 'background.default',
    }}>
      {children}
    </Box>
  );
}
