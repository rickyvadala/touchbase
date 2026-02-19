import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface BackLinkProps {
  href: string;
  label?: string;
}

export function BackLink({ href, label = 'Back' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-warm-600 hover:text-warm-800 dark:text-warm-400 dark:hover:text-warm-200"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
