// Ingest orchestrator — runs Reddit + HN + RSS in parallel, dedupes by URL
// against the items table, runs each new item through the LLM classifier,
// inserts as status='live' if confidence is high, otherwise 'pending' for
// admin review.
//
// Called by:
//   - app/api/cron/ingest/route.ts  (Vercel cron, runs daily)
//   - npm run db:ingest             (manual)

import { sql } from '../db';
import { classifyItem } from '../classify';
import { fetchRedditItems, type RawIngestedItem } from './reddit';
import { fetchHNItems } from './hn';
import { fetchRssItems } from './rss';
import { fetchProductHuntItems } from './producthunt';

// Above this confidence threshold, items skip the review queue and go live.
const AUTO_APPROVE_THRESHOLD = 0.7;

// Max items per source per run (cost / spam control)
const PER_RUN_LIMIT = 80;

export type IngestStats = {
  fetched: number;
  duplicates: number;
  classified: number;
  approved: number;
  pending: number;
  failed: number;
  durationMs: number;
};

export async function runIngest(): Promise<IngestStats> {
  const t0 = Date.now();

  console.log('  fetching from reddit, hn, rss, producthunt…');
  // 1. fetch from all sources in parallel — each source has its own timeouts
  const [reddit, hn, rss, ph] = await Promise.all([
    fetchRedditItems().catch(e => { console.error('reddit:', e); return []; }),
    fetchHNItems().catch(e => { console.error('hn:', e); return []; }),
    fetchRssItems().catch(e => { console.error('rss:', e); return []; }),
    fetchProductHuntItems().catch(e => { console.error('producthunt:', e); return []; }),
  ]);
  console.log(`  ✓ reddit ${reddit.length} · hn ${hn.length} · rss ${rss.length} · producthunt ${ph.length}`);
  const raw: RawIngestedItem[] = [...reddit, ...hn, ...rss, ...ph].slice(0, PER_RUN_LIMIT);

  // 2. dedupe against DB (drop already-known URLs)
  const urls = raw.map(r => r.source_url);
  if (urls.length === 0) {
    return { fetched: 0, duplicates: 0, classified: 0, approved: 0, pending: 0, failed: 0, durationMs: Date.now() - t0 };
  }
  const existing = await sql`
    select source_url from items where source_url = any(${urls as any})
  ` as unknown as Array<{ source_url: string }>;
  const known = new Set(existing.map(r => r.source_url));
  const fresh = raw.filter(r => !known.has(r.source_url));

  // 3. classify each fresh item via LLM (sequentially — keeps rate-limit headroom)
  let approved = 0, pending = 0, failed = 0, classified = 0;
  console.log(`  classifying ${fresh.length} new items via LLM…`);
  for (const item of fresh) {
    try {
      const c = await classifyItem({ title: item.title, blurb: item.blurb });
      const autoApprove = c.confidence >= AUTO_APPROVE_THRESHOLD;
      const status = autoApprove ? 'live' : 'pending';

      await sql`
        insert into items (
          source, source_url, title, blurb, type,
          level_min, level_max, jobs, status,
          published_at, approved_at
        ) values (
          ${item.source}, ${item.source_url}, ${item.title}, ${item.blurb}, ${c.type},
          ${c.level_min}, ${c.level_max}, ${c.jobs as any}, ${status},
          ${item.published_at}, ${autoApprove ? new Date().toISOString() : null}
        )
        on conflict (source_url) do nothing
      `;
      classified++;
      if (autoApprove) approved++;
      else pending++;
      if (classified % 5 === 0) process.stdout.write(`  classified ${classified}/${fresh.length}\r`);
    } catch (e: any) {
      console.error(`[ingest] failed on "${item.title.slice(0, 60)}":`, e.message);
      failed++;
    }
  }

  return {
    fetched: raw.length,
    duplicates: raw.length - fresh.length,
    classified,
    approved,
    pending,
    failed,
    durationMs: Date.now() - t0,
  };
}
