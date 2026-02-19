import { NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError } from '@/lib/api-helpers';
import {
  getPendingPingsForDate,
  getOverduePingsCount,
  getContactsByIds,
  listContacts,
  listInteractions,
} from '@/lib/dal';
import type { DashboardRes, Contact, Ping } from '@touchbase/shared';

/**
 * GET /api/dashboard
 * Aggregate dashboard data:
 * - Today's pings with contact data
 * - Overdue pings count
 * - Upcoming birthdays (next 30 days)
 * - Network health distribution
 * - Streak count (consecutive days with all pings completed)
 */
export const GET = withAuth(async (_req, { userId }) => {
  try {
    const today = new Date().toISOString();

    // Run independent queries in parallel
    const [todayPingsRaw, overduePings, allContacts] = await Promise.all([
      getPendingPingsForDate(userId, today),
      getOverduePingsCount(userId),
      listContacts(userId, { limit: 100, sortBy: 'name', sortOrder: 'asc' }),
    ]);

    // Hydrate today's pings with contact data
    const contactIds = [...new Set(todayPingsRaw.map((p) => p.contactId))];
    const contacts = await getContactsByIds(userId, contactIds);
    const contactMap = new Map(contacts.map((c) => [c.id, c]));

    const todayPings = todayPingsRaw
      .map((ping) => {
        const contact = contactMap.get(ping.contactId);
        if (!contact) return null;
        return { ...ping, contact };
      })
      .filter(Boolean) as (Ping & { contact: Contact })[];

    // Upcoming birthdays in the next 30 days
    const upcomingBirthdays = getUpcomingBirthdays(allContacts.data, 30);

    // Network health distribution
    const networkHealth = {
      healthy: 0,
      needsAttention: 0,
      cold: 0,
    };

    for (const contact of allContacts.data) {
      if (contact.healthScore >= 70) {
        networkHealth.healthy++;
      } else if (contact.healthScore >= 40) {
        networkHealth.needsAttention++;
      } else {
        networkHealth.cold++;
      }
    }

    // Calculate streak: consecutive days (looking back) where all pings were completed
    const streak = await calculateStreak(userId);

    const dashboard: DashboardRes = {
      todayPings,
      overduePings,
      upcomingBirthdays,
      networkHealth,
      streak,
    };

    return NextResponse.json(apiSuccess(dashboard));
  } catch (err) {
    console.error('GET /api/dashboard error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to load dashboard', 500),
      { status: 500 },
    );
  }
});

/**
 * Find contacts with birthdays in the next N days.
 * Compares the MM-DD portion of specialDates against today + N days.
 */
function getUpcomingBirthdays(
  contacts: Contact[],
  days: number,
): DashboardRes['upcomingBirthdays'] {
  const today = new Date();
  const results: DashboardRes['upcomingBirthdays'] = [];

  for (const contact of contacts) {
    for (const sd of contact.specialDates) {
      if (sd.type !== 'birthday') continue;

      // Dates may be "MM-DD" or "YYYY-MM-DD"
      const parts = sd.date.split('-');
      const month = parts.length === 3 ? parseInt(parts[1], 10) : parseInt(parts[0], 10);
      const day = parts.length === 3 ? parseInt(parts[2], 10) : parseInt(parts[1], 10);

      // Build this year's birthday date
      const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

      // If it already passed this year, check next year
      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(today.getFullYear() + 1);
      }

      const diffMs = birthdayThisYear.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= days) {
        results.push({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          photoURL: contact.photoURL,
          date: sd.date,
        });
      }
    }
  }

  // Sort by soonest first
  return results.sort((a, b) => {
    const aDate = parseBirthdayDate(a.date);
    const bDate = parseBirthdayDate(b.date);
    return aDate.getTime() - bDate.getTime();
  });
}

/**
 * Parse a birthday date string to a Date for sorting purposes.
 */
function parseBirthdayDate(dateStr: string): Date {
  const today = new Date();
  const parts = dateStr.split('-');
  const month = parts.length === 3 ? parseInt(parts[1], 10) : parseInt(parts[0], 10);
  const day = parts.length === 3 ? parseInt(parts[2], 10) : parseInt(parts[1], 10);
  const date = new Date(today.getFullYear(), month - 1, day);
  if (date < today) {
    date.setFullYear(today.getFullYear() + 1);
  }
  return date;
}

/**
 * Calculate the current streak of consecutive days where all pings were completed.
 * Looks back from yesterday, counting days where every ping was completed or skipped.
 */
async function calculateStreak(userId: string): Promise<number> {
  // Import listPings directly for streak calculation
  const { listPings } = await import('@/lib/dal');

  // Get completed/skipped pings from the last 60 days to determine streak
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [completed, skipped, allRecent] = await Promise.all([
    listPings(userId, {
      status: 'completed',
      scheduledAfter: sixtyDaysAgo.toISOString(),
      limit: 100,
    }),
    listPings(userId, {
      status: 'skipped',
      scheduledAfter: sixtyDaysAgo.toISOString(),
      limit: 100,
    }),
    listPings(userId, {
      scheduledAfter: sixtyDaysAgo.toISOString(),
      limit: 100,
    }),
  ]);

  // Group all pings by date (YYYY-MM-DD)
  const allPingsByDate = new Map<string, { total: number; done: number }>();

  for (const ping of allRecent.data) {
    const dateKey = ping.scheduledDate.split('T')[0];
    const entry = allPingsByDate.get(dateKey) ?? { total: 0, done: 0 };
    entry.total++;
    allPingsByDate.set(dateKey, entry);
  }

  // Mark completed/skipped pings
  const donePings = [...completed.data, ...skipped.data];
  for (const ping of donePings) {
    const dateKey = ping.scheduledDate.split('T')[0];
    const entry = allPingsByDate.get(dateKey);
    if (entry) {
      entry.done++;
    }
  }

  // Walk backwards from yesterday
  let streak = 0;
  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - 1);

  for (let i = 0; i < 60; i++) {
    const dateKey = checkDate.toISOString().split('T')[0];
    const entry = allPingsByDate.get(dateKey);

    // If no pings for this day, it doesn't break the streak (no pings scheduled)
    if (!entry || entry.total === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    // If all pings are completed/skipped, continue the streak
    if (entry.done >= entry.total) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
