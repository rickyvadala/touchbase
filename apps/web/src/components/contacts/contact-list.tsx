'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useContacts } from '@/hooks/use-contacts';
import type { Contact, ContactSortField } from '@touchbase/shared';
import { Search, SlidersHorizontal, Users, ChevronDown } from 'lucide-react';
import { ContactCard } from './contact-card';

const CIRCLE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'inner', label: 'Inner Circle' },
  { id: 'key', label: 'Key' },
  { id: 'extended', label: 'Extended' },
  { id: 'dormant', label: 'Dormant' },
] as const;

const SORT_OPTIONS: { value: ContactSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'healthScore', label: 'Health Score' },
  { value: 'lastInteractionAt', label: 'Last Interaction' },
  { value: 'nextPingAt', label: 'Next Ping' },
];

interface ContactListProps {
  onContactClick?: (contact: Contact) => void;
  className?: string;
}

export function ContactList({ onContactClick, className }: ContactListProps) {
  const [search, setSearch] = useState('');
  const [circleFilter, setCircleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<ContactSortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data, isLoading, error } = useContacts({
    search: search || undefined,
    circleId: circleFilter === 'all' ? undefined : circleFilter,
    sortBy,
    sortOrder,
  });

  const contacts = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-warm-200 bg-white py-2.5 pl-10 pr-4 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
        />
      </div>

      {/* Circle filter tabs */}
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {CIRCLE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCircleFilter(tab.id)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              circleFilter === tab.id
                ? 'bg-coral-500 text-white'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-700 dark:text-warm-300 dark:hover:bg-warm-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort control */}
      <div className="relative mt-3 flex items-center justify-between">
        <span className="text-xs text-warm-500 dark:text-warm-400">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-warm-500 transition-colors hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-700"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-warm-200 bg-white py-1 shadow-lg dark:border-warm-700 dark:bg-warm-800">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (sortBy === option.value) {
                        setSortOrder((prev) =>
                          prev === 'asc' ? 'desc' : 'asc'
                        );
                      } else {
                        setSortBy(option.value);
                        setSortOrder('asc');
                      }
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-warm-50 dark:hover:bg-warm-700',
                      sortBy === option.value
                        ? 'font-medium text-coral-600 dark:text-coral-400'
                        : 'text-warm-700 dark:text-warm-300'
                    )}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <span className="text-[10px] text-warm-400">
                        {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact list */}
      <div className="mt-3 flex flex-col gap-2">
        {isLoading ? (
          <ContactListSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load contacts. Please try again.
            </p>
          </div>
        ) : contacts.length === 0 ? (
          <ContactListEmpty hasSearch={!!search || circleFilter !== 'all'} />
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={onContactClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ContactListEmpty({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-warm-300 px-6 py-12 dark:border-warm-600">
      <Users className="h-10 w-10 text-warm-300 dark:text-warm-600" />
      <h3 className="mt-3 text-sm font-medium text-warm-900 dark:text-warm-50">
        {hasSearch ? 'No contacts found' : 'No contacts yet'}
      </h3>
      <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
        {hasSearch
          ? 'Try adjusting your search or filters.'
          : 'Add your first contact to get started.'}
      </p>
    </div>
  );
}

function ContactListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl border border-warm-200 bg-white p-3 dark:border-warm-700 dark:bg-warm-800 sm:gap-4 sm:p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-warm-200 dark:bg-warm-700 sm:h-12 sm:w-12" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-warm-200 dark:bg-warm-700" />
            <div className="h-3 w-48 rounded bg-warm-100 dark:bg-warm-700/50" />
          </div>
          <div className="hidden flex-col items-end gap-1.5 sm:flex">
            <div className="h-3 w-8 rounded bg-warm-200 dark:bg-warm-700" />
            <div className="h-3 w-16 rounded bg-warm-100 dark:bg-warm-700/50" />
          </div>
        </div>
      ))}
    </>
  );
}
