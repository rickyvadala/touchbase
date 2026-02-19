import { cn } from '@/lib/cn';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-warm-200 dark:bg-warm-700',
        className
      )}
      aria-hidden="true"
    />
  );
}
