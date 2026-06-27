import React from 'react';
import { AppFrame } from '@/components/layout/AppFrame/AppFrame';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame>{children}</AppFrame>
  );
}
