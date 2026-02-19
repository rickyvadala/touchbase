import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variantStyles = {
  default:
    'bg-warm-100 text-warm-700 dark:bg-warm-700 dark:text-warm-200',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  outline:
    'border border-warm-300 text-warm-600 bg-transparent dark:border-warm-600 dark:text-warm-400',
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = 'default',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
