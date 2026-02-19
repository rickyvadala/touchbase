'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContact, useUpdateContact } from '@/hooks/use-contacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import type {
  UpdateContactReq,
  ContactChannelType,
  ContactChannel,
  SpecialDate,
  SpecialDateType,
} from '@touchbase/shared';

const CIRCLE_OPTIONS = [
  { value: 'inner', label: 'Inner Circle' },
  { value: 'key', label: 'Key Contacts' },
  { value: 'extended', label: 'Extended Network' },
  { value: 'dormant', label: 'Dormant' },
];

const CHANNEL_TYPE_OPTIONS: { value: ContactChannelType; label: string }[] = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'other', label: 'Other' },
];

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading } = useContact(id);
  const updateContact = useUpdateContact();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [circleId, setCircleId] = useState('key');
  const [notes, setNotes] = useState('');
  const [howWeMet, setHowWeMet] = useState('');
  const [tags, setTags] = useState('');
  const [channelType, setChannelType] = useState<ContactChannelType>('phone');
  const [channelValue, setChannelValue] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [formError, setFormError] = useState('');

  // Pre-fill form when contact data loads
  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName);
      setLastName(contact.lastName);
      setCompany(contact.company ?? '');
      setRole(contact.role ?? '');
      setCircleId(contact.circleId);
      setNotes(contact.notes);
      setHowWeMet(contact.howWeMet ?? '');
      setTags(contact.tags.join(', '));

      if (contact.channels.length > 0) {
        setChannelType(contact.channels[0].type);
        setChannelValue(contact.channels[0].value);
      }

      const birthday = contact.specialDates.find((sd) => sd.type === 'birthday');
      if (birthday) {
        // Convert MM-DD to YYYY-MM-DD for the date input (use current year as placeholder)
        const parts = birthday.date.split('-');
        if (parts.length === 2) {
          setBirthdayDate(`2000-${parts[0]}-${parts[1]}`);
        } else {
          setBirthdayDate(birthday.date);
        }
      }
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim()) {
      setFormError('First name is required.');
      return;
    }

    const channels: ContactChannel[] = channelValue.trim()
      ? [{ type: channelType, value: channelValue.trim() }]
      : [];

    const specialDates: SpecialDate[] = [];
    if (birthdayDate) {
      const parts = birthdayDate.split('-');
      if (parts.length === 3) {
        specialDates.push({ type: 'birthday' as SpecialDateType, date: `${parts[1]}-${parts[2]}` });
      }
    }
    // Preserve non-birthday special dates from the original contact
    if (contact) {
      contact.specialDates
        .filter((sd) => sd.type !== 'birthday')
        .forEach((sd) => specialDates.push(sd));
    }

    const updateData: UpdateContactReq = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim() || undefined,
      role: role.trim() || undefined,
      circleId,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim(),
      howWeMet: howWeMet.trim() || undefined,
      channels,
      specialDates,
    };

    try {
      await updateContact.mutateAsync({ id, data: updateData });
      router.push(`/contacts/${id}`);
    } catch {
      setFormError('Failed to update contact. Please try again.');
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
      {/* Back button */}
      <Link
        href={`/contacts/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-warm-600 hover:text-warm-800 dark:text-warm-400 dark:hover:text-warm-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {contact.firstName}
      </Link>

      <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">
        Edit Contact
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                required
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
              />
              <Input
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Product Manager"
              />
            </div>
          </CardContent>
        </Card>

        {/* Circle */}
        <Card>
          <CardHeader>
            <CardTitle>Circle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CIRCLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCircleId(option.value)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    circleId === option.value
                      ? 'border-coral-500 bg-coral-50 text-coral-700 dark:border-coral-400 dark:bg-coral-950/30 dark:text-coral-300'
                      : 'border-warm-200 text-warm-600 hover:border-warm-300 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact channel */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Channel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300">
                  Type
                </label>
                <select
                  value={channelType}
                  onChange={(e) =>
                    setChannelType(e.target.value as ContactChannelType)
                  }
                  className="block min-h-[44px] w-full rounded-lg border border-warm-300 bg-white px-3 py-2 text-base text-warm-900 transition-colors focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100 dark:focus:border-coral-400"
                >
                  {CHANNEL_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Value"
                value={channelValue}
                onChange={(e) => setChannelValue(e.target.value)}
                placeholder={
                  channelType === 'phone'
                    ? '+1 (555) 123-4567'
                    : channelType === 'email'
                      ? 'jane@example.com'
                      : 'Username or URL'
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Birthday"
              type="date"
              value={birthdayDate}
              onChange={(e) => setBirthdayDate(e.target.value)}
            />
            <Input
              label="How did you meet?"
              value={howWeMet}
              onChange={(e) => setHowWeMet(e.target.value)}
              placeholder="Conference, mutual friend, work..."
            />
            <Input
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="friend, colleague, mentor (comma-separated)"
              hint="Separate tags with commas"
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything you want to remember..."
                rows={3}
                className="block min-h-[80px] w-full rounded-lg border border-warm-300 px-3 py-2 text-base text-warm-900 placeholder:text-warm-400 transition-colors focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100 dark:focus:border-coral-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {formError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={updateContact.isPending}>
            Save Changes
          </Button>
          <Link href={`/contacts/${id}`}>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
