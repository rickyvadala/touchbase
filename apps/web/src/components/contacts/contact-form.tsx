'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type {
  Contact,
  ContactChannel,
  ContactChannelType,
  SpecialDate,
  SpecialDateType,
  CreateContactReq,
} from '@touchbase/shared';
import { CreateContactSchema } from '@touchbase/shared';
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Link,
  Calendar,
  Gift,
  Heart,
  Briefcase,
} from 'lucide-react';

const CHANNEL_TYPES: { value: ContactChannelType; label: string; icon: React.ElementType }[] = [
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'other', label: 'Other', icon: Link },
];

const SPECIAL_DATE_TYPES: { value: SpecialDateType; label: string; icon: React.ElementType }[] = [
  { value: 'birthday', label: 'Birthday', icon: Gift },
  { value: 'anniversary', label: 'Anniversary', icon: Heart },
  { value: 'work_anniversary', label: 'Work Anniversary', icon: Briefcase },
  { value: 'custom', label: 'Custom', icon: Calendar },
];

const CIRCLE_OPTIONS = [
  { value: 'inner', label: 'Inner Circle' },
  { value: 'key', label: 'Key Contacts' },
  { value: 'extended', label: 'Extended Network' },
  { value: 'dormant', label: 'Dormant' },
];

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: CreateContactReq) => void | Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

interface FormErrors {
  [key: string]: string;
}

