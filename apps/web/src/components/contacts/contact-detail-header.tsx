'use client';

import { cn } from '@/lib/cn';
import type { Contact } from '@touchbase/shared';
import {
  getContactName,
  getContactInitials,
  getHealthColor,
  getHealthBgColor,
} from '@touchbase/utils';
import { Pencil, Trash2, Building2 } from 'lucide-react';

interface ContactDetailHeaderProps {
  contact: Contact;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ContactDetailHeader({
  contact,
  onEdit,
  onDelete,
  className,
}: ContactDetailHeaderProps) {
  const name = getContactName(contact);
  const initials = getContactInitials(contact);
  const healthColor = getHealthColor(contact.healthScore);
  const healthBgColor = getHealthBgColor(contact.healthScore);

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Large avatar */}
        <div className="relative shrink-0">
          {contact.photoURL ? (
            <img
              src={contact.photoURL}
              alt={name}
              className="h-16 w-16 rounded-2xl object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-100 text-xl font-bold text-coral-600 dark:bg-coral-900/30 dark:text-coral-400 sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-warm-900 dark:text-warm-50 sm:text-2xl">
                {name}
              </h1>
              {(contact.company || contact.role) && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {contact.role && contact.company
                      ? `${contact.role} at ${contact.company}`
                      : contact.company || contact.role}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg p-2 text-warm-500 transition-colors hover:bg-warm-100 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-200"
                  aria-label="Edit contact"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg p-2 text-warm-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-warm-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label="Delete contact"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Health score bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={cn('text-lg font-bold', healthColor)}>
                {contact.healthScore}
              </span>
              <span className="text-xs text-warm-400 dark:text-warm-500">
                Health
              </span>
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-warm-100 dark:bg-warm-700">
              <div
                className={cn('h-full rounded-full transition-all', healthBgColor)}
                style={{ width: `${contact.healthScore}%` }}
              />
            </div>
          </div>

          {/* Circle badge & tags */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-coral-100 px-2.5 py-0.5 text-xs font-medium text-coral-700 dark:bg-coral-900/30 dark:text-coral-400">
              {contact.circleId}
            </span>
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-warm-100 px-2.5 py-0.5 text-xs font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
