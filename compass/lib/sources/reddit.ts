// Reddit ingest — fetches top posts from AI subreddits using the public
// JSON endpoint. No API key needed.
//
// Each request has an 8s timeout. Reddit aggressively rate-limits anonymous
// scrapers; if a sub fails we log and move on rather than hang.

export type RawIngestedItem = {
  source: string;
  source_url: string;
  title: string;
  blurb: string;
  published_at: string;
};

const SUBS = [
  'ChatGPT',
  'ClaudeAI',
  'singularity',
  'OpenAI',
  'LocalLLaMA',
  'artificial',
  'PromptEngineering',
];

const KARMA_FLOOR     = 50;
const PER_SUB         = 8;
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Compass/1.0 (https://github.com/theharshitsuri/ai-literacy)' },
      signal: ctl.signal,
      next: { revalidate: 600 },
    });
  } finally {
    clearTimeout(timer);
  }
}

type RedditPost = {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    score: number;
    created_utc: number;
    subreddit: string;
    over_18: boolean;
    is_self: boolean;
  };
};

export async function fetchRedditItems(): Promise<RawIngestedItem[]> {
  const out: RawIngestedItem[] = [];

  // Run all subs in parallel — each times out independently
  await Promise.all(SUBS.map(async (sub) => {
    try {
      const url = `https://www.reddit.com/r/${sub}/top.json?t=day&limit=${PER_SUB}`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        console.warn(`[reddit] ${sub}: HTTP ${res.status}`);
        return;
      }
      const json = await res.json();
      const posts: RedditPost[] = json?.data?.children || [];
      let kept = 0;
      for (const p of posts) {
        const d = p.data;
        if (d.over_18) continue;
        if (d.score < KARMA_FLOOR) continue;
        const link = d.is_self ? `https://reddit.com${d.permalink}` : (d.url || `https://reddit.com${d.permalink}`);
        const blurb = (d.selftext || '').slice(0, 280).trim() || `Discussion in r/${d.subreddit} — ${d.score} upvotes.`;
        out.push({
          source: `reddit-r/${d.subreddit}`,
          source_url: link,
          title: d.title.trim(),
          blurb,
          published_at: new Date(d.created_utc * 1000).toISOString(),
        });
        kept++;
      }
      console.log(`[reddit] r/${sub}: ${kept} items`);
    } catch (e: any) {
      console.warn(`[reddit] ${sub} failed: ${e?.message || 'unknown'}`);
    }
  }));
  return out;
}
