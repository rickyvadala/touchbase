'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateContact } from '@/hooks/use-contacts';
import { ContactForm } from '@/components/contacts/contact-form';
import { BackLink } from '@/components/ui/back-link';
import { PageHeader } from '@/components/ui/page-header';
import type { CreateContactReq } from '@touchbase/shared';

export default function NewContactPage() {
  const router = useRouter();
  const createContact = useCreateContact();
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateContactReq) => {
    setError('');
    try {
      await createContact.mutateAsync(data);
      router.push('/contacts');
    } catch {
      setError('Failed to create contact. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <BackLink href="/contacts" label="Back to contacts" />
      <PageHeader title="Add Contact" />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <ContactForm
        onSubmit={handleSubmit}
        isSubmitting={createContact.isPending}
        cancelHref="/contacts"
      />
    </div>
  );
}
