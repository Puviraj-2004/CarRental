'use client';

/**
 * Root-level error boundary — catches errors outside route group layouts.
 * Must include <html> and <body> since it replaces the entire root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Roboto, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: 440, textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
              }}
            >
              ⚠
            </div>
            <h2 style={{ color: '#0F172A', fontWeight: 800, margin: '0 0 8px', fontSize: '1.5rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#64748B', margin: '0 0 24px', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {'An unexpected error occurred. Please try again.'}
            </p>
            {error.digest && (
              <p style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.7rem', margin: '0 0 24px' }}>
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#0F172A',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
