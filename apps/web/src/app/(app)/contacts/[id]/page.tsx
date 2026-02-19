'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContact, useDeleteContact } from '@/hooks/use-contacts';
import { useInteractions, useCreateInteraction } from '@/hooks/use-interactions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HealthIndicator } from '@/components/ui/health-indicator';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  Tag,
  Plus,
  X,
} from 'lucide-react';
import type { InteractionType, ContactChannelType } from '@touchbase/shared';

const INTERACTION_TYPES: { value: InteractionType; label: string; icon: string }[] = [
  { value: 'call', label: 'Call', icon: 'phone' },
  { value: 'text', label: 'Text', icon: 'message' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'coffee', label: 'Coffee', icon: 'coffee' },
  { value: 'meal', label: 'Meal', icon: 'utensils' },
  { value: 'event', label: 'Event', icon: 'calendar' },
  { value: 'gift', label: 'Gift', icon: 'gift' },
  { value: 'introduction', label: 'Intro', icon: 'users' },
  { value: 'favor', label: 'Favor', icon: 'heart' },
  { value: 'other', label: 'Other', icon: 'more' },
];

const CHANNEL_ICONS: Record<ContactChannelType, typeof Phone> = {
  phone: Phone,
  email: Mail,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  other: Globe,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

type TabId = 'overview' | 'interactions' | 'details';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading: contactLoading } = useContact(id);
  const { data: interactionsData, isLoading: interactionsLoading } = useInteractions({
    contactId: id,
  });
  const deleteContact = useDeleteContact();
  const createInteraction = useCreateInteraction();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [interactionType, setInteractionType] = useState<InteractionType>('call');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [interactionDate, setInteractionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const interactions = interactionsData?.data ?? [];

  const handleDelete = async () => {
    try {
      await deleteContact.mutateAsync(id);
      router.push('/contacts');
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInteraction.mutateAsync({
        contactId: id,
        type: interactionType,
        notes: interactionNotes.trim() || undefined,
        date: new Date(interactionDate).toISOString(),
      });
      setShowLogInteraction(false);
      setInteractionNotes('');
      setInteractionType('call');
    } catch {
      // Error is handled by the mutation
    }
  };

  if (contactLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
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

  const name = `${contact.firstName} ${contact.lastName}`.trim();
  const initials = `${contact.firstName[0] ?? ''}${contact.lastName[0] ?? ''}`.toUpperCase();

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'details', label: 'Details' },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1 text-sm font-medium text-warm-600 hover:text-warm-800 dark:text-warm-400 dark:hover:text-warm-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Link>

      {/* Contact Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {contact.photoURL ? (
            <img
              src={contact.photoURL}
              alt={name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral-100 text-xl font-bold text-coral-600 dark:bg-coral-900/30 dark:text-coral-400">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-warm-900 dark:text-warm-50 sm:text-2xl">
              {name}
            </h1>
            {(contact.role || contact.company) && (
              <p className="mt-0.5 text-sm text-warm-500 dark:text-warm-400">
                {contact.role && contact.company
                  ? `${contact.role} at ${contact.company}`
                  : contact.role || contact.company}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <Badge>{contact.circleId}</Badge>
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/contacts/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Are you sure you want to delete {name}? This cannot be undone.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={deleteContact.isPending}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-warm-200 dark:border-warm-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-coral-500 text-coral-600 dark:text-coral-400'
                : 'text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Health Score */}
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <HealthIndicator score={contact.healthScore} size="lg" />
              <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
                Relationship Health
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warm-400 dark:text-warm-500" />
                <div>
                  <p className="text-xs text-warm-500 dark:text-warm-400">
                    Last interaction
                  </p>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                    {contact.lastInteractionAt
                      ? formatRelativeDate(contact.lastInteractionAt)
                      : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-warm-400 dark:text-warm-500" />
                <div>
                  <p className="text-xs text-warm-500 dark:text-warm-400">
                    Next ping
                  </p>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                    {formatDate(contact.nextPingAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-warm-400 dark:text-warm-500" />
                <div>
                  <p className="text-xs text-warm-500 dark:text-warm-400">
                    Total interactions
                  </p>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                    {interactionsData?.total ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">
              Interaction History
            </h2>
            <Button
              size="sm"
              onClick={() => setShowLogInteraction(!showLogInteraction)}
            >
              {showLogInteraction ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {showLogInteraction ? 'Cancel' : 'Log Interaction'}
            </Button>
          </div>

          {/* Log Interaction Form */}
          {showLogInteraction && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleLogInteraction} className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {INTERACTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setInteractionType(type.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          interactionType === type.value
                            ? 'bg-coral-500 text-white'
                            : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-800 dark:text-warm-300 dark:hover:bg-warm-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    label="Date"
                    type="date"
                    value={interactionDate}
                    onChange={(e) => setInteractionDate(e.target.value)}
                  />
                  <div className="w-full">
                    <label className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300">
                      Notes (optional)
                    </label>
                    <textarea
                      value={interactionNotes}
                      onChange={(e) => setInteractionNotes(e.target.value)}
                      placeholder="What did you talk about?"
                      rows={2}
                      className="block min-h-[60px] w-full rounded-lg border border-warm-300 px-3 py-2 text-base text-warm-900 placeholder:text-warm-400 transition-colors focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100 dark:focus:border-coral-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    loading={createInteraction.isPending}
                  >
                    Save Interaction
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Interaction Timeline */}
          {interactionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-warm-300 dark:text-warm-600" />
                <p className="text-sm text-warm-500 dark:text-warm-400">
                  No interactions logged yet.
                </p>
                <p className="mt-1 text-xs text-warm-400 dark:text-warm-500">
                  Tap &quot;Log Interaction&quot; to record your first one.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {interactions.map((interaction) => {
                const typeInfo = INTERACTION_TYPES.find(
                  (t) => t.value === interaction.type
                );
                return (
                  <Card key={interaction.id}>
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-100 dark:bg-warm-800">
                        <span className="text-xs font-medium text-warm-600 dark:text-warm-300">
                          {typeInfo?.label.slice(0, 2) ?? '??'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                            {typeInfo?.label ?? interaction.type}
                          </p>
                          <span className="shrink-0 text-xs text-warm-400 dark:text-warm-500">
                            {formatDate(interaction.date)}
                          </span>
                        </div>
                        {interaction.notes && (
                          <p className="mt-1 text-sm text-warm-600 dark:text-warm-400">
                            {interaction.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-4">
          {/* Channels */}
          {contact.channels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.channels.map((channel, idx) => {
                  const Icon = CHANNEL_ICONS[channel.type] || Globe;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-warm-500 dark:text-warm-400" />
                      <div>
                        <p className="text-sm text-warm-900 dark:text-warm-50">
                          {channel.value}
                        </p>
                        {channel.label && (
                          <p className="text-xs text-warm-500 dark:text-warm-400">
                            {channel.label}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Special Dates */}
          {contact.specialDates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Special Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.specialDates.map((sd, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-warm-500 dark:text-warm-400" />
                    <div>
                      <p className="text-sm text-warm-900 dark:text-warm-50">
                        {sd.date}
                      </p>
                      <p className="text-xs capitalize text-warm-500 dark:text-warm-400">
                        {sd.label || sd.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* How We Met */}
          {contact.howWeMet && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  How We Met
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-warm-700 dark:text-warm-300">
                  {contact.howWeMet}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-warm-700 dark:text-warm-300">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact metadata */}
          <Card>
            <CardContent className="space-y-2 p-4 text-xs text-warm-400 dark:text-warm-500">
              <p>Added on {formatDate(contact.createdAt)}</p>
              <p>Last updated {formatDate(contact.updatedAt)}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
