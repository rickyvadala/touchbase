'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0',
        'w-64 bg-white dark:bg-warm-900 border-r border-warm-200 dark:border-warm-800',
        'z-30'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-warm-200 dark:border-warm-800">
        <div className="h-8 w-8 rounded-lg bg-coral-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">TB</span>
        </div>
        <span className="text-xl font-bold text-warm-900 dark:text-warm-50">
          Touch<span className="text-coral-500">Base</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400'
                  : 'text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 hover:text-warm-900 dark:hover:text-warm-100'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-coral-500 dark:text-coral-400'
                    : 'text-warm-400 dark:text-warm-500'
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-warm-200 dark:border-warm-800 p-4">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? 'User avatar'}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-warm-200 dark:ring-warm-700"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-coral-100 dark:bg-coral-500/20 flex items-center justify-center">
              <span className="text-sm font-medium text-coral-600 dark:text-coral-400">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-900 dark:text-warm-100 truncate">
              {session?.user?.name ?? 'User'}
            </p>
            <p className="text-xs text-warm-500 dark:text-warm-400 truncate">
              {session?.user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-warm-400 dark:text-warm-500',
              'hover:bg-warm-100 dark:hover:bg-warm-800',
              'hover:text-warm-600 dark:hover:text-warm-300'
            )}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
