'use client';

import { cn } from '@/lib/cn';
import type { Interaction, InteractionType } from '@touchbase/shared';
import { formatRelativeTime } from '@touchbase/utils';
import {
  Phone,
  MessageSquare,
  Mail,
  Coffee,
  UtensilsCrossed,
  Calendar,
  Gift,
  UserPlus,
  Heart,
  MoreHorizontal,
  MessageCircle,
} from 'lucide-react';

const INTERACTION_ICONS: Record<InteractionType, React.ElementType> = {
  call: Phone,
  text: MessageSquare,
  email: Mail,
  coffee: Coffee,
  meal: UtensilsCrossed,
  event: Calendar,
  gift: Gift,
  introduction: UserPlus,
  favor: Heart,
  other: MoreHorizontal,
};

const INTERACTION_COLORS: Record<InteractionType, string> = {
  call: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  text: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  email: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  coffee: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  meal: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  event: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  gift: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  introduction: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  favor: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  other: 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-400',
};

const INTERACTION_LABELS: Record<InteractionType, string> = {
  call: 'Phone Call',
  text: 'Text Message',
  email: 'Email',
  coffee: 'Coffee',
  meal: 'Meal',
  event: 'Event',
  gift: 'Gift',
  introduction: 'Introduction',
  favor: 'Favor',
  other: 'Other',
};

interface InteractionTimelineProps {
  interactions: Interaction[];
  className?: string;
}

export function InteractionTimeline({
  interactions,
  className,
}: InteractionTimelineProps) {
  const sorted = [...interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-warm-300 px-6 py-12 dark:border-warm-600',
          className
        )}
      >
        <MessageCircle className="h-10 w-10 text-warm-300 dark:text-warm-600" />
        <h3 className="mt-3 text-sm font-medium text-warm-900 dark:text-warm-50">
          No interactions yet
        </h3>
        <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
          Log your first interaction to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-warm-200 dark:bg-warm-700" />

      <div className="space-y-4">
        {sorted.map((interaction) => {
          const Icon = INTERACTION_ICONS[interaction.type];
          const colorClass = INTERACTION_COLORS[interaction.type];
          const label = INTERACTION_LABELS[interaction.type];

          return (
            <div key={interaction.id} className="relative flex gap-3 pl-1">
              {/* Icon bubble */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 rounded-lg border border-warm-200 bg-white p-3 dark:border-warm-700 dark:bg-warm-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-warm-900 dark:text-warm-50">
                    {label}
                  </span>
                  <span className="shrink-0 text-xs text-warm-400 dark:text-warm-500">
                    {formatRelativeTime(interaction.date)}
                  </span>
                </div>
                {interaction.notes && (
                  <p className="mt-1.5 text-sm text-warm-600 dark:text-warm-400">
                    {interaction.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
