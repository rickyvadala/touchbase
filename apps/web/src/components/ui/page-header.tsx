import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">{title}</h1>
      {action}
    </div>
  );
}
