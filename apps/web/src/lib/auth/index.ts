export { handlers, auth, signIn, signOut } from './config';

/**
 * Get the current server-side session.
 * Convenience wrapper around `auth()` for use in Server Components and Route Handlers.
 */
export async function getSession() {
  const { auth } = await import('./config');
  return auth();
}
