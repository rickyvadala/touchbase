import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _db: Firestore | null = null;

function getAdminApp() {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : '',
  };

  return initializeApp({ credential: cert(serviceAccount) });
}

/** Firebase Admin Firestore instance (lazy singleton) */
export function getAdminDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getAdminApp());
  }
  return _db;
}

/** Convenience alias */
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
