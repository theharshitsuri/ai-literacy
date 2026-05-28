// LLM caption generation for feed items.
//
// Caption = the one-line "why this matters for you" line under each feed item.
// Same item, different caption depending on which (level, job) cell the user
// is in. We cache aggressively: one row per (item_id, level, job_id) in the
// captions table, generated once, served forever.
//
// generateOrFetchCaption() is the single entry point used by the feed.
import OpenAI from 'openai';
import { sql } from './db';
import { LEVELS } from './levels';
import { JOBS } from './profiling';
import type { Level, JobId, Item } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL  = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Build the system prompt — gives the model the persona and the rules.
function systemPrompt(level: Level, job: JobId): string {
  const lvl = LEVELS[level];
  const jobMeta = JOBS.find(j => j.id === job);
  return `You write one-line "why this matters for YOU" captions for Compass — a personalized AI content feed.

The reader is at the ${lvl.name} level — ${lvl.short.toLowerCase()}
Their work is: ${jobMeta?.label || 'unspecified'} (${jobMeta?.sample || ''}).

You will receive a feed item (title + blurb). Output ONE sentence:
- Speaks directly to this specific reader using "you"
- Frames the item through THEIR work and skill level
- Concrete — name a specific thing they'd actually do with this
- 25 words max
- No emojis, no exclamation marks, no marketing voice
- Don't restate the title. Add a perspective the title doesn't have.

Output the sentence and nothing else.`;
}

export async function generateCaption(item: Item, level: Level, job: JobId): Promise<string> {
  const userPrompt = `TITLE: ${item.title}\nBLURB: ${item.blurb}\n\nWrite the one-line caption.`;
  try {
    const r = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt(level, job) },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 80,
      temperature: 0.6,
    });
    let text = r.choices[0]?.message?.content?.trim() || '';
    // strip wrapping quotes if present
    text = text.replace(/^["']|["']$/g, '').trim();
    if (!text) throw new Error('empty caption');
    return text;
  } catch (e) {
    // Fallback — use the blurb itself, prefixed neutrally
    return `Worth checking — relevant to your ${JOBS.find(j => j.id === job)?.label.toLowerCase() || 'work'} at the ${LEVELS[level].name} level.`;
  }
}

export async function generateOrFetchCaption(item: Item, level: Level, job: JobId): Promise<string> {
  // 1. cache hit? (the path taken 99%+ of the time after prebake)
  const cached = await sql`
    select caption from captions
    where item_id = ${item.id} and level = ${level} and job_id = ${job}
    limit 1
  ` as unknown as Array<{ caption: string }>;
  if (cached.length) return cached[0].caption;

  // 2. miss — generate + cache.
  //   This path is rare in prod (only hit when items are added between
  //   prebake runs). The user waits ~1-2s on the OpenAI call. We cache
  //   so the next visit is instant.
  const caption = await generateCaption(item, level, job);
  // Fire-and-forget cache write — if the DB write fails we still return
  // the caption so the user's page doesn't break.
  sql`
    insert into captions (item_id, level, job_id, caption, model)
    values (${item.id}, ${level}, ${job}, ${caption}, ${MODEL})
    on conflict (item_id, level, job_id) do nothing
  `.catch(err => console.error('[compass] caption cache write failed:', err));
  return caption;
}
