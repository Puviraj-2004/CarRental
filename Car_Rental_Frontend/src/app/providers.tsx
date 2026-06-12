'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
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
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Synchronise stored local selection on mount to prevent SSR hydration hydration mismatches
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    localStorage.setItem('themeMode', nextMode);
  };

  // Generate the custom theme dynamically based on state [1]
  const activeTheme = getTheme(mode);

  return (
    <SessionProvider 
      refetchOnWindowFocus={false}    
      refetchWhenOffline={false}  
      refetchInterval={0}    
    >
      <SessionExpiryGuard />
      <ApolloProvider client={client}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={activeTheme}>
              <CssBaseline />
              <ToastProvider>
                <LanguageProvider>
                  {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
                </LanguageProvider>
              </ToastProvider>
            </ThemeProvider>
          </ThemeModeContext.Provider>
        </AppRouterCacheProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}