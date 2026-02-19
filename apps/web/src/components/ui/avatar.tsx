'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const;

// Deterministic color based on initials string
const bgColors = [
  'bg-coral-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-pink-500',
];

function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

export type AvatarSize = keyof typeof sizeStyles;

export interface AvatarProps {
  src?: string | null;
  fallback: string;
  size?: AvatarSize;
  className?: string;
  alt?: string;
}

export function Avatar({
  src,
  fallback,
  size = 'md',
  className,
  alt,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = fallback
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        !showImage && getColorFromString(fallback),
        sizeStyles[size],
        className
      )}
      role="img"
      aria-label={alt || fallback}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || fallback}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-medium text-white select-none">{initials}</span>
      )}
    </div>
  );
}
