// RSS ingest — pulls the latest items from public, verified-real feeds.
// Lightweight regex-based parser (no XML library dep).
//
// Each fetch has an 8s timeout so a single hung feed doesn't stall the
// whole ingest run. Per-feed failures are logged and ignored.

import type { RawIngestedItem } from './reddit';

// Verified-real feeds. Anthropic deliberately omitted — they don't publish
// a public RSS at a stable URL. (We pull Anthropic content via HN + Reddit
// instead, which catches their announcements minutes after publication.)
const FEEDS: Array<{ name: string; url: string }> = [
  { name: 'google-ai',     url: 'https://blog.google/technology/ai/rss/' },
  { name: 'huggingface',   url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'simonw',        url: 'https://simonwillison.net/atom/everything/' },
];

const PER_FEED = 8;
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Compass/1.0 RSS reader' },
      signal: ctl.signal,
      next: { revalidate: 1800 },
    });
  } finally {
    clearTimeout(timer);
  }
}

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

function parseFeed(xml: string, sourceName: string): RawIngestedItem[] {
  const out: RawIngestedItem[] = [];
  const blocks = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
  for (const block of blocks.slice(0, PER_FEED)) {
    let title       = extractTag(block, 'title') || '';
    let description = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content') || '';
    let link        = extractTag(block, 'link') || '';
    if (!link) {
      const lm = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      if (lm) link = lm[1];
    }
    let pub = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated') || new Date().toISOString();

    title = decodeEntities(stripHtml(title));
    description = decodeEntities(stripHtml(description)).slice(0, 280);
    if (!title || !link) continue;
    try { pub = new Date(pub).toISOString(); } catch { pub = new Date().toISOString(); }

    out.push({
      source: `rss-${sourceName}`,
      source_url: link.trim(),
      title,
      blurb: description || `From the ${sourceName} blog.`,
      published_at: pub,
    });
  }
  return out;
}

export async function fetchRssItems(): Promise<RawIngestedItem[]> {
  const out: RawIngestedItem[] = [];
  // Parallel — each feed independently times out
  await Promise.all(FEEDS.map(async (feed) => {
    try {
      const res = await fetchWithTimeout(feed.url);
      if (!res.ok) {
        console.warn(`[rss] ${feed.name}: HTTP ${res.status}`);
        return;
      }
      const xml = await res.text();
      out.push(...parseFeed(xml, feed.name));
      console.log(`[rss] ${feed.name}: ${out.filter(i => i.source === 'rss-' + feed.name).length} items`);
    } catch (e: any) {
      console.warn(`[rss] ${feed.name} failed: ${e?.message || 'unknown'}`);
    }
  }));
  return out;
}
