// Neon Postgres client.
//
// Uses @neondatabase/serverless, which is a fetch-based driver that works
// in edge runtimes, standard Node, and the `tsx` scripts in db/. DATABASE_URL
// is a server secret — Next won't expose it client-side because it lacks
// the NEXT_PUBLIC_ prefix. Don't import this from client components.
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local — Neon → Dashboard → Connection string.');
}

// `sql` is a tagged-template function. Use it like:
//   const rows = await sql`select * from profiles where user_id = ${userId}`;
// Parameters are automatically escaped. Returns Row[].
export const sql = neon(process.env.DATABASE_URL);
