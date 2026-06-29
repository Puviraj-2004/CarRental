'use client';

import React, { useEffect, createContext, useContext } from 'react';
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ApolloProvider } from '@apollo/client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import client from '@/lib/apolloClient';
import { getTheme } from '@/lib/theme';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ToastProvider } from '@/lib/ToastContext';

// ─── Theme Mode Context Definition ───────────────────────────────────────────

export interface ThemeModeContextProps {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextProps>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

// ─── Expiry Guard Helper ─────────────────────────────────────────────────────

function SessionExpiryGuard(): null {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return null;
}

// ─── Main Unified Providers Module ───────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  const activeTheme = getTheme('light');

  return (
    <SessionProvider 
      refetchOnWindowFocus={false}    
      refetchWhenOffline={false}  
      refetchInterval={0}    
    >
      <SessionExpiryGuard />
      <ApolloProvider client={client}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeModeContext.Provider value={{ mode: 'light', toggleTheme: () => {} }}>
            <ThemeProvider theme={activeTheme}>
              <CssBaseline />
              <ToastProvider>
                <LanguageProvider>
                  {children}
                </LanguageProvider>
              </ToastProvider>
            </ThemeProvider>
          </ThemeModeContext.Provider>
        </AppRouterCacheProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
