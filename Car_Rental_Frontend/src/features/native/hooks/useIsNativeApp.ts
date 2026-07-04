'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export const useIsNativeApp = (): boolean => {
  const [isNativeApp, setIsNativeApp] = useState(() => (
    typeof window !== 'undefined' && Capacitor.isNativePlatform()
  ));

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
  }, []);

  return isNativeApp;
};
