import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'CarRental — Premium Fleet',
  description: 'Rent luxury and verified cars with instant AI verification.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning translate="no">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}