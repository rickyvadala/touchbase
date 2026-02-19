'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { InteractionType, Contact } from '@touchbase/shared';
import { useCreateInteraction } from '@/hooks/use-interactions';
import { getContactName } from '@touchbase/utils';
import { INTERACTION_TYPES } from '@/lib/constants';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';

interface LogInteractionFormProps {
  /** Pre-selected contact (when used on a contact detail page) */
  contactId?: string;
  /** Available contacts to choose from (when contactId is not provided) */
  contacts?: Contact[];
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function LogInteractionForm({
  contactId: preselectedContactId,
  contacts = [],
  onSuccess,
  onCancel,
  className,
}: LogInteractionFormProps) {
  const [selectedType, setSelectedType] = useState<InteractionType>('call');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [contactId, setContactId] = useState(preselectedContactId ?? '');
  const [contactSearch, setContactSearch] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);

  const createInteraction = useCreateInteraction();

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch) return true;
    const name = getContactName(c).toLowerCase();
    return name.includes(contactSearch.toLowerCase());
  });

  const selectedContact = contacts.find((c) => c.id === contactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactId) return;

    try {
      await createInteraction.mutateAsync({
        contactId,
        type: selectedType,
        notes: notes.trim() || undefined,
        date: new Date(date).toISOString(),
      });
      onSuccess?.();
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-5', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">
          Log Interaction
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600 dark:hover:bg-warm-700 dark:hover:text-warm-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Contact selector (when not scoped to a specific contact) */}
      {!preselectedContactId && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300">
            Contact *
          </label>
          <div className="relative">
            {contactId && selectedContact ? (
              <div className="flex items-center justify-between rounded-lg border border-warm-200 bg-white px-3 py-2 dark:border-warm-700 dark:bg-warm-800">
                <span className="text-sm text-warm-900 dark:text-warm-50">
                  {getContactName(selectedContact)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setContactId('');
                    setShowContactPicker(true);
                  }}
                  className="rounded p-0.5 text-warm-400 hover:text-warm-600 dark:hover:text-warm-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setShowContactPicker(true);
                    }}
                    onFocus={() => setShowContactPicker(true)}
                    placeholder="Search for a contact..."
                    className="w-full rounded-lg border border-warm-200 bg-white py-2 pl-10 pr-3 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-coral-500"
                  />
                </div>

                {showContactPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowContactPicker(false)}
                    />
                    <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-warm-200 bg-white py-1 shadow-lg dark:border-warm-700 dark:bg-warm-800">
                      {filteredContacts.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-warm-400 dark:text-warm-500">
                          No contacts found.
                        </p>
                      ) : (
                        filteredContacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setContactId(c.id);
                              setContactSearch('');
                              setShowContactPicker(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-warm-700 transition-colors hover:bg-warm-50 dark:text-warm-300 dark:hover:bg-warm-700"
                          >
                            <Avatar
                              src={c.photoURL}
                              fallback={getContactName(c)}
                              size="sm"
                              className="h-6 w-6 text-[10px]"
                            />
                            <span>{getContactName(c)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interaction type grid */}
      <div>
        <label className="mb-2 block text-sm font-medium text-warm-700 dark:text-warm-300">
          Type *
        </label>
        <div className="grid grid-cols-5 gap-2">
          {INTERACTION_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedType(value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-2 text-[11px] font-medium transition-all',
                selectedType === value
                  ? 'border-coral-400 bg-coral-50 text-coral-700 ring-1 ring-coral-400/30 dark:border-coral-500 dark:bg-coral-900/20 dark:text-coral-400'
                  : 'border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-700 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-400 dark:hover:border-warm-600 dark:hover:text-warm-300'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <Input
        id="interaction-date"
        type="date"
        label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Notes */}
      <Textarea
        id="interaction-notes"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="What did you talk about?"
      />

      {/* Submit */}
      <Button
        type="submit"
        disabled={!contactId}
        loading={createInteraction.isPending}
        fullWidth
      >
        Log Interaction
      </Button>

      {createInteraction.isError && (
        <p className="text-center text-xs text-red-500">
          Failed to log interaction. Please try again.
        </p>
      )}
    </form>
  );
}
