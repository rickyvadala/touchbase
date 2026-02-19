'use client';

import { cn } from '@/lib/cn';
import type { Ping, Contact } from '@touchbase/shared';
import { Bell, PartyPopper } from 'lucide-react';
import { PingCard } from './ping-card';

interface PingListProps {
  pings: (Ping & { contact: Contact })[];
  isLoading?: boolean;
  className?: string;
}

export function PingList({ pings, isLoading = false, className }: PingListProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-coral-500" />
        <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">
          Today&apos;s Pings
        </h2>
        {!isLoading && pings.length > 0 && (
          <span className="rounded-full bg-coral-100 px-2 py-0.5 text-xs font-medium text-coral-700 dark:bg-coral-900/30 dark:text-coral-400">
            {pings.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="mt-3 flex flex-col gap-2">
        {isLoading ? (
          <PingListSkeleton />
        ) : pings.length === 0 ? (
          <PingListEmpty />
        ) : (
          pings.map((ping) => <PingCard key={ping.id} ping={ping} />)
        )}
      </div>
    </div>
  );
}

function PingListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-warm-300 px-6 py-10 dark:border-warm-600">
      <PartyPopper className="h-10 w-10 text-warm-300 dark:text-warm-600" />
      <h3 className="mt-3 text-sm font-medium text-warm-900 dark:text-warm-50">
        No pings for today!
      </h3>
      <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
        You&apos;re all caught up.
      </p>
    </div>
  );
}

function PingListSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl border border-warm-200 bg-white p-3 dark:border-warm-700 dark:bg-warm-800 sm:p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-warm-200 dark:bg-warm-700" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-warm-200 dark:bg-warm-700" />
            <div className="h-3 w-20 rounded bg-warm-100 dark:bg-warm-700/50" />
          </div>
          <div className="flex gap-1">
            <div className="h-8 w-8 rounded-lg bg-warm-100 dark:bg-warm-700/50" />
            <div className="h-8 w-8 rounded-lg bg-warm-100 dark:bg-warm-700/50" />
            <div className="h-8 w-8 rounded-lg bg-warm-100 dark:bg-warm-700/50" />
          </div>
        </div>
      ))}
    </>
  );
}
