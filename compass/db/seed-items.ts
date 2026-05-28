// Seed feed items — runs once against the live DB to populate the items
// table so a newly-signed-up user sees a non-empty feed on day one.
//
// Usage:
//   cd compass && npm run db:seed     (script defined in package.json)
//
// .env.local is loaded by tsx via the --env-file flag (see package.json).
// Upserts each item by source_url so it's idempotent — re-run safely
// any time you tweak the catalog.
//
// ─── URL policy ──────────────────────────────────────────────────
// Every URL below is the ROOT of a real, verified domain — blog
// homepages, library indexes, product pages, subreddit landings.
// We don't fabricate specific deep slugs. The ingest pipeline
// (`npm run db:ingest`) replaces these with current real-thread URLs
// from Reddit/HN/RSS/ProductHunt as it runs.
// ─────────────────────────────────────────────────────────────────

import { sql } from '../lib/db';
import type { Level, JobId } from '../lib/types';

type SeedItem = {
  source: string;
  source_url: string;
  title: string;
  blurb: string;
  type: 'news' | 'tool' | 'prompt' | 'howto';
  level_min?: Level;
  level_max?: Level;
  jobs?: JobId[] | ['all'];
  published_at?: string;
};

const ITEMS: SeedItem[] = [
  // ─── NEWS ─── canonical blog homepages (real, will always exist) ─
  {
    source: 'openai-blog',
    source_url: 'https://openai.com/news/',
    title: "OpenAI's news room — model launches, feature drops",
    blurb: "The official feed for everything OpenAI ships. GPT updates, ChatGPT features, API releases. The most-watched product page in AI right now.",
    type: 'news',
    level_min: 'newcomer',
    level_max: 'ready',
    jobs: ['all'],
  },
  {
    source: 'anthropic-news',
    source_url: 'https://www.anthropic.com/news',
    title: "Anthropic's news room — Claude releases + safety research",
    blurb: 'Where Anthropic publishes Claude model launches, capability updates, and safety research. Slower cadence than OpenAI, deeper writing.',
    type: 'news',
    level_min: 'curious',
    level_max: 'ready',
    jobs: ['all'],
  },
  {
    source: 'google-blog',
    source_url: 'https://blog.google/technology/ai/',
    title: 'Google AI blog — Gemini, NotebookLM, AI Overviews',
    blurb: "Google's AI announcements landing page. Gemini updates, Workspace integrations, NotebookLM features, AI Overviews changes.",
    type: 'news',
    level_min: 'newcomer',
    level_max: 'user',
    jobs: ['office', 'creative', 'teach'],
  },
  {
    source: 'huggingface-blog',
    source_url: 'https://huggingface.co/blog',
    title: 'HuggingFace blog — open-source AI weekly',
    blurb: 'Where the open-source AI community lives. New models, fine-tuning techniques, evaluations. More technical than the labs.',
    type: 'news',
    level_min: 'user',
    level_max: 'ready',
    jobs: ['developer'],
  },

  // ─── TOOLS ─── real product sites ───────────────────────────────
  {
    source: 'tool-curated',
    source_url: 'https://granola.ai',
    title: 'Granola — meeting notes without a recording bot',
    blurb: "Runs locally on your laptop, transcribes from your mic, writes the notes after the call. Free tier covers ~25 meetings/month. No bot joining your calls.",
    type: 'tool',
    level_min: 'curious',
    level_max: 'ready',
    jobs: ['office', 'smb', 'developer', 'creative'],
  },
  {
    source: 'tool-curated',
    source_url: 'https://www.cursor.com',
    title: 'Cursor — VS Code with Claude inside it',
    blurb: 'AI-native code editor. Inline diff edits, codebase-wide chat, agent mode that edits across files. Free tier exists; pro is $20/mo.',
    type: 'tool',
    level_min: 'user',
    level_max: 'ready',
    jobs: ['developer'],
  },
  {
    source: 'tool-curated',
    source_url: 'https://elevenlabs.io',
    title: 'ElevenLabs — clone your own voice in 60 seconds',
    blurb: 'Record 30 seconds reading aloud, get a voice clone you can type into. Useful for narrated content, podcast intros, voice notes you wrote in text.',
    type: 'tool',
    level_min: 'curious',
    level_max: 'ready',
    jobs: ['creative', 'teach', 'smb'],
  },
  {
    source: 'tool-curated',
    source_url: 'https://www.napkin.ai',
    title: 'Napkin — text to clean visual',
    blurb: 'Paste any text, get auto-generated diagrams, flowcharts, and visual notes. Useful for turning slack-thread decisions into a shareable visual.',
    type: 'tool',
    level_min: 'newcomer',
    level_max: 'user',
    jobs: ['office', 'creative', 'teach', 'student'],
  },
  {
    source: 'tool-curated',
    source_url: 'https://notebooklm.google.com',
    title: 'NotebookLM — chat with your own PDFs and docs',
    blurb: 'Upload PDFs, contracts, instruction booklets. Ask questions in plain English. Source paragraphs are cited. Free. Genuinely good for non-technical users.',
    type: 'tool',
    level_min: 'newcomer',
    level_max: 'curious',
    jobs: ['all'],
  },
  {
    source: 'tool-curated',
    source_url: 'https://www.otter.ai',
    title: 'Otter.ai — voice memo → written notes',
    blurb: 'Record voice notes from your phone; get clean written transcripts plus AI summaries. Free tier covers ~300 minutes/month.',
    type: 'tool',
    level_min: 'newcomer',
    level_max: 'user',
    jobs: ['retail', 'health', 'office'],
  },
  {
    source: 'producthunt',
    source_url: 'https://www.producthunt.com/topics/artificial-intelligence',
    title: 'Today on ProductHunt — AI launches',
    blurb: "The AI section of ProductHunt — fresh AI tools launching today. Comments under each tell you what's actually useful vs hype. Updates daily.",
    type: 'tool',
    level_min: 'curious',
    level_max: 'ready',
    jobs: ['all'],
  },

  // ─── PROMPTS ─── point at canonical libraries ───────────────────
  {
    source: 'anthropic-prompt-library',
    source_url: 'https://docs.anthropic.com/en/resources/prompt-library/library',
    title: "Anthropic's prompt library — 150+ vetted templates",
    blurb: "Anthropic's catalog of vetted prompts across writing, coding, analysis, customer support. Filter by use case. The best starting point if you don't know what to ask AI.",
    type: 'prompt',
    level_min: 'newcomer',
    level_max: 'curious',
    jobs: ['all'],
  },
  {
    source: 'openai-cookbook',
    source_url: 'https://cookbook.openai.com',
    title: "OpenAI Cookbook — code + prompt examples that actually work",
    blurb: "OpenAI's official prompt + code library. Real examples for summarization, classification, retrieval, evals. The reference doc for builders.",
    type: 'prompt',
    level_min: 'user',
    level_max: 'ready',
    jobs: ['developer'],
  },
  {
    source: 'reddit-r/ChatGPTPromptGenius',
    source_url: 'https://www.reddit.com/r/ChatGPTPromptGenius/top/?t=month',
    title: "r/ChatGPTPromptGenius — top community prompts this month",
    blurb: 'Crowd-sourced prompt subreddit, sorted by what people actually upvoted. Filters out the spam. Good for: niche use cases you can\'t find in vetted libraries.',
    type: 'prompt',
    level_min: 'newcomer',
    level_max: 'user',
    jobs: ['all'],
  },
  {
    source: 'reddit-r/Construction',
    source_url: 'https://www.reddit.com/r/Construction/',
    title: 'r/Construction — how contractors actually use AI',
    blurb: "Real practitioner subreddit. Search 'ChatGPT' or 'AI' in the bar — quote writing, customer text drafts, OSHA citation lookups. Top comments are the gold.",
    type: 'prompt',
    level_min: 'newcomer',
    level_max: 'curious',
    jobs: ['trades', 'smb'],
  },
  {
    source: 'reddit-r/nursing',
    source_url: 'https://www.reddit.com/r/nursing/search/?q=AI&restrict_sr=1',
    title: 'r/nursing — AI in clinical workflows',
    blurb: "Real RN and tech-savvy clinician discussions. What works for charting + patient education, what to never paste, HIPAA gotchas. Practitioner perspective.",
    type: 'prompt',
    level_min: 'curious',
    level_max: 'ready',
    jobs: ['health'],
  },
  {
    source: 'reddit-r/Teachers',
    source_url: 'https://www.reddit.com/r/Teachers/search/?q=ChatGPT&restrict_sr=1',
    title: 'r/Teachers — using AI for lesson planning + grading',
    blurb: "Real teachers sharing prompts that actually save time. Lesson skeletons, rubric drafting, parent-email replies. Filter by 'top this month'.",
    type: 'prompt',
    level_min: 'newcomer',
    level_max: 'user',
    jobs: ['teach'],
  },

  // ─── HOWTOs ─── canonical docs / blog HOMEPAGES ─────────────────
  {
    source: 'anthropic-docs',
    source_url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
    title: 'Prompt engineering, from Anthropic — the canonical reference',
    blurb: "Anthropic's own guide to writing better prompts. Walks through role, context, examples, chain-of-thought. Single best 15-min read on the topic.",
    type: 'howto',
    level_min: 'newcomer',
    level_max: 'curious',
    jobs: ['all'],
  },
  {
    source: 'openai-cookbook',
    source_url: 'https://cookbook.openai.com/articles/techniques_to_improve_reliability',
    title: 'Techniques to improve reliability — from OpenAI',
    blurb: 'OpenAI cookbook entry on reducing hallucination via grounding, examples, decomposition. Real techniques, not platitudes.',
    type: 'howto',
    level_min: 'curious',
    level_max: 'user',
    jobs: ['all'],
  },
  {
    source: 'simonw-blog',
    source_url: 'https://simonwillison.net',
    title: 'Simon Willison — the best practitioner blog on LLMs',
    blurb: "Daily-updated blog by one of the most respected voices in the LLM world. Concrete, current, opinionated. Read the latest 3-5 posts to know what's actually happening.",
    type: 'howto',
    level_min: 'curious',
    level_max: 'ready',
    jobs: ['all'],
  },
  {
    source: 'anthropic-research',
    source_url: 'https://www.anthropic.com/research/building-effective-agents',
    title: 'Building effective agents — Anthropic engineering',
    blurb: "Anthropic's deep field guide to agent patterns: workflows vs agents, when each works, where they break. The reference doc on production agent design.",
    type: 'howto',
    level_min: 'ready',
    level_max: 'ready',
    jobs: ['developer'],
  },
  {
    source: 'aarp',
    source_url: 'https://www.aarp.org/money/scams-fraud/',
    title: 'AARP — spotting AI scams (and using AI safely day-to-day)',
    blurb: "AARP's guide to AI scams: cloned voices, urgent fake messages. Also: practical AI uses for daily life. Plain language, no jargon. Great for sharing with parents.",
    type: 'howto',
    level_min: 'newcomer',
    level_max: 'curious',
    jobs: ['all'],
  },
  {
    source: 'reddit-r/MachineLearning',
    source_url: 'https://www.reddit.com/r/MachineLearning/',
    title: 'r/MachineLearning — what AI researchers are reading this week',
    blurb: "Senior-engineer-and-up subreddit. Paper discussions, eval results, model launches before the press release. Read [D] (discussion) threads sorted by week.",
    type: 'howto',
    level_min: 'user',
    level_max: 'ready',
    jobs: ['developer'],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Did you run npm install + create .env.local?');
    process.exit(1);
  }
  let added = 0, updated = 0;
  for (const it of ITEMS) {
    const lvlMin = it.level_min ?? 'newcomer';
    const lvlMax = it.level_max ?? 'ready';
    const jobs   = it.jobs   ?? ['all'];
    const pub    = it.published_at ?? new Date().toISOString();
    // Upsert by source_url
    const existing = await sql`select id from items where source_url = ${it.source_url}` as unknown as Array<{ id: string }>;
    if (existing.length) {
      await sql`
        update items set
          title = ${it.title}, blurb = ${it.blurb}, type = ${it.type},
          level_min = ${lvlMin}, level_max = ${lvlMax},
          jobs = ${jobs as any}, status = 'live', approved_at = now()
        where source_url = ${it.source_url}
      `;
      updated++;
    } else {
      await sql`
        insert into items (source, source_url, title, blurb, type, level_min, level_max, jobs, status, published_at, approved_at)
        values (${it.source}, ${it.source_url}, ${it.title}, ${it.blurb}, ${it.type},
                ${lvlMin}, ${lvlMax}, ${jobs as any}, 'live', ${pub}, now())
      `;
      added++;
    }
  }
  console.log(`✓ Seed complete: ${added} added, ${updated} updated. Total in catalog: ${ITEMS.length}`);
  console.log('Tip: run `npm run db:ingest` to also pull live items from Reddit + HN + RSS + ProductHunt.');
}

main().catch((e) => { console.error(e); process.exit(1); });
