'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { navLinks } from './nav-links';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex md:hidden fixed bottom-0 left-0 right-0 z-30',
        'bg-white dark:bg-warm-900',
        'border-t border-warm-200 dark:border-warm-800'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex w-full">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 pt-2.5 transition-colors',
                isActive
                  ? 'text-coral-500 dark:text-coral-400'
                  : 'text-warm-400 dark:text-warm-500 active:text-warm-600 dark:active:text-warm-300'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive
                    ? 'text-coral-500 dark:text-coral-400'
                    : 'text-warm-400 dark:text-warm-500'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive
                    ? 'text-coral-500 dark:text-coral-400'
                    : 'text-warm-500 dark:text-warm-400'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