export function ContactForm({
  contact,
  onSubmit,
  isSubmitting = false,
  className,
}: ContactFormProps) {
  const isEdit = !!contact;

  // Form state
  const [firstName, setFirstName] = useState(contact?.firstName ?? '');
  const [lastName, setLastName] = useState(contact?.lastName ?? '');
  const [company, setCompany] = useState(contact?.company ?? '');
  const [role, setRole] = useState(contact?.role ?? '');
  const [circleId, setCircleId] = useState(contact?.circleId ?? 'key');
  const [tagsInput, setTagsInput] = useState(contact?.tags.join(', ') ?? '');
  const [notes, setNotes] = useState(contact?.notes ?? '');
  const [howWeMet, setHowWeMet] = useState(contact?.howWeMet ?? '');
  const [channels, setChannels] = useState<ContactChannel[]>(
    contact?.channels ?? []
  );
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(
    contact?.specialDates ?? []
  );
  const [customFrequencyDays, setCustomFrequencyDays] = useState<string>(
    contact?.customFrequencyDays?.toString() ?? ''
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Channel management
  const addChannel = () => {
    setChannels((prev) => [...prev, { type: 'phone', value: '' }]);
  };

  const updateChannel = (
    index: number,
    field: keyof ContactChannel,
    value: string
  ) => {
    setChannels((prev) =>
      prev.map((ch, i) =>
        i === index ? { ...ch, [field]: value } : ch
      )
    );
  };

  const removeChannel = (index: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== index));
  };

  // Special dates management
  const addSpecialDate = () => {
    setSpecialDates((prev) => [...prev, { type: 'birthday', date: '' }]);
  };

  const updateSpecialDate = (
    index: number,
    field: keyof SpecialDate,
    value: string
  ) => {
    setSpecialDates((prev) =>
      prev.map((sd, i) =>
        i === index ? { ...sd, [field]: value } : sd
      )
    );
  };

  const removeSpecialDate = (index: number) => {
    setSpecialDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

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
      specialDates: specialDates.filter((sd) => sd.date.trim()),
      customFrequencyDays: customFrequencyDays
        ? parseInt(customFrequencyDays, 10)
        : undefined,
    };

    const result = CreateContactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data as CreateContactReq);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
          >
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500',
              errors.firstName
                ? 'border-red-400 focus:border-red-400'
                : 'border-warm-200 focus:border-coral-400 dark:border-warm-700 dark:focus:border-coral-500'
            )}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Company & Role */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="company"
            className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
          >
            Company
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
          >
            Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
            placeholder="Product Manager"
          />
        </div>
      </div>

      {/* Circle */}
      <div>
        <label
          htmlFor="circleId"
          className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
        >
          Circle *
        </label>
        <select
          id="circleId"
          value={circleId}
          onChange={(e) => setCircleId(e.target.value)}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:bg-warm-800 dark:text-warm-50',
            errors.circleId
              ? 'border-red-400 focus:border-red-400'
              : 'border-warm-200 focus:border-coral-400 dark:border-warm-700 dark:focus:border-coral-500'
          )}
        >
          {CIRCLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.circleId && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.circleId}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
        >
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
          placeholder="friend, college, tennis (comma-separated)"
        />
      </div>

      {/* How We Met */}
      <div>
        <label
          htmlFor="howWeMet"
          className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
        >
          How We Met
        </label>
        <input
          id="howWeMet"
          type="text"
          value={howWeMet}
          onChange={(e) => setHowWeMet(e.target.value)}
          className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
          placeholder="Met at a conference in 2023"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
          placeholder="Any notes about this contact..."
        />
      </div>

      {/* Channels */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-warm-700 dark:text-warm-300">
            Contact Channels
          </label>
          <button
            type="button"
            onClick={addChannel}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-coral-600 transition-colors hover:bg-coral-50 dark:text-coral-400 dark:hover:bg-coral-900/20"
          >
            <Plus className="h-3 w-3" />
            Add Channel
          </button>
        </div>

        {channels.length === 0 ? (
          <p className="rounded-lg border border-dashed border-warm-300 px-3 py-4 text-center text-xs text-warm-400 dark:border-warm-600 dark:text-warm-500">
            No channels added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {channels.map((channel, index) => {
              const ChannelIcon =
                CHANNEL_TYPES.find((t) => t.value === channel.type)?.icon ??
                Link;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <div className="flex shrink-0 items-center justify-center text-warm-400">
                    <ChannelIcon className="h-4 w-4" />
                  </div>
                  <select
                    value={channel.type}
                    onChange={(e) =>
                      updateChannel(
                        index,
                        'type',
                        e.target.value as ContactChannelType
                      )
                    }
                    className="w-28 shrink-0 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-xs text-warm-900 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:focus:border-coral-500"
                  >
                    {CHANNEL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={channel.value}
                    onChange={(e) =>
                      updateChannel(index, 'value', e.target.value)
                    }
                    placeholder="Value"
                    className="min-w-0 flex-1 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-xs text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeChannel(index)}
                    className="shrink-0 rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    aria-label="Remove channel"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {errors.channels && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.channels}
          </p>
        )}
      </div>

      {/* Special Dates */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-warm-700 dark:text-warm-300">
            Special Dates
          </label>
          <button
            type="button"
            onClick={addSpecialDate}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-coral-600 transition-colors hover:bg-coral-50 dark:text-coral-400 dark:hover:bg-coral-900/20"
          >
            <Plus className="h-3 w-3" />
            Add Date
          </button>
        </div>

        {specialDates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-warm-300 px-3 py-4 text-center text-xs text-warm-400 dark:border-warm-600 dark:text-warm-500">
            No special dates added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {specialDates.map((sd, index) => {
              const DateIcon =
                SPECIAL_DATE_TYPES.find((t) => t.value === sd.type)?.icon ??
                Calendar;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <div className="flex shrink-0 items-center justify-center text-warm-400">
                    <DateIcon className="h-4 w-4" />
                  </div>
                  <select
                    value={sd.type}
                    onChange={(e) =>
                      updateSpecialDate(
                        index,
                        'type',
                        e.target.value as SpecialDateType
                      )
                    }
                    className="w-36 shrink-0 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-xs text-warm-900 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:focus:border-coral-500"
                  >
                    {SPECIAL_DATE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={sd.date}
                    onChange={(e) =>
                      updateSpecialDate(index, 'date', e.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-xs text-warm-900 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:focus:border-coral-500"
                  />
                  {sd.type === 'custom' && (
                    <input
                      type="text"
                      value={sd.label ?? ''}
                      onChange={(e) =>
                        updateSpecialDate(index, 'label', e.target.value)
                      }
                      placeholder="Label"
                      className="w-24 shrink-0 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-xs text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeSpecialDate(index)}
                    className="shrink-0 rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    aria-label="Remove special date"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {errors.specialDates && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.specialDates}
          </p>
        )}
      </div>

      {/* Custom Frequency */}
      <div>
        <label
          htmlFor="customFrequencyDays"
          className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300"
        >
          Custom Frequency (days)
        </label>
        <input
          id="customFrequencyDays"
          type="number"
          min="1"
          value={customFrequencyDays}
          onChange={(e) => setCustomFrequencyDays(e.target.value)}
          className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
          placeholder="Leave blank to use circle default"
        />
        <p className="mt-1 text-xs text-warm-400 dark:text-warm-500">
          Override the circle&apos;s default reminder frequency.
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 border-t border-warm-200 pt-4 dark:border-warm-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-600 active:bg-coral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
}
