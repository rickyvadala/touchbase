'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CirclePicker } from '@/components/ui/circle-picker';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CHANNEL_TYPES,
  SPECIAL_DATE_TYPES,
  CHANNEL_ICON_MAP,
  birthdayToStorage,
  birthdayToInput,
} from '@/lib/constants';
import { CreateContactSchema } from '@touchbase/shared';
import { Plus, Trash2, AlertCircle, Calendar } from 'lucide-react';
import type {
  Contact,
  ContactChannel,
  ContactChannelType,
  SpecialDate,
  CreateContactReq,
} from '@touchbase/shared';

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: CreateContactReq) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelHref?: string;
}

interface FormErrors {
  [key: string]: string;
}

const CHANNEL_OPTIONS = CHANNEL_TYPES.map((c) => ({ value: c.value, label: c.label }));
const SPECIAL_DATE_OPTIONS = SPECIAL_DATE_TYPES.map((d) => ({ value: d.value, label: d.label }));

function channelPlaceholder(type: ContactChannelType): string {
  if (type === 'phone') return '+1 (555) 123-4567';
  if (type === 'email') return 'jane@example.com';
  return 'Username or URL';
}

export function ContactForm({
  contact,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  cancelHref,
}: ContactFormProps) {
  const isEdit = !!contact;
  const resolvedSubmitLabel = submitLabel ?? (isEdit ? 'Save Changes' : 'Create Contact');

  // Form state
  const [firstName, setFirstName] = useState(contact?.firstName ?? '');
  const [lastName, setLastName] = useState(contact?.lastName ?? '');
  const [company, setCompany] = useState(contact?.company ?? '');
  const [role, setRole] = useState(contact?.role ?? '');
  const [circleId, setCircleId] = useState(contact?.circleId ?? 'key');
  const [tagsInput, setTagsInput] = useState(contact?.tags.join(', ') ?? '');
  const [notes, setNotes] = useState(contact?.notes ?? '');
  const [howWeMet, setHowWeMet] = useState(contact?.howWeMet ?? '');
  const [channels, setChannels] = useState<ContactChannel[]>(contact?.channels ?? []);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(() => {
    if (!contact?.specialDates.length) return [];
    // Convert stored MM-DD birthday dates to YYYY-MM-DD for the date input
    return contact.specialDates.map((sd) =>
      sd.type === 'birthday' ? { ...sd, date: birthdayToInput(sd.date) } : sd
    );
  });
  const [customFrequencyDays, setCustomFrequencyDays] = useState(
    contact?.customFrequencyDays?.toString() ?? ''
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Channel management
  const addChannel = () => setChannels((prev) => [...prev, { type: 'phone', value: '' }]);
  const updateChannel = (i: number, field: keyof ContactChannel, value: string) =>
    setChannels((prev) => prev.map((ch, idx) => (idx === i ? { ...ch, [field]: value } : ch)));
  const removeChannel = (i: number) => setChannels((prev) => prev.filter((_, idx) => idx !== i));

  // Special date management
  const addSpecialDate = () => setSpecialDates((prev) => [...prev, { type: 'birthday', date: '' }]);
  const updateSpecialDate = (i: number, field: keyof SpecialDate, value: string) =>
    setSpecialDates((prev) => prev.map((sd, idx) => (idx === i ? { ...sd, [field]: value } : sd)));
  const removeSpecialDate = (i: number) => setSpecialDates((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    // Convert special dates for storage (birthday YYYY-MM-DD -> MM-DD)
    const storageDates = specialDates
      .filter((sd) => sd.date.trim())
      .map((sd) =>
        sd.type === 'birthday'
          ? { ...sd, date: birthdayToStorage(sd.date) }
          : sd
      );

    const formData: CreateContactReq = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim() || undefined,
      role: role.trim() || undefined,
      circleId,
      tags,
      notes: notes.trim(),
      howWeMet: howWeMet.trim() || undefined,
      channels: channels.filter((ch) => ch.value.trim()),
      specialDates: storageDates,
      customFrequencyDays: customFrequencyDays ? parseInt(customFrequencyDays, 10) : undefined,
    };

    const result = CreateContactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data as CreateContactReq);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required error={errors.firstName} />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
            <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Product Manager" />
          </div>
        </CardContent>
      </Card>

      {/* Circle */}
      <Card>
        <CardHeader><CardTitle>Circle</CardTitle></CardHeader>
        <CardContent>
          <CirclePicker value={circleId} onChange={setCircleId} />
          {errors.circleId && (
            <p className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400"><AlertCircle className="h-3 w-3" />{errors.circleId}</p>
          )}
        </CardContent>
      </Card>

      {/* Contact Channels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Channels</CardTitle>
            <button type="button" onClick={addChannel} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-coral-600 transition-colors hover:bg-coral-50 dark:text-coral-400 dark:hover:bg-coral-900/20">
              <Plus className="h-3 w-3" />Add Channel
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {channels.length === 0 ? (
            <p className="rounded-lg border border-dashed border-warm-300 px-3 py-4 text-center text-xs text-warm-400 dark:border-warm-600 dark:text-warm-500">No channels added yet.</p>
          ) : (
            channels.map((channel, i) => {
              const Icon = CHANNEL_ICON_MAP[channel.type];
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex shrink-0 items-center justify-center text-warm-400"><Icon className="h-4 w-4" /></div>
                  <Select value={channel.type} onChange={(e) => updateChannel(i, 'type', e.target.value)} options={CHANNEL_OPTIONS} className="w-28 shrink-0" />
                  <Input value={channel.value} onChange={(e) => updateChannel(i, 'value', e.target.value)} placeholder={channelPlaceholder(channel.type as ContactChannelType)} className="min-w-0 flex-1" />
                  <button type="button" onClick={() => removeChannel(i)} className="shrink-0 rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400" aria-label="Remove channel">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
          {errors.channels && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.channels}</p>
          )}
        </CardContent>
      </Card>

      {/* Special Dates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Special Dates</CardTitle>
            <button type="button" onClick={addSpecialDate} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-coral-600 transition-colors hover:bg-coral-50 dark:text-coral-400 dark:hover:bg-coral-900/20">
              <Plus className="h-3 w-3" />Add Date
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {specialDates.length === 0 ? (
            <p className="rounded-lg border border-dashed border-warm-300 px-3 py-4 text-center text-xs text-warm-400 dark:border-warm-600 dark:text-warm-500">No special dates added yet.</p>
          ) : (
            specialDates.map((sd, i) => {
              const DateIcon = SPECIAL_DATE_TYPES.find((t) => t.value === sd.type)?.icon ?? Calendar;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex shrink-0 items-center justify-center text-warm-400"><DateIcon className="h-4 w-4" /></div>
                  <Select value={sd.type} onChange={(e) => updateSpecialDate(i, 'type', e.target.value)} options={SPECIAL_DATE_OPTIONS} className="w-36 shrink-0" />
                  <Input type="date" value={sd.date} onChange={(e) => updateSpecialDate(i, 'date', e.target.value)} className="min-w-0 flex-1" />
                  {sd.type === 'custom' && (
                    <Input value={sd.label ?? ''} onChange={(e) => updateSpecialDate(i, 'label', e.target.value)} placeholder="Label" className="w-24 shrink-0" />
                  )}
                  <button type="button" onClick={() => removeSpecialDate(i)} className="shrink-0 rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400" aria-label="Remove special date">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
          {errors.specialDates && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.specialDates}</p>
          )}
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="How did you meet?" value={howWeMet} onChange={(e) => setHowWeMet(e.target.value)} placeholder="Conference, mutual friend, work..." />
          <Input label="Tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="friend, colleague, mentor (comma-separated)" hint="Separate tags with commas" />
          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember..." rows={3} />
          <Input label="Custom frequency (days)" type="number" min={1} value={customFrequencyDays} onChange={(e) => setCustomFrequencyDays(e.target.value)} placeholder="Leave blank to use circle default" hint="Override the circle's default reminder frequency." />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>{resolvedSubmitLabel}</Button>
        {cancelHref && (
          <a href={cancelHref}>
            <Button type="button" variant="ghost">Cancel</Button>
          </a>
        )}
      </div>
    </form>
  );
}
