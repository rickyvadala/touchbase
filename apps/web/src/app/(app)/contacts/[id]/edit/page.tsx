'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContact, useUpdateContact } from '@/hooks/use-contacts';
import { ContactForm } from '@/components/contacts/contact-form';
import { BackLink } from '@/components/ui/back-link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateContactReq } from '@touchbase/shared';

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading } = useContact(id);
  const updateContact = useUpdateContact();
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateContactReq) => {
    setError('');
    try {
      await updateContact.mutateAsync({ id, data });
      router.push(`/contacts/${id}`);
    } catch {
      setError('Failed to update contact. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-warm-500 dark:text-warm-400">Contact not found.</p>
        <Link href="/contacts" className="mt-4">
          <Button variant="secondary">Back to contacts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink href={`/contacts/${id}`} label={`Back to ${contact.firstName}`} />
      <PageHeader title="Edit Contact" />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <ContactForm
        contact={contact}
        onSubmit={handleSubmit}
        isSubmitting={updateContact.isPending}
        cancelHref={`/contacts/${id}`}
      />
    </div>
  );
}
