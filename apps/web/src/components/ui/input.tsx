import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = 'text', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1.5 block text-sm font-medium text-warm-700',
              'dark:text-warm-300'
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 text-base transition-colors duration-150',
            'placeholder:text-warm-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[44px]',
            error
              ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:text-red-400'
              : 'border-warm-300 text-warm-900 focus:border-coral-500 focus:ring-coral-500/20 dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100 dark:focus:border-coral-400',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-sm text-warm-500 dark:text-warm-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
