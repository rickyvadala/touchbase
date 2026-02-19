'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContacts } from '@/hooks/use-contacts';
import { ContactCard } from '@/components/contacts/contact-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Search, Users } from 'lucide-react';
import type { Contact, ListContactsParams } from '@touchbase/shared';

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ListContactsParams['sortBy']>('name');

  const { data, isLoading, error } = useContacts({
    search: search || undefined,
    sortBy,
    sortOrder: sortBy === 'healthScore' ? 'asc' : 'asc',
  });

  const contacts = data?.data ?? [];

  const handleContactClick = (contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">
          Contacts
        </h1>
        <Link href="/contacts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </div>

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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as ListContactsParams['sortBy'])}
          className="min-h-[44px] rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-700 transition-colors focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 dark:border-warm-600 dark:bg-warm-800 dark:text-warm-200 dark:focus:border-coral-400"
        >
          <option value="name">Name</option>
          <option value="healthScore">Health</option>
          <option value="lastInteractionAt">Last Contact</option>
          <option value="nextPingAt">Next Ping</option>
        </select>
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
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={handleContactClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
