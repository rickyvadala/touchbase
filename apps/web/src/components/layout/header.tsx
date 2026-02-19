'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/providers';
import { cn } from '@/lib/cn';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export function Header({ showBack = false, title }: HeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={cn(
        'flex md:hidden items-center justify-between',
        'sticky top-0 z-30 h-14 px-4',
        'bg-white/80 dark:bg-warm-900/80 backdrop-blur-md',
        'border-b border-warm-200 dark:border-warm-800'
      )}
    >
      {/* Left: Back button or spacer */}
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className={cn(
              'p-2 -ml-2 rounded-lg transition-colors',
              'text-warm-600 dark:text-warm-300',
              'hover:bg-warm-100 dark:hover:bg-warm-800'
            )}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Center: Title or App name */}
      <h1 className="text-base font-semibold text-warm-900 dark:text-warm-50">
        {title ?? (
          <>
            Touch<span className="text-coral-500">Base</span>
          </>
        )}
      </h1>

      {/* Right: Theme toggle */}
      <div className="w-10 flex justify-end">
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 -mr-2 rounded-lg transition-colors',
            'text-warm-600 dark:text-warm-300',
            'hover:bg-warm-100 dark:hover:bg-warm-800'
          )}
          aria-label={
            resolvedTheme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}
