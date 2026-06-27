import React from 'react';
import { AppFrame } from '@/components/layout/AppFrame/AppFrame';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame>{children}</AppFrame>
  );
}
