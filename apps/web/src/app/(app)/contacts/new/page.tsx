'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateContact } from '@/hooks/use-contacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { CreateContactReq, ContactChannelType, SpecialDateType } from '@touchbase/shared';

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

export default function NewContactPage() {
  const router = useRouter();
  const createContact = useCreateContact();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim()) {
      setFormError('First name is required.');
      return;
    }

    const channels = channelValue.trim()
      ? [{ type: channelType, value: channelValue.trim() }]
      : [];

    const specialDates: { type: SpecialDateType; date: string }[] = [];
    if (birthdayDate) {
      // Convert from YYYY-MM-DD to MM-DD
      const parts = birthdayDate.split('-');
      if (parts.length === 3) {
        specialDates.push({ type: 'birthday', date: `${parts[1]}-${parts[2]}` });
      }
    }

    const contactData: CreateContactReq = {
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
      await createContact.mutateAsync(contactData);
      router.push('/contacts');
    } catch {
      setFormError('Failed to create contact. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1 text-sm font-medium text-warm-600 hover:text-warm-800 dark:text-warm-400 dark:hover:text-warm-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to contacts
      </Link>

      <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">
        Add Contact
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
          <Button type="submit" loading={createContact.isPending}>
            Create Contact
          </Button>
          <Link href="/contacts">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
