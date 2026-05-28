// ProductHunt ingest — pulls daily launches via the public RSS feed
// (no API key required) and filters for AI-related products.
//
// Output items are typed as 'tool' since PH posts are products.

import type { RawIngestedItem } from './reddit';

const RSS_URL = 'https://www.producthunt.com/feed';
const MAX_ITEMS = 20;
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Compass/1.0 (https://github.com/theharshitsuri/ai-literacy)' },
      signal: ctl.signal,
      next: { revalidate: 1800 },
    });
  } finally {
    clearTimeout(timer);
  }
}

// Keywords used to filter PH items down to AI ones. Loose net — better to
// over-fetch and let the LLM classifier downgrade off-topic items.
const AI_KEYWORDS = /\b(ai|gpt|llm|chatbot|claude|gemini|openai|anthropic|copilot|agent|prompt|generative|machine learning|neural|transformer|stable diffusion|midjourney|dall-e)\b/i;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*</${tag}>`, 'i');
  const m = block.match(re);
  if (!m) return null;
  return (m[1] ?? m[2] ?? '').trim();
}

export async function fetchProductHuntItems(): Promise<RawIngestedItem[]> {
  try {
    const res = await fetchWithTimeout(RSS_URL);
    if (!res.ok) {
      console.warn(`[producthunt] HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
    const out: RawIngestedItem[] = [];
    for (const block of blocks.slice(0, MAX_ITEMS)) {
      let title       = decodeEntities(stripHtml(extractTag(block, 'title') || ''));
      let description = decodeEntities(stripHtml(extractTag(block, 'description') || '')).slice(0, 280);
      let link        = extractTag(block, 'link') || '';
      let pub         = extractTag(block, 'pubDate') || new Date().toISOString();
      if (!title || !link) continue;

      // AI filter — title OR description must contain an AI keyword
      if (!AI_KEYWORDS.test(title + ' ' + description)) continue;

      try { pub = new Date(pub).toISOString(); } catch { pub = new Date().toISOString(); }

      out.push({
        source: 'producthunt',
        source_url: link.trim(),
        title,
        blurb: description || `Today's launch on ProductHunt.`,
        published_at: pub,
      });
    }
    console.log(`[producthunt]: ${out.length} items`);
    return out;
  } catch (e: any) {
    console.warn(`[producthunt] failed: ${e?.message || 'unknown'}`);
    return [];
  }
}
