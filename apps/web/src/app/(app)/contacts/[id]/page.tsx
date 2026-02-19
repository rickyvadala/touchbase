'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContact, useDeleteContact } from '@/hooks/use-contacts';
import { useInteractions } from '@/hooks/use-interactions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HealthIndicator } from '@/components/ui/health-indicator';
import { Tabs } from '@/components/ui/tabs';
import { BackLink } from '@/components/ui/back-link';
import { Avatar } from '@/components/ui/avatar';
import { LogInteractionForm } from '@/components/contacts/log-interaction-form';
import { INTERACTION_TYPES, CHANNEL_ICON_MAP } from '@/lib/constants';
import { formatDate, formatRelativeTime, getContactName } from '@touchbase/utils';
import {
  Edit2, Trash2, Calendar, MessageSquare, Clock, MapPin, Tag, Plus, X, Globe,
} from 'lucide-react';

type TabId = 'overview' | 'interactions' | 'details';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'interactions', label: 'Interactions' },
  { id: 'details', label: 'Details' },
];

function StatRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-warm-400 dark:text-warm-500" />
      <div>
        <p className="text-xs text-warm-500 dark:text-warm-400">{label}</p>
        <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{value}</p>
      </div>
    </div>
  );
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading: contactLoading } = useContact(id);
  const { data: interactionsData, isLoading: interactionsLoading } = useInteractions({
    contactId: id,
  });
  const deleteContact = useDeleteContact();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const interactions = interactionsData?.data ?? [];

  const handleDelete = async () => {
    try { await deleteContact.mutateAsync(id); router.push('/contacts'); }
    catch { /* Error is handled by the mutation */ }
  };

  if (contactLoading) return (
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

  if (!contact) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-warm-500 dark:text-warm-400">Contact not found.</p>
      <Link href="/contacts" className="mt-4">
        <Button variant="secondary">Back to contacts</Button>
      </Link>
    </div>
  );

  const name = getContactName(contact);

  return (
    <div className="space-y-6">
      <BackLink href="/contacts" label="Contacts" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={contact.photoURL}
            fallback={`${contact.firstName} ${contact.lastName}`}
            size="lg"
            className="h-16 w-16 text-xl"
          />
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
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
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
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Are you sure you want to delete {name}? This cannot be undone.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete} loading={deleteContact.isPending}>
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <HealthIndicator score={contact.healthScore} size="lg" />
              <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">Relationship Health</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-6">
              <StatRow
                icon={Clock}
                label="Last interaction"
                value={contact.lastInteractionAt ? formatRelativeTime(contact.lastInteractionAt) : 'Never'}
              />
              <StatRow icon={Calendar} label="Next ping" value={formatDate(contact.nextPingAt)} />
              <StatRow icon={MessageSquare} label="Total interactions" value={interactionsData?.total ?? 0} />
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">Interaction History</h2>
            <Button size="sm" onClick={() => setShowLogInteraction(!showLogInteraction)}>
              {showLogInteraction ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showLogInteraction ? 'Cancel' : 'Log Interaction'}
            </Button>
          </div>
          {showLogInteraction && (
            <Card>
              <CardContent className="p-4">
                <LogInteractionForm
                  contactId={id}
                  onSuccess={() => setShowLogInteraction(false)}
                  onCancel={() => setShowLogInteraction(false)}
                />
              </CardContent>
            </Card>
          )}
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
                <p className="text-sm text-warm-500 dark:text-warm-400">No interactions logged yet.</p>
                <p className="mt-1 text-xs text-warm-400 dark:text-warm-500">
                  Tap &quot;Log Interaction&quot; to record your first one.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {interactions.map((interaction) => {
                const typeInfo = INTERACTION_TYPES.find((t) => t.value === interaction.type);
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
                          <p className="mt-1 text-sm text-warm-600 dark:text-warm-400">{interaction.notes}</p>
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
          {contact.channels.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Contact Channels</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {contact.channels.map((channel, idx) => {
                  const Icon = CHANNEL_ICON_MAP[channel.type] || Globe;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-warm-500 dark:text-warm-400" />
                      <div>
                        <p className="text-sm text-warm-900 dark:text-warm-50">{channel.value}</p>
                        {channel.label && (
                          <p className="text-xs text-warm-500 dark:text-warm-400">{channel.label}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {contact.specialDates.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Special Dates</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {contact.specialDates.map((sd, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-warm-500 dark:text-warm-400" />
                    <div>
                      <p className="text-sm text-warm-900 dark:text-warm-50">{sd.date}</p>
                      <p className="text-xs capitalize text-warm-500 dark:text-warm-400">
                        {sd.label || sd.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {contact.howWeMet && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> How We Met
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-warm-700 dark:text-warm-300">{contact.howWeMet}</p>
              </CardContent>
            </Card>
          )}

          {contact.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-warm-700 dark:text-warm-300">{contact.notes}</p>
              </CardContent>
            </Card>
          )}

          {contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
