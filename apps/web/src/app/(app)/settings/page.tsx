'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useUser, useUpdateUser } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import {
  User,
  Bell,
  Palette,
  Download,
  LogOut,
  Sun,
  Moon,
  Save,
  Check,
} from 'lucide-react';
import type { CircleConfig } from '@touchbase/shared';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useUser();
  const updateUser = useUpdateUser();
  const { theme, toggleTheme } = useTheme();

  // Notification settings state
  const [dailyPingCount, setDailyPingCount] = useState(5);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Circle customization state
  const [circles, setCircles] = useState<CircleConfig[]>([]);

  // Track saved states
  const [notifSaved, setNotifSaved] = useState(false);
  const [circlesSaved, setCirclesSaved] = useState(false);

  // Pre-fill from user data
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
        settings: {
          dailyPingCount,
          reminderTime,
          notificationsEnabled,
        },
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCircleNameChange = (id: string, name: string) => {
    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  };

  const handleCircleFrequencyChange = (id: string, days: number) => {
    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, defaultFrequencyDays: days } : c))
    );
  };

  const handleCircleColorChange = (id: string, color: string) => {
    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, color } : c))
    );
  };

  const handleSaveCircles = async () => {
    try {
      await updateUser.mutateAsync({
        settings: { circles },
      });
      setCirclesSaved(true);
      setTimeout(() => setCirclesSaved(false), 2000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    // Placeholder: trigger download
    alert(`Export as ${format.toUpperCase()} is coming soon!`);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
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
      <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-50">
        Settings
      </h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar
              src={session?.user?.image}
              fallback={session?.user?.name ?? 'U'}
              size="lg"
            />
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

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Enable notifications toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                Enable notifications
              </p>
              <p className="text-xs text-warm-500 dark:text-warm-400">
                Receive daily ping reminders
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-warm-900 ${
                notificationsEnabled
                  ? 'bg-coral-500'
                  : 'bg-warm-200 dark:bg-warm-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Daily ping count */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-warm-700 dark:text-warm-300">
                Daily pings
              </label>
              <select
                value={dailyPingCount}
                onChange={(e) => setDailyPingCount(Number(e.target.value))}
                className="block min-h-[44px] w-full rounded-lg border border-warm-300 bg-white px-3 py-2 text-base text-warm-900 transition-colors focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100 dark:focus:border-coral-400"
              >
                {[1, 2, 3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'ping' : 'pings'} per day
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Reminder time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            onClick={handleSaveNotifications}
            loading={updateUser.isPending}
          >
            {notifSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Notifications
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Circle Customization */}
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
              {/* Color picker */}
              <input
                type="color"
                value={circle.color}
                onChange={(e) =>
                  handleCircleColorChange(circle.id, e.target.value)
                }
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent"
                title={`Color for ${circle.name}`}
              />
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <Input
                  value={circle.name}
                  onChange={(e) =>
                    handleCircleNameChange(circle.id, e.target.value)
                  }
                  placeholder="Circle name"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={circle.defaultFrequencyDays}
                    onChange={(e) =>
                      handleCircleFrequencyChange(
                        circle.id,
                        Number(e.target.value)
                      )
                    }
                    min={1}
                    max={365}
                    className="w-20"
                  />
                  <span className="shrink-0 text-sm text-warm-500 dark:text-warm-400">
                    days
                  </span>
                </div>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            onClick={handleSaveCircles}
            loading={updateUser.isPending}
          >
            {circlesSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Circles
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                Dark mode
              </p>
              <p className="text-xs text-warm-500 dark:text-warm-400">
                {theme === 'dark'
                  ? 'Currently using dark theme'
                  : 'Currently using light theme'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-warm-200 transition-colors hover:bg-warm-100 dark:border-warm-700 dark:hover:bg-warm-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-warm-600 dark:text-warm-400" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-warm-500 dark:text-warm-400">
            Download all your contacts and interactions.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('json')}
            >
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200 dark:border-red-800/50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
              Sign out
            </p>
            <p className="text-xs text-warm-500 dark:text-warm-400">
              Sign out of your TouchBase account
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
