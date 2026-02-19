'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Ping, Contact } from '@touchbase/shared';
import { useActOnPing } from '@/hooks/use-pings';
import {
  getContactName,
  getContactInitials,
  formatRelativeTime,
} from '@touchbase/utils';
import { Check, X, Clock, Loader2 } from 'lucide-react';

interface PingCardProps {
  ping: Ping & { contact: Contact };
  className?: string;
}

export function PingCard({ ping, className }: PingCardProps) {
  const [showSnoozePicker, setShowSnoozePicker] = useState(false);
  const [snoozeDate, setSnoozeDate] = useState('');
  const actOnPing = useActOnPing();

  const contact = ping.contact;
  const name = getContactName(contact);
  const initials = getContactInitials(contact);

  const handleComplete = () => {
    actOnPing.mutate({ id: ping.id, data: { action: 'complete' } });
  };

  const handleSkip = () => {
    actOnPing.mutate({ id: ping.id, data: { action: 'skip' } });
  };

  const handleSnooze = () => {
    if (!snoozeDate) return;
    actOnPing.mutate({
      id: ping.id,
      data: {
        action: 'snooze',
        snoozedUntil: new Date(snoozeDate).toISOString(),
      },
    });
    setShowSnoozePicker(false);
  };

  const isPending = actOnPing.isPending;

  return (
    <div
      className={cn(
        'rounded-xl border border-warm-200 bg-white p-3 transition-all dark:border-warm-700 dark:bg-warm-800 sm:p-4',
        isPending && 'opacity-60',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {contact.photoURL ? (
          <img
            src={contact.photoURL}
            alt={name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-100 text-sm font-semibold text-coral-600 dark:bg-coral-900/30 dark:text-coral-400">
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-warm-900 dark:text-warm-50">
            {name}
          </h3>
          <p className="text-xs text-warm-400 dark:text-warm-500">
            Scheduled {formatRelativeTime(ping.scheduledDate)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-warm-400" />
          ) : (
            <>
              <button
                type="button"
                onClick={handleComplete}
                className="rounded-lg p-2 text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                aria-label="Complete ping"
                title="Complete"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg p-2 text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600 dark:hover:bg-warm-700 dark:hover:text-warm-300"
                aria-label="Skip ping"
                title="Skip"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSnoozePicker((prev) => !prev)}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  showSnoozePicker
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'text-warm-400 hover:bg-warm-100 hover:text-warm-600 dark:hover:bg-warm-700 dark:hover:text-warm-300'
                )}
                aria-label="Snooze ping"
                title="Snooze"
              >
                <Clock className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Snooze date picker */}
      {showSnoozePicker && (
        <div className="mt-3 flex items-center gap-2 border-t border-warm-100 pt-3 dark:border-warm-700">
          <Clock className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-xs text-warm-500 dark:text-warm-400">
            Snooze until:
          </span>
          <input
            type="date"
            value={snoozeDate}
            onChange={(e) => setSnoozeDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="min-w-0 flex-1 rounded-lg border border-warm-200 bg-white px-2 py-1 text-xs text-warm-900 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:focus:border-coral-500"
          />
          <button
            type="button"
            onClick={handleSnooze}
            disabled={!snoozeDate}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Snooze
          </button>
        </div>
      )}
    </div>
  );
}
