'use client';

import { cn } from '@/lib/cn';
import { getContactInitials } from '@touchbase/utils';
import { Cake, Gift } from 'lucide-react';

interface BirthdayContact {
  id: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  date: string;
}

interface UpcomingBirthdaysProps {
  birthdays: BirthdayContact[];
  className?: string;
}

function formatBirthdayDate(dateStr: string): string {
  // dateStr is MM-DD or YYYY-MM-DD
  const parts = dateStr.split('-');
  let month: number;
  let day: number;

  if (parts.length === 2) {
    month = parseInt(parts[0], 10) - 1;
    day = parseInt(parts[1], 10);
  } else {
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  }

  const now = new Date();
  const thisYear = now.getFullYear();
  let target = new Date(thisYear, month, day);

  // If date has passed this year, show next year
  if (target.getTime() < now.getTime() - 86400000) {
    target = new Date(thisYear + 1, month, day);
  }

  const diffDays = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;

  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UpcomingBirthdays({
  birthdays,
  className,
}: UpcomingBirthdaysProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cake className="h-5 w-5 text-pink-500" />
        <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">
          Upcoming Birthdays
        </h2>
      </div>

      {/* List */}
      <div className="mt-3">
        {birthdays.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-warm-300 px-6 py-8 dark:border-warm-600">
            <Gift className="h-8 w-8 text-warm-300 dark:text-warm-600" />
            <p className="mt-2 text-xs text-warm-500 dark:text-warm-400">
              No upcoming birthdays in the next 30 days.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {birthdays.map((bday) => {
              const initials = getContactInitials(bday);
              const displayDate = formatBirthdayDate(bday.date);
              const isToday = displayDate === 'Today!';

              return (
                <div
                  key={bday.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-all',
                    isToday
                      ? 'border-pink-200 bg-pink-50 dark:border-pink-900/50 dark:bg-pink-900/10'
                      : 'border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-800'
                  )}
                >
                  {/* Avatar */}
                  {bday.photoURL ? (
                    <img
                      src={bday.photoURL}
                      alt={`${bday.firstName} ${bday.lastName}`}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral-100 text-xs font-semibold text-coral-600 dark:bg-coral-900/30 dark:text-coral-400">
                      {initials}
                    </div>
                  )}

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-warm-900 dark:text-warm-50">
                      {bday.firstName} {bday.lastName}
                    </p>
                  </div>

                  {/* Date badge */}
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      isToday
                        ? 'bg-pink-200 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
                        : 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-300'
                    )}
                  >
                    {displayDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
