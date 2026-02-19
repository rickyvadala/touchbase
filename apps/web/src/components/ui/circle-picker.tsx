'use client';

import { cn } from '@/lib/cn';
import { CIRCLE_OPTIONS } from '@/lib/constants';

interface CirclePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CirclePicker({ value, onChange, className }: CirclePickerProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-4', className)}>
      {CIRCLE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
            value === option.value
              ? 'border-coral-500 bg-coral-50 text-coral-700 dark:border-coral-400 dark:bg-coral-950/30 dark:text-coral-300'
              : 'border-warm-200 text-warm-600 hover:border-warm-300 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-600'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
