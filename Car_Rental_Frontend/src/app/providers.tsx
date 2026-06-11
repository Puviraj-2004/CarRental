'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ApolloProvider } from '@apollo/client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import client from '@/lib/apolloClient';
import theme from '@/lib/theme';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ToastProvider } from '@/lib/ToastContext';

/**
 * Automatically intercepts failed JWT rotations.
 * If the refresh token has expired (typically after 30 days of inactivity),
 * it signs the user out cleanly and redirects them to the login screen.
 */
function SessionExpiryGuard(): null {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ⚡ PERFORMANCE FIX: Prevents redundant background session polling
    <SessionProvider 
      refetchOnWindowFocus={false}    
      refetchWhenOffline={false}  
      refetchInterval={0}    
    >
      <SessionExpiryGuard />
      <ApolloProvider client={client}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
            </ToastProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}