'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useUser, useUpdateUser } from '@/hooks/use-user';
import { useTheme } from '@/app/providers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Toggle } from '@/components/ui/toggle';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { User, Bell, Palette, Download, LogOut, Save, Check } from 'lucide-react';
import type { CircleConfig } from '@touchbase/shared';

const DAILY_PING_OPTIONS = [1, 2, 3, 5, 7, 10].map((n) => ({
  value: String(n),
  label: `${n} ${n === 1 ? 'ping' : 'pings'} per day`,
}));

function useSaveFlash() {
  const [saved, setSaved] = useState(false);
  const flash = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);
  return { saved, flash };
}

function SaveButton({ saved, loading, label, onClick }: {
  saved: boolean; loading: boolean; label: string; onClick: () => void;
}) {
  return (
    <Button size="sm" onClick={onClick} loading={loading}>
      {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> {label}</>}
    </Button>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useUser();
  const updateUser = useUpdateUser();
  const { resolvedTheme, setTheme } = useTheme();

  const [dailyPingCount, setDailyPingCount] = useState(5);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [circles, setCircles] = useState<CircleConfig[]>([]);

  const notif = useSaveFlash();
  const circleFlash = useSaveFlash();

  useEffect(() => {
    if (user?.settings) {
      setDailyPingCount(user.settings.dailyPingCount);
      setReminderTime(user.settings.reminderTime);
      setNotificationsEnabled(user.settings.notificationsEnabled);
      setCircles(user.settings.circles);
    }
  }, [user]);

  const handleSaveNotifications = async () => {
    try {
      await updateUser.mutateAsync({
        settings: { dailyPingCount, reminderTime, notificationsEnabled },
      });
      notif.flash();
    } catch { /* Error handled by mutation */ }
  };

  const updateCircle = (id: string, patch: Partial<CircleConfig>) => {
    setCircles((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleSaveCircles = async () => {
    try {
      await updateUser.mutateAsync({ settings: { circles } });
      circleFlash.flash();
    } catch { /* Error handled by mutation */ }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar src={session?.user?.image} fallback={session?.user?.name ?? 'U'} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-warm-900 dark:text-warm-50">
                {session?.user?.name ?? 'Unknown'}
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                {session?.user?.email ?? ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Toggle
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
            label="Enable notifications"
            description="Receive daily ping reminders"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Daily pings"
              options={DAILY_PING_OPTIONS}
              value={String(dailyPingCount)}
              onChange={(e) => setDailyPingCount(Number(e.target.value))}
            />
            <Input
              label="Reminder time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
          <SaveButton
            saved={notif.saved}
            loading={updateUser.isPending}
            label="Save Notifications"
            onClick={handleSaveNotifications}
          />
        </CardContent>
      </Card>

      {/* Circles */}
      <Card>
        <CardHeader>
          <CardTitle>Circles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="flex items-center gap-3 rounded-lg border border-warm-200 p-3 dark:border-warm-700"
            >
              <input
                type="color"
                value={circle.color}
                onChange={(e) => updateCircle(circle.id, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent"
                title={`Color for ${circle.name}`}
              />
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <Input
                  value={circle.name}
                  onChange={(e) => updateCircle(circle.id, { name: e.target.value })}
                  placeholder="Circle name"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={circle.defaultFrequencyDays}
                    onChange={(e) =>
                      updateCircle(circle.id, { defaultFrequencyDays: Number(e.target.value) })
                    }
                    min={1}
                    max={365}
                    className="w-20"
                  />
                  <span className="shrink-0 text-sm text-warm-500 dark:text-warm-400">days</span>
                </div>
              </div>
            </div>
          ))}
          <SaveButton
            saved={circleFlash.saved}
            loading={updateUser.isPending}
            label="Save Circles"
            onClick={handleSaveCircles}
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Toggle
            checked={resolvedTheme === 'dark'}
            onChange={(dark) => setTheme(dark ? 'dark' : 'light')}
            label="Dark mode"
            description={resolvedTheme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
          />
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-warm-500 dark:text-warm-400">
            Download all your contacts and interactions.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => alert('Export as CSV is coming soon!')}>
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => alert('Export as JSON is coming soon!')}>
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200 dark:border-red-800/50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-warm-900 dark:text-warm-50">Sign out</p>
            <p className="text-xs text-warm-500 dark:text-warm-400">
              Sign out of your TouchBase account
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
