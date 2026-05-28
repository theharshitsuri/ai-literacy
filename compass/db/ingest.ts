// Manual ingest runner. Same code path as the Vercel cron — useful for
// pulling a fresh batch on demand (`npm run db:ingest`) without waiting
// for the daily schedule.
//
// .env.local is loaded by tsx via --env-file (see package.json).

import { runIngest } from '../lib/sources';

(async () => {
  console.log('Starting ingest…');
  const stats = await runIngest();
  console.log('\n────────── Ingest report ──────────');
  console.log(`fetched     : ${stats.fetched}`);
  console.log(`duplicates  : ${stats.duplicates}`);
  console.log(`classified  : ${stats.classified}`);
  console.log(`  → live    : ${stats.approved}`);
  console.log(`  → pending : ${stats.pending}`);
  console.log(`failed      : ${stats.failed}`);
  console.log(`elapsed     : ${(stats.durationMs / 1000).toFixed(1)}s`);
  console.log('───────────────────────────────────');
})();
