'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { cn } from '@/lib/cn';

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
  headerTitle?: string;
}

export function AppShell({ children, showBack, headerTitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile header */}
      <Header showBack={showBack} title={headerTitle} />

      {/* Main content area */}
      <main
        className={cn(
          // Desktop: offset by sidebar width
          'md:pl-64',
          // Mobile: add bottom padding for nav bar + safe area
          'pb-20 md:pb-0'
        )}
      >
        <div
          className={cn(
            'mx-auto w-full max-w-5xl',
            'px-4 py-4 md:px-8 md:py-6'
          )}
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
