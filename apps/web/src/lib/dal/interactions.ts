import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type {
  Interaction,
  CreateInteractionReq,
  ListInteractionsParams,
  PaginatedResponse,
  ISODateTime,
} from '@touchbase/shared';

const COLLECTION = 'interactions';
const CONTACTS_COLLECTION = 'contacts';
const DEFAULT_LIMIT = 20;

/** Convert a Firestore Timestamp (or ISO string) to an ISO string. */
function toISO(value: Timestamp | string): ISODateTime {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
}

/** Convert a Firestore document snapshot to an Interaction with ISO strings. */
function docToInteraction(doc: FirebaseFirestore.DocumentSnapshot): Interaction {
  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: toISO(data.createdAt),
    date: toISO(data.date),
  } as Interaction;
}

/**
 * Calculate a health score based on how recently and frequently
 * the user has interacted with a contact.
 *
 * Score ranges from 0 (cold) to 100 (very healthy).
 * - The more recent the last interaction, the higher the score.
 * - A variety of interaction types boosts the score slightly.
 */
function calculateHealthScore(
  lastInteractionAt: string,
  frequencyDays: number,
  recentTypes: string[],
): number {
  const now = Date.now();
  const lastDate = new Date(lastInteractionAt).getTime();
  const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);

  // Base score: decays linearly from 100 -> 0 over 2x the expected frequency
  const decayWindow = frequencyDays * 2;
  let score = Math.max(0, 100 - (daysSince / decayWindow) * 100);

  // Variety bonus: up to +10 for using different interaction types
  const uniqueTypes = new Set(recentTypes).size;
  const varietyBonus = Math.min(uniqueTypes * 2, 10);
  score = Math.min(100, score + varietyBonus);

  return Math.round(score);
}

/**
 * Create a new interaction and update the related contact's health score.
 */
export async function createInteraction(
  userId: string,
  data: CreateInteractionReq,
): Promise<Interaction> {
  const col = adminDb.collection(COLLECTION);
  const id = col.doc().id;
  const now = new Date().toISOString();

  const interaction: Interaction = {
    ...data,
    id,
    userId,
    createdAt: now,
  };

  // Use a batch to atomically create the interaction and update the contact
  const batch = adminDb.batch();

  // 1. Create the interaction document
  batch.set(col.doc(id), interaction);

  // 2. Update the parent contact's lastInteractionAt and recalculate healthScore
  const contactRef = adminDb.collection(CONTACTS_COLLECTION).doc(data.contactId);
  const contactSnap = await contactRef.get();

  if (contactSnap.exists && contactSnap.data()?.userId === userId) {
    const contactData = contactSnap.data()!;
    const frequencyDays = contactData.customFrequencyDays ?? 30;

    // Get recent interaction types for health calculation
    const recentTypes = await getRecentInteractionTypes(userId, data.contactId, 10);
    // Include the new interaction type in the calculation
    recentTypes.unshift(data.type);

    const healthScore = calculateHealthScore(
      interaction.date,
      frequencyDays,
      recentTypes,
    );

    batch.update(contactRef, {
      lastInteractionAt: interaction.date,
      healthScore,
      updatedAt: now,
    });
  }

  await batch.commit();

  return interaction;
}

/**
 * List interactions with cursor pagination and filters.
 */
export async function listInteractions(
  userId: string,
  params: ListInteractionsParams,
): Promise<PaginatedResponse<Interaction>> {
  const {
    cursor,
    limit = DEFAULT_LIMIT,
    contactId,
    type,
    after,
    before,
  } = params;

  let query: FirebaseFirestore.Query = adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId);

  if (contactId) {
    query = query.where('contactId', '==', contactId);
  }

  if (type) {
    query = query.where('type', '==', type);
  }

  if (after) {
    query = query.where('date', '>=', after);
  }

  if (before) {
    query = query.where('date', '<=', before);
  }

  query = query.orderBy('date', 'desc');

  // Cursor-based pagination
  if (cursor) {
    const cursorDoc = await adminDb.collection(COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.limit(limit + 1).get();
  let interactions = snapshot.docs.map(docToInteraction);

  const hasMore = interactions.length > limit;
  if (hasMore) {
    interactions = interactions.slice(0, limit);
  }

  const nextCursor =
    hasMore && interactions.length > 0
      ? interactions[interactions.length - 1].id
      : undefined;

  return {
    data: interactions,
    nextCursor,
    hasMore,
  };
}

/**
 * Delete an interaction.
 */
export async function deleteInteraction(
  userId: string,
  interactionId: string,
): Promise<void> {
  const docRef = adminDb.collection(COLLECTION).doc(interactionId);

  const existing = await docRef.get();
  if (!existing.exists || existing.data()?.userId !== userId) {
    throw new Error('Interaction not found');
  }

  await docRef.delete();
}

/**
 * Get the most recent interaction types for a contact.
 * Useful for health score calculations (variety bonus).
 */
export async function getRecentInteractionTypes(
  userId: string,
  contactId: string,
  limit: number = 10,
): Promise<string[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('contactId', '==', contactId)
    .orderBy('date', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data().type as string);
}
