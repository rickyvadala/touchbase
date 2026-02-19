'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Heart,
  AlertTriangle,
  Snowflake,
  Gift,
  Flame,
  Bell,
  ChevronRight,
} from 'lucide-react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 17) return 'Good afternoon!';
  return 'Good evening!';
}

function formatBirthdayDate(dateStr: string): string {
  const [month, day] = dateStr.split('-').map(Number);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[month - 1]} ${day}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const greeting = useMemo(() => getGreeting(), []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-warm-500 dark:text-warm-400">
          Failed to load dashboard. Please try again.
        </p>
      </div>
    );
  }

  const dashboard = data;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-warm-500 dark:text-warm-400">
          Here&apos;s your relationship overview for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Healthy contacts */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900 dark:text-warm-50">
                {dashboard?.networkHealth.healthy ?? 0}
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">Healthy</p>
            </div>
          </CardContent>
        </Card>

        {/* Needs attention */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900 dark:text-warm-50">
                {dashboard?.networkHealth.needsAttention ?? 0}
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                Needs attention
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cold contacts */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30">
              <Snowflake className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900 dark:text-warm-50">
                {dashboard?.networkHealth.cold ?? 0}
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">Gone cold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak */}
      {dashboard && dashboard.streak > 0 && (
        <Card className="border-coral-200 bg-coral-50 dark:border-coral-800 dark:bg-coral-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="h-6 w-6 text-coral-500" />
            <p className="text-sm font-medium text-coral-700 dark:text-coral-300">
              {dashboard.streak}-day streak! Keep it up.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Today's Pings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-coral-500" />
            Today&apos;s Pings
            {dashboard?.overduePings ? (
              <Badge variant="danger">{dashboard.overduePings} overdue</Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.todayPings && dashboard.todayPings.length > 0 ? (
            <ul className="divide-y divide-warm-100 dark:divide-warm-700">
              {dashboard.todayPings.map((ping) => (
                <li key={ping.id}>
                  <Link
                    href={`/contacts/${ping.contactId}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:bg-warm-50 dark:hover:bg-warm-800/50"
                  >
                    {/* Avatar */}
                    {ping.contact.photoURL ? (
                      <img
                        src={ping.contact.photoURL}
                        alt={`${ping.contact.firstName} ${ping.contact.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100 text-sm font-semibold text-coral-600 dark:bg-coral-900/30 dark:text-coral-400">
                        {ping.contact.firstName[0]}
                        {ping.contact.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-warm-900 dark:text-warm-50">
                        {ping.contact.firstName} {ping.contact.lastName}
                      </p>
                      <p className="text-xs text-warm-500 dark:text-warm-400">
                        Time to reach out
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-warm-400 dark:text-warm-500" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-warm-500 dark:text-warm-400">
                No pings for today. You&apos;re all caught up!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Birthdays */}
      {dashboard?.upcomingBirthdays && dashboard.upcomingBirthdays.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" />
              Upcoming Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-warm-100 dark:divide-warm-700">
              {dashboard.upcomingBirthdays.map((person) => (
                <li key={person.id}>
                  <Link
                    href={`/contacts/${person.id}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:bg-warm-50 dark:hover:bg-warm-800/50"
                  >
                    {person.photoURL ? (
                      <img
                        src={person.photoURL}
                        alt={`${person.firstName} ${person.lastName}`}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                        {person.firstName[0]}
                        {person.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-warm-900 dark:text-warm-50">
                        {person.firstName} {person.lastName}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-warm-500 dark:text-warm-400">
                      {formatBirthdayDate(person.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick link to contacts */}
      <div className="flex justify-center pb-4">
        <Link
          href="/contacts"
          className="flex items-center gap-1 text-sm font-medium text-coral-600 hover:text-coral-700 dark:text-coral-400 dark:hover:text-coral-300"
        >
          <Users className="h-4 w-4" />
          View all contacts
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
