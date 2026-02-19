'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variantStyles = {
  primary:
    'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 focus-visible:ring-coral-500 disabled:bg-coral-300 dark:disabled:bg-coral-800',
  secondary:
    'bg-warm-100 text-warm-800 hover:bg-warm-200 active:bg-warm-300 focus-visible:ring-warm-400 dark:bg-warm-800 dark:text-warm-100 dark:hover:bg-warm-700 dark:active:bg-warm-600 disabled:opacity-50',
  ghost:
    'bg-transparent text-warm-700 hover:bg-warm-100 active:bg-warm-200 focus-visible:ring-warm-400 dark:text-warm-300 dark:hover:bg-warm-800 dark:active:bg-warm-700 disabled:opacity-50',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-300 dark:disabled:bg-red-900',
} as const;

const sizeStyles = {
  sm: 'min-h-[36px] px-3 py-1.5 text-sm md:min-h-[36px] min-h-[44px]',
  md: 'min-h-[44px] px-4 py-2 text-base',
  lg: 'min-h-[48px] px-6 py-3 text-lg',
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-warm-900',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
