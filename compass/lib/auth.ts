// Clerk auth helpers (server-side only — do not import from client code).
//
// As of Clerk v6, `auth()` returns a Promise — both helpers below are async.
// Every call site must `await` the return.
//
// Use `currentUserId()` when an unauthenticated visit is OK. Use
// `requireUserId()` in server actions / route handlers that must have a user.
import { auth } from '@clerk/nextjs/server';

export async function currentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return userId;
}
