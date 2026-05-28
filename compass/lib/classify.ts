// LLM classifier — given a raw ingested item (title + blurb), infer
// the feed item's type, level range, and job tags. Used by the ingestion
// pipeline before items land in the items table.
//
// Output is constrained to the same enums used elsewhere in the app —
// any parse error returns a safe default (newcomer→user, all jobs, news).

import OpenAI from 'openai';
import type { Level, JobId } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL  = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const LEVELS_LIST: Level[] = ['newcomer', 'curious', 'user', 'ready'];
const JOBS_LIST: JobId[] = ['retail','office','smb','creative','teach','health','trades','student','retired','developer','other'];

export type Classification = {
  type:       'news' | 'tool' | 'prompt' | 'howto';
  level_min:  Level;
  level_max:  Level;
  jobs:       JobId[] | ['all'];
  // 0.0-1.0 — used to decide auto-approve vs queue for review
  confidence: number;
  reason:     string;
};

const SYSTEM = `You classify AI content for a personalized feed called Compass.
For each item, output a JSON object with these fields:

  type        — one of: news | tool | prompt | howto
    news    = a launch, model release, feature update, news story
    tool    = a specific app/service the reader could try
    prompt  = a copy-paste prompt template
    howto   = a guide / explainer / deep dive

  level_min   — minimum AI literacy level this is for. one of: newcomer | curious | user | ready
  level_max   — maximum level. ditto.
    newcomer = never used AI
    curious  = tried it, no system
    user     = uses weekly, knows multiple tools
    ready    = fluent, knows internals

  jobs        — array of job tags this item is relevant for. choose from:
    retail, office, smb, creative, teach, health, trades, student, retired, developer
    OR a single-item array ["all"] if it's relevant to everyone

  confidence  — 0.0 to 1.0, how sure you are about the tags
  reason      — one sentence explaining the choice (for admin review)

Be conservative: when in doubt, widen the level range and use ["all"] jobs.
When the item is clearly technical (mentions API, code, agent patterns, model internals)
narrow level_min to "user" or "ready" and jobs to ["developer"].

Output ONLY the JSON object. No prose, no markdown fences.`;

const SAFE_DEFAULT: Classification = {
  type: 'news',
  level_min: 'newcomer',
  level_max: 'user',
  jobs: ['all'],
  confidence: 0.3,
  reason: 'fallback (classifier error)',
};

export async function classifyItem(item: { title: string; blurb: string }): Promise<Classification> {
  try {
    const res = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: `TITLE: ${item.title}\nBLURB: ${item.blurb}\n\nOutput the JSON.` },
      ],
      max_tokens: 200,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });
    const raw = res.choices[0]?.message?.content || '';
    const parsed = JSON.parse(raw);

    // Validate + sanitize
    const type = (['news', 'tool', 'prompt', 'howto'] as const).includes(parsed.type) ? parsed.type : 'news';
    const level_min = LEVELS_LIST.includes(parsed.level_min) ? parsed.level_min : 'newcomer';
    const level_max = LEVELS_LIST.includes(parsed.level_max) ? parsed.level_max : 'user';
    let jobs: JobId[] | ['all'] = ['all'];
    if (Array.isArray(parsed.jobs)) {
      if (parsed.jobs.length === 1 && parsed.jobs[0] === 'all') {
        jobs = ['all'];
      } else {
        const valid = parsed.jobs.filter((j: string) => JOBS_LIST.includes(j as JobId)) as JobId[];
        jobs = valid.length ? valid : ['all'];
      }
    }
    const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
    const reason = typeof parsed.reason === 'string' ? parsed.reason.slice(0, 200) : '';

    return { type, level_min, level_max, jobs, confidence, reason };
  } catch (e: any) {
    console.warn('[classify] failed, using default:', e.message);
    return SAFE_DEFAULT;
  }
}
