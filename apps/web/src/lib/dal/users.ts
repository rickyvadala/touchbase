import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type {
  User,
  UpdateUserReq,
  ISODateTime,
} from '@touchbase/shared';
import { DEFAULT_USER_SETTINGS } from '@touchbase/shared';

const COLLECTION = 'users';

/** Convert a Firestore Timestamp (or ISO string) to an ISO string. */
function toISO(value: Timestamp | string): ISODateTime {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
}

/** Convert a Firestore document snapshot to a User with ISO strings. */
function docToUser(doc: FirebaseFirestore.DocumentSnapshot): User {
  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  } as User;
}

/**
 * Get or create a user on first login (upsert).
 * If the user already exists, update displayName, photoURL, and updatedAt.
 * If not, create a new user with default settings.
 */
export async function getOrCreateUser(
  id: string,
  email: string,
  displayName: string,
  photoURL?: string,
): Promise<User> {
  const docRef = adminDb.collection(COLLECTION).doc(id);
  const existing = await docRef.get();
  const now = new Date().toISOString();

  if (existing.exists) {
    // Update login-related fields
    const updates: Record<string, unknown> = {
      displayName,
      updatedAt: now,
    };
    if (photoURL !== undefined) {
      updates.photoURL = photoURL;
    }

    await docRef.update(updates);
    const updated = await docRef.get();
    return docToUser(updated);
  }

  // Create new user with defaults
  const user: User = {
    id,
    email,
    displayName,
    ...(photoURL ? { photoURL } : {}),
    settings: { ...DEFAULT_USER_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(user);
  return user;
}

/**
 * Get a user by ID.
 */
export async function getUser(userId: string): Promise<User | null> {
  const doc = await adminDb.collection(COLLECTION).doc(userId).get();
  if (!doc.exists) return null;
  return docToUser(doc);
}

/**
 * Update a user's profile and/or settings.
 * Settings are merged (partial update), not replaced.
 */
export async function updateUser(
  userId: string,
  data: UpdateUserReq,
): Promise<User> {
  const docRef = adminDb.collection(COLLECTION).doc(userId);

  const existing = await docRef.get();
  if (!existing.exists) {
    throw new Error('User not found');
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    updatedAt: now,
  };

  // Handle top-level fields
  if (data.displayName !== undefined) {
    updates.displayName = data.displayName;
  }
  if (data.photoURL !== undefined) {
    updates.photoURL = data.photoURL;
  }

  // Merge settings partially — preserve existing settings not included in the update
  if (data.settings) {
    const existingSettings = existing.data()?.settings ?? {};
    updates.settings = {
      ...existingSettings,
      ...data.settings,
    };
  }

  await docRef.update(updates);

  const updated = await docRef.get();
  return docToUser(updated);
}
