'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
            We hit an unexpected error. Don&apos;t worry, your data is safe.
            Please try again.
          </p>

          {error.digest && (
            <p className="mt-2 font-mono text-xs text-warm-400 dark:text-warm-500">
              Error ID: {error.digest}
            </p>
          )}

          <Button onClick={reset} className="mt-6">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
