'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SignInPage() {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50 px-4 dark:bg-warm-900">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center px-8 py-10">
          {/* Logo / App Name */}
          <div className="mb-2 flex items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500">
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <circle cx="12" cy="10" r="2" />
                <line x1="8" x2="8" y1="2" y2="4" />
                <line x1="16" x2="16" y1="2" y2="4" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">
            Touch<span className="text-coral-500">Base</span>
          </h1>

          <p className="mt-2 text-center text-sm text-warm-500 dark:text-warm-400">
            Stay in touch with the people who matter
          </p>

          {/* Divider */}
          <div className="my-8 w-full border-t border-warm-200 dark:border-warm-700" />

          {/* Google sign-in button */}
          <Button
            onClick={handleGoogleSignIn}
            variant="secondary"
            fullWidth
            className="gap-3"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-warm-400 dark:text-warm-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
