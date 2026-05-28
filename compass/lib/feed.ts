// Server-side feed helpers — pull items relevant to a user's profile,
// apply per-type budget, and hand back with cached LLM captions attached.
//
// Empty-feed problem: small DB + narrow tagging means some (level × job)
// cells have zero matches. We use a 3-stage widening fallback to make
// sure every user sees SOMETHING worth reading even in a thin catalog:
//
//   Stage 1: strict match (user's level fits item's range, user's job in
//            item's job list — or item is tagged 'all')
//   Stage 2: same level, any job (everyone's tagged content)
//   Stage 3: adjacent level (±1), any job
//
// Each stage adds NEW items only (dedup by id). Stops once we have
// `limit` items.

import { sql } from './db';
import { generateOrFetchCaption } from './captions';
import type { Item, Level, JobId, Profile } from './types';

export type FeedItem = Item & { caption: string };

const LEVEL_ORDER: Record<Level, number> = { newcomer: 0, curious: 1, user: 2, ready: 3 };
const LEVELS_BY_IDX: Level[] = ['newcomer', 'curious', 'user', 'ready'];

// Hard cap per type so the feed doesn't end up 90% news.
const TYPE_BUDGET: Record<Item['type'], number> = {
  news: 5,
  tool: 3,
  prompt: 3,
  howto: 2,
};

// Single SQL query — fetches a wide pool, we filter + score in JS.
async function fetchPool(limit = 100): Promise<Item[]> {
  return await sql`
    select id, source, source_url, title, blurb, type,
           level_min, level_max, jobs, status, published_at, approved_at, created_at
    from items
    where status = 'live'
    order by published_at desc nulls last, created_at desc
    limit ${limit}
  ` as unknown as Item[];
}

function inLevelRange(item: Item, levelIdx: number): boolean {
  return LEVEL_ORDER[item.level_min] <= levelIdx && LEVEL_ORDER[item.level_max] >= levelIdx;
}

function jobMatches(item: Item, jobId: JobId): boolean {
  const jobs = (item.jobs || []) as string[];
  return jobs.includes(jobId) || jobs.includes('all');
}

function applyTypeBudget(items: Item[], limit: number): Item[] {
  const counts: Record<Item['type'], number> = { news: 0, tool: 0, prompt: 0, howto: 0 };
  const out: Item[] = [];
  for (const it of items) {
    if (counts[it.type] >= TYPE_BUDGET[it.type]) continue;
    counts[it.type]++;
    out.push(it);
    if (out.length >= limit) break;
  }
  return out;
}

export async function getFeedItems(
  profile: Pick<Profile, 'user_id' | 'level' | 'job_id'>,
  limit: number = 12,
): Promise<FeedItem[]> {
  if (!profile.level || !profile.job_id) return [];

  const pool = await fetchPool(100);
  const userLevelIdx = LEVEL_ORDER[profile.level];
  const job = profile.job_id as JobId;

  const picked: Item[] = [];
  const pickedIds = new Set<string>();
  const consider = (cands: Item[]) => {
    const fresh = cands.filter(c => !pickedIds.has(c.id));
    const budgeted = applyTypeBudget([...picked, ...fresh], limit);
    picked.length = 0;
    pickedIds.clear();
    for (const it of budgeted) {
      picked.push(it);
      pickedIds.add(it.id);
    }
  };

  // Stage 1: strict — exact level + job match
  consider(pool.filter(it => inLevelRange(it, userLevelIdx) && jobMatches(it, job)));
  if (picked.length >= limit) return await attachCaptions(picked, profile);

  // Stage 2: same level, any job (the 'all jobs' evergreens)
  consider(pool.filter(it => inLevelRange(it, userLevelIdx)));
  if (picked.length >= limit) return await attachCaptions(picked, profile);

  // Stage 3: adjacent levels (±1), any job
  const minIdx = Math.max(0, userLevelIdx - 1);
  const maxIdx = Math.min(3, userLevelIdx + 1);
  consider(pool.filter(it => {
    const lo = LEVEL_ORDER[it.level_min];
    const hi = LEVEL_ORDER[it.level_max];
    return hi >= minIdx && lo <= maxIdx;
  }));
  if (picked.length >= limit) return await attachCaptions(picked, profile);

  // Stage 4 — absolute fallback. Pure "latest live items regardless of
  // tagging". Guarantees the feed is never empty even if classification
  // is wrong, the seed is sparse, or the user's cell is truly novel.
  consider(pool);

  return await attachCaptions(picked, profile);
}

async function attachCaptions(items: Item[], profile: Pick<Profile, 'level' | 'job_id'>): Promise<FeedItem[]> {
  const level = profile.level!;
  const job   = profile.job_id as JobId;
  return await Promise.all(items.map(async (item) => ({
    ...item,
    caption: await generateOrFetchCaption(item, level, job),
  })));
}

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const rows = await sql`
    select user_id, email, job_id, job_other, level, theta::float as theta, goal_text, created_at, updated_at
    from profiles where user_id = ${userId} limit 1
  ` as unknown as Array<any>;
  return rows[0] ?? null;
}
