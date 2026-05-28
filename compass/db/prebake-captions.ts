// Pre-bake every (item × level × job) caption ahead of time so the feed
// page is instant during a demo. Total cost is ~$0.25-0.50 for the full
// catalog, paid once.
//
// Run AFTER db:seed:
//   npm run db:seed
//   npm run db:captions
//
// Idempotent: skips any (item, level, job) tuple already in the captions
// table. Safe to re-run after adding new items.
//
// .env.local is loaded by tsx via --env-file (see package.json).

import { sql } from '../lib/db';
import { generateCaption } from '../lib/captions';
import { JOBS } from '../lib/profiling';
import type { Item, Level } from '../lib/types';

const LEVELS: Level[] = ['newcomer', 'curious', 'user', 'ready'];

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set in .env.local');
    process.exit(1);
  }

  const items = await sql`
    select id, source, source_url, title, blurb, type, level_min, level_max, jobs, status, published_at, approved_at, created_at
    from items where status = 'live'
  ` as unknown as Item[];

  const cellsTotal = items.length * LEVELS.length * JOBS.length;
  console.log(`Catalog: ${items.length} items × ${LEVELS.length} levels × ${JOBS.length} jobs = ${cellsTotal} cells`);
  console.log('Skipping cells already cached…\n');

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    for (const level of LEVELS) {
      for (const job of JOBS) {
        const cached = await sql`
          select 1 from captions where item_id = ${item.id} and level = ${level} and job_id = ${job.id} limit 1
        ` as unknown as Array<unknown>;
        if (cached.length) { skipped++; continue; }
        try {
          const caption = await generateCaption(item, level, job.id);
          await sql`
            insert into captions (item_id, level, job_id, caption, model)
            values (${item.id}, ${level}, ${job.id}, ${caption}, ${process.env.OPENAI_MODEL || 'gpt-4o-mini'})
            on conflict (item_id, level, job_id) do nothing
          `;
          generated++;
          if (generated % 10 === 0) {
            process.stdout.write(`  ${generated} generated · ${skipped} skipped · ${failed} failed\r`);
          }
        } catch (e: any) {
          failed++;
          console.error(`  ✗ ${item.title.slice(0, 50)} (${level} × ${job.id}): ${e.message}`);
        }
      }
    }
  }

  console.log('\n');
  console.log(`✓ Done. Generated ${generated}, skipped ${skipped}, failed ${failed}.`);
  console.log(`Total cached captions: ${generated + skipped} / ${cellsTotal}`);
}

main().catch(e => { console.error(e); process.exit(1); });
