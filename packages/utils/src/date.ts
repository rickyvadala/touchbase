/** Format an ISO date string to a human-readable format */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format an ISO date string to relative time (e.g., "2 days ago") */
export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/** Get days since a given ISO date */
export function daysSince(iso: string): number {
  const now = new Date();
  const date = new Date(iso);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get days until a given ISO date */
export function daysUntil(iso: string): number {
  const now = new Date();
  const date = new Date(iso);
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Check if a date (MM-DD or YYYY-MM-DD) is within the next N days */
export function isWithinDays(dateStr: string, days: number): boolean {
  const now = new Date();
  const thisYear = now.getFullYear();

  // Parse MM-DD or YYYY-MM-DD
  let month: number;
  let day: number;
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    month = parseInt(parts[0], 10) - 1;
    day = parseInt(parts[1], 10);
  } else {
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  }

  // Check this year and next year
  for (const year of [thisYear, thisYear + 1]) {
    const target = new Date(year, month, day);
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= days) return true;
  }

  return false;
}

/** Convert a date to ISO string */
export function toISO(date: Date = new Date()): string {
  return date.toISOString();
}

/** Get the start of today (midnight) as ISO string */
export function startOfToday(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

/** Add days to a date and return ISO string */
export function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
