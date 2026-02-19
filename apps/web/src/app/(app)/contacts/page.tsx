'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useContacts } from '@/hooks/use-contacts';
import { ContactCard } from '@/components/contacts/contact-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Plus, Search, Users } from 'lucide-react';
import type { ListContactsParams } from '@touchbase/shared';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'healthScore', label: 'Health' },
  { value: 'lastInteractionAt', label: 'Last Contact' },
  { value: 'nextPingAt', label: 'Next Ping' },
];

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ListContactsParams['sortBy']>('name');

  const { data, isLoading, error } = useContacts({
    search: search || undefined,
    sortBy,
    sortOrder: 'asc',
  });

  const contacts = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Contacts"
        action={
          <Link href="/contacts/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </Link>
        }
      />

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400 dark:text-warm-500" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as ListContactsParams['sortBy'])}
          options={SORT_OPTIONS}
          className="w-auto flex-shrink-0"
        />
      </div>

      {/* Contact List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-warm-500 dark:text-warm-400">
            Failed to load contacts. Please try again.
          </p>
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title={search ? 'No contacts found' : 'No contacts yet'}
          description={
            search
              ? `No contacts match "${search}". Try a different search.`
              : 'Add your first contact to start building your network.'
          }
          action={
            !search ? (
              <Link href="/contacts/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Add your first contact
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`}>
              <ContactCard contact={contact} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
