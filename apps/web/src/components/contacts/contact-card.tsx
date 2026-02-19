'use client';

import { cn } from '@/lib/cn';
import type { Contact } from '@touchbase/shared';
import {
  getContactName,
  getContactInitials,
  formatRelativeTime,
  getHealthColor,
  getHealthBgColor,
} from '@touchbase/utils';
import { Building2, Clock } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onClick?: (contact: Contact) => void;
  className?: string;
}

export function ContactCard({ contact, onClick, className }: ContactCardProps) {
  const name = getContactName(contact);
  const initials = getContactInitials(contact);
  const healthColor = getHealthColor(contact.healthScore);
  const healthBgColor = getHealthBgColor(contact.healthScore);

  return (
    <button
      type="button"
      onClick={() => onClick?.(contact)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-warm-200 bg-white p-3 text-left transition-all hover:border-warm-300 hover:shadow-sm active:scale-[0.99] dark:border-warm-700 dark:bg-warm-800 dark:hover:border-warm-600',
        'sm:gap-4 sm:p-4',
        className
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {contact.photoURL ? (
          <img
            src={contact.photoURL}
            alt={name}
            className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100 text-sm font-semibold text-coral-600 dark:bg-coral-900/30 dark:text-coral-400 sm:h-12 sm:w-12 sm:text-base">
            {initials}
          </div>
        )}
        {/* Health dot */}
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-warm-800',
            healthBgColor
          )}
          title={`Health: ${contact.healthScore}`}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-warm-900 dark:text-warm-50 sm:text-base">
            {name}
          </h3>
          {/* Circle badge */}
          <span className="hidden shrink-0 rounded-full bg-warm-100 px-2 py-0.5 text-[10px] font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300 sm:inline-block">
            {contact.circleId}
          </span>
        </div>

        {/* Company / Role */}
        {(contact.company || contact.role) && (
          <div className="mt-0.5 flex items-center gap-1 text-xs text-warm-500 dark:text-warm-400">
            <Building2 className="hidden h-3 w-3 shrink-0 sm:block" />
            <span className="truncate">
              {contact.role && contact.company
                ? `${contact.role} at ${contact.company}`
                : contact.company || contact.role}
            </span>
          </div>
        )}

        {/* Last interaction - mobile visible */}
        {contact.lastInteractionAt && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-warm-400 dark:text-warm-500 sm:hidden">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{formatRelativeTime(contact.lastInteractionAt)}</span>
          </div>
        )}

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="mt-1.5 hidden flex-wrap gap-1 sm:flex">
            {contact.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-warm-100 px-1.5 py-0.5 text-[10px] font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300"
              >
                {tag}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="rounded bg-warm-100 px-1.5 py-0.5 text-[10px] font-medium text-warm-400 dark:bg-warm-700 dark:text-warm-500">
                +{contact.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side - desktop */}
      <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
        {/* Health score */}
        <span className={cn('text-xs font-semibold', healthColor)}>
          {contact.healthScore}%
        </span>

        {/* Last interaction */}
        {contact.lastInteractionAt ? (
          <div className="flex items-center gap-1 text-xs text-warm-400 dark:text-warm-500">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(contact.lastInteractionAt)}</span>
          </div>
        ) : (
          <span className="text-xs text-warm-400 dark:text-warm-500">
            No interactions yet
          </span>
        )}
      </div>
    </button>
  );
}
