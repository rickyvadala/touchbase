import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type {
  Ping,
  ActOnPingReq,
  ListPingsParams,
  PaginatedResponse,
  ISODateTime,
} from '@touchbase/shared';

const COLLECTION = 'pings';
const DEFAULT_LIMIT = 20;

/** Convert a Firestore Timestamp (or ISO string) to an ISO string. */
function toISO(value: Timestamp | string): ISODateTime {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
}

/** Convert a Firestore document snapshot to a Ping with ISO strings. */
function docToPing(doc: FirebaseFirestore.DocumentSnapshot): Ping {
  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    scheduledDate: toISO(data.scheduledDate),
    completedAt: data.completedAt ? toISO(data.completedAt) : undefined,
    snoozedUntil: data.snoozedUntil ? toISO(data.snoozedUntil) : undefined,
    createdAt: toISO(data.createdAt),
  } as Ping;
}

/**
 * List pings with cursor pagination and filters.
 */
export async function listPings(
  userId: string,
  params: ListPingsParams,
): Promise<PaginatedResponse<Ping>> {
  const {
    cursor,
    limit = DEFAULT_LIMIT,
    status,
    scheduledBefore,
    scheduledAfter,
  } = params;

  let query: FirebaseFirestore.Query = adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId);

  if (status) {
    query = query.where('status', '==', status);
  }

  if (scheduledAfter) {
    query = query.where('scheduledDate', '>=', scheduledAfter);
  }

  if (scheduledBefore) {
    query = query.where('scheduledDate', '<=', scheduledBefore);
  }

  query = query.orderBy('scheduledDate', 'asc');

  // Cursor-based pagination
  if (cursor) {
    const cursorDoc = await adminDb.collection(COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.limit(limit + 1).get();
  let pings = snapshot.docs.map(docToPing);

  const hasMore = pings.length > limit;
  if (hasMore) {
    pings = pings.slice(0, limit);
  }

  const nextCursor =
    hasMore && pings.length > 0 ? pings[pings.length - 1].id : undefined;

  return {
    data: pings,
    nextCursor,
    hasMore,
  };
}

/**
 * Act on a ping — complete, skip, or snooze.
 */
export async function actOnPing(
  userId: string,
  pingId: string,
  data: ActOnPingReq,
): Promise<Ping> {
  const docRef = adminDb.collection(COLLECTION).doc(pingId);

  const existing = await docRef.get();
  if (!existing.exists || existing.data()?.userId !== userId) {
    throw new Error('Ping not found');
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {};

  switch (data.action) {
    case 'complete':
      updates.status = 'completed';
      updates.completedAt = now;
      break;
    case 'skip':
      updates.status = 'skipped';
      updates.completedAt = now;
      break;
    case 'snooze':
      updates.status = 'snoozed';
      updates.snoozedUntil = data.snoozedUntil ?? (() => {
        // Default snooze: 1 day from now
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString();
      })();
      break;
    default:
      throw new Error(`Unknown ping action: ${data.action}`);
  }

  await docRef.update(updates);

  const updated = await docRef.get();
  return docToPing(updated);
}

/**
 * Create a new ping for a contact.
 */
export async function createPing(
  userId: string,
  contactId: string,
  scheduledDate: ISODateTime,
): Promise<Ping> {
  const col = adminDb.collection(COLLECTION);
  const id = col.doc().id;
  const now = new Date().toISOString();

  const ping: Ping = {
    id,
    userId,
    contactId,
    scheduledDate,
    status: 'pending',
    createdAt: now,
  };

  await col.doc(id).set(ping);
  return ping;
}

/**
 * Get all pending pings for a user on a specific date.
 * Matches pings whose scheduledDate falls on the given calendar day.
 */
export async function getPendingPingsForDate(
  userId: string,
  date: ISODateTime,
): Promise<Ping[]> {
  // Build the start and end of the target day
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .where('scheduledDate', '>=', startOfDay.toISOString())
    .where('scheduledDate', '<=', endOfDay.toISOString())
    .orderBy('scheduledDate', 'asc')
    .get();

  return snapshot.docs.map(docToPing);
}

/**
 * Count overdue pending pings (scheduled before today).
 */
export async function getOverduePingsCount(userId: string): Promise<number> {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .where('scheduledDate', '<', now.toISOString())
    .get();

  return snapshot.size;
}
