import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type {
  Contact,
  CreateContactReq,
  UpdateContactReq,
  ListContactsParams,
  PaginatedResponse,
  ISODateTime,
} from '@touchbase/shared';

const COLLECTION = 'contacts';
const DEFAULT_LIMIT = 20;
const DEFAULT_HEALTH_SCORE = 50;

/** Convert a Firestore document snapshot to a Contact with ISO strings. */
function docToContact(doc: FirebaseFirestore.DocumentSnapshot): Contact {
  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    lastInteractionAt: data.lastInteractionAt ? toISO(data.lastInteractionAt) : undefined,
    nextPingAt: toISO(data.nextPingAt),
  } as Contact;
}

/** Convert a Firestore Timestamp (or ISO string) to an ISO string. */
function toISO(value: Timestamp | string): ISODateTime {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
}

/**
 * Calculate the next ping date given a frequency in days from now.
 */
function computeNextPingAt(frequencyDays: number): ISODateTime {
  const date = new Date();
  date.setDate(date.getDate() + frequencyDays);
  return date.toISOString();
}

/**
 * Create a new contact for a user.
 */
export async function createContact(
  userId: string,
  data: CreateContactReq,
): Promise<Contact> {
  const col = adminDb.collection(COLLECTION);
  const id = col.doc().id;
  const now = new Date().toISOString();

  const frequencyDays = data.customFrequencyDays ?? 30;
  const nextPingAt = computeNextPingAt(frequencyDays);

  const contact: Contact = {
    ...data,
    id,
    userId,
    healthScore: DEFAULT_HEALTH_SCORE,
    nextPingAt,
    createdAt: now,
    updatedAt: now,
  };

  await col.doc(id).set(contact);
  return contact;
}

/**
 * Get a single contact by ID, scoped to the user.
 */
export async function getContact(
  userId: string,
  contactId: string,
): Promise<Contact | null> {
  const doc = await adminDb.collection(COLLECTION).doc(contactId).get();
  if (!doc.exists) return null;

  const contact = docToContact(doc);
  if (contact.userId !== userId) return null;

  return contact;
}

/**
 * List contacts with cursor pagination, search, filtering, and sorting.
 */
export async function listContacts(
  userId: string,
  params: ListContactsParams,
): Promise<PaginatedResponse<Contact>> {
  const {
    cursor,
    limit = DEFAULT_LIMIT,
    circleId,
    search,
    healthBelow,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  let query: FirebaseFirestore.Query = adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId);

  // Filter by circle
  if (circleId) {
    query = query.where('circleId', '==', circleId);
  }

  // Filter contacts whose health score is below a threshold
  if (healthBelow !== undefined) {
    query = query.where('healthScore', '<', healthBelow);
  }

  // Determine the Firestore field to sort on
  const sortFieldMap: Record<string, string> = {
    name: 'firstName',
    healthScore: 'healthScore',
    lastInteractionAt: 'lastInteractionAt',
    nextPingAt: 'nextPingAt',
  };
  const orderByField = sortFieldMap[sortBy] ?? 'firstName';

  // When healthBelow is used, Firestore requires the inequality field first in orderBy.
  // We only add the explicit sort if it doesn't conflict, or it is the same field.
  if (healthBelow !== undefined && orderByField !== 'healthScore') {
    query = query.orderBy('healthScore', 'asc').orderBy(orderByField, sortOrder);
  } else {
    query = query.orderBy(orderByField, sortOrder);
  }

  // Cursor-based pagination: startAfter the cursor document
  if (cursor) {
    const cursorDoc = await adminDb.collection(COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  // Fetch one extra to detect if there are more results
  const snapshot = await query.limit(limit + 1).get();

  let contacts = snapshot.docs.map(docToContact);

  // Client-side search filtering on firstName / lastName
  if (search) {
    const lowerSearch = search.toLowerCase();
    contacts = contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(lowerSearch) ||
        c.lastName.toLowerCase().includes(lowerSearch),
    );
  }

  const hasMore = contacts.length > limit;
  if (hasMore) {
    contacts = contacts.slice(0, limit);
  }

  const nextCursor = hasMore && contacts.length > 0 ? contacts[contacts.length - 1].id : undefined;

  return {
    data: contacts,
    nextCursor,
    hasMore,
  };
}

/**
 * Update an existing contact.
 */
export async function updateContact(
  userId: string,
  contactId: string,
  data: UpdateContactReq,
): Promise<Contact> {
  const docRef = adminDb.collection(COLLECTION).doc(contactId);

  // Verify ownership
  const existing = await docRef.get();
  if (!existing.exists || existing.data()?.userId !== userId) {
    throw new Error('Contact not found');
  }

  const updates = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await docRef.update(updates);

  const updated = await docRef.get();
  return docToContact(updated);
}

/**
 * Delete a contact.
 */
export async function deleteContact(
  userId: string,
  contactId: string,
): Promise<void> {
  const docRef = adminDb.collection(COLLECTION).doc(contactId);

  // Verify ownership
  const existing = await docRef.get();
  if (!existing.exists || existing.data()?.userId !== userId) {
    throw new Error('Contact not found');
  }

  await docRef.delete();
}

/**
 * Get multiple contacts by their IDs, scoped to the user.
 */
export async function getContactsByIds(
  userId: string,
  ids: string[],
): Promise<Contact[]> {
  if (ids.length === 0) return [];

  // Firestore `in` queries support up to 30 items. Batch if necessary.
  const batchSize = 30;
  const contacts: Contact[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .where('__name__', 'in', batchIds)
      .get();

    contacts.push(...snapshot.docs.map(docToContact));
  }

  return contacts;
}
