'use client';

import { cn } from '@/lib/cn';

export interface Tab<T extends string = string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, activeTab, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-1 border-b border-warm-200 dark:border-warm-700', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-b-2 border-coral-500 text-coral-600 dark:text-coral-400'
              : 'text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
