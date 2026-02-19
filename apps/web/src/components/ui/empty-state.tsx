import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-warm-400 dark:text-warm-500">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-warm-900 dark:text-warm-100">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-warm-500 dark:text-warm-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
