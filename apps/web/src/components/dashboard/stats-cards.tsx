'use client';

import { cn } from '@/lib/cn';
import { Users, HeartPulse, AlertTriangle, Bell } from 'lucide-react';

interface StatsCardsProps {
  totalContacts: number;
  healthyContacts: number;
  needsAttention: number;
  overduePings: number;
  className?: string;
}

const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Contacts',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    key: 'healthy',
    label: 'Healthy',
    icon: HeartPulse,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    key: 'attention',
    label: 'Needs Attention',
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    key: 'overdue',
    label: 'Overdue Pings',
    icon: Bell,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
] as const;

export function StatsCards({
  totalContacts,
  healthyContacts,
  needsAttention,
  overduePings,
  className,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    total: totalContacts,
    healthy: healthyContacts,
    attention: needsAttention,
    overdue: overduePings,
  };

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4',
        className
      )}
    >
      {STATS_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const value = values[stat.key] ?? 0;

        return (
          <div
            key={stat.key}
            className="rounded-xl border border-warm-200 bg-white p-4 dark:border-warm-700 dark:bg-warm-800"
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  stat.bgColor
                )}
              >
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-warm-900 dark:text-warm-50">
              {value}
            </p>
            <p className="mt-0.5 text-xs text-warm-500 dark:text-warm-400">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
