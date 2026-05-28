// Hacker News ingest — pulls AI-related top stories via Algolia's HN API.
// Each query has an 8s timeout; queries run in parallel.
import type { RawIngestedItem } from './reddit';

const QUERIES = [
  'ChatGPT',
  'Claude',
  'Anthropic',
  'OpenAI',
  'Gemini',
  'LLM',
  'AI agent',
  'prompt engineering',
];

const POINTS_FLOOR     = 80;
const PER_QUERY        = 6;
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctl.signal, next: { revalidate: 600 } });
  } finally {
    clearTimeout(timer);
  }
}

type HNHit = {
  objectID: string;
  title: string | null;
  url: string | null;
  story_text: string | null;
  points: number;
  created_at: string;
};

export async function fetchHNItems(): Promise<RawIngestedItem[]> {
  const out: RawIngestedItem[] = [];

  await Promise.all(QUERIES.map(async (q) => {
    try {
      const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=${PER_QUERY}&numericFilters=points>${POINTS_FLOOR}`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        console.warn(`[hn] ${q}: HTTP ${res.status}`);
        return;
      }
      const json = await res.json();
      const hits: HNHit[] = json?.hits || [];
      let kept = 0;
      for (const h of hits) {
        if (!h.title) continue;
        const link = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
        const blurb = (h.story_text || '').slice(0, 280).trim() || `${h.points} points on Hacker News.`;
        out.push({
          source: 'hackernews',
          source_url: link,
          title: h.title.trim(),
          blurb,
          published_at: h.created_at,
        });
        kept++;
      }
      console.log(`[hn] "${q}": ${kept} items`);
    } catch (e: any) {
      console.warn(`[hn] ${q} failed: ${e?.message || 'unknown'}`);
    }
  }));
  return out;
}
