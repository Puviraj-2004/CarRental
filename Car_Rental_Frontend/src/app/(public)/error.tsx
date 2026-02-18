'use client';

import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GlobalErrorBoundary error={error} reset={reset} variant="default" />;
}
