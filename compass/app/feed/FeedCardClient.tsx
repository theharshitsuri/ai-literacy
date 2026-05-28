'use client';

// Per-item card client component. Renders the feed item + caption, supports
// save/dismiss via server actions. The whole card surface is clickable —
// taps anywhere outside the action buttons open the source URL in a new tab.

import { useEffect, useState, useTransition } from 'react';
import type { FeedItem } from '@/lib/feed';
import { saveItem, dismissItem, recordView } from './actions';

export function FeedCardClient({ item }: { item: FeedItem }) {
  const [saved, setSaved] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [, startTransition] = useTransition();

  // record a view once on mount
  useEffect(() => {
    startTransition(async () => { await recordView(item.id); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dismissed) return null;

  const onSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSaved(true);
    startTransition(async () => { await saveItem(item.id); });
  };
  const onDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDismissed(true);
    startTransition(async () => { await dismissItem(item.id); });
  };

  // Friendly host label for the open-arrow chip
  let host = '';
  try { host = new URL(item.source_url).host.replace(/^www\./, ''); } catch {}

  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noreferrer noopener"
      className="block bg-paper border border-line rounded-xl p-6 flex-col gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,22,20,0.05)] hover:border-ink cursor-pointer group"
      onClick={() => {
        // Fire-and-forget click log
        startTransition(async () => { try { await fetch('/api/click?id=' + item.id, { method: 'POST' }); } catch {} });
      }}
    >
      <div className="flex gap-2 flex-wrap items-center font-mono text-[10px] tracking-[0.14em] uppercase mb-3.5">
        <span className="py-1 px-2.5 rounded-[3px] border border-accent text-accent">{item.type}</span>
        <span className="py-1 px-2.5 rounded-[3px] border border-line text-ink-2 bg-paper-2">{item.source}</span>
        <span className="flex-1" />
        <button onClick={onSave} disabled={saved}
          className="px-2 py-0.5 rounded text-muted hover:text-accent disabled:text-accent">
          {saved ? '✓ saved' : 'save'}
        </button>
        <button onClick={onDismiss}
          className="px-2 py-0.5 rounded text-muted hover:text-ink">
          dismiss
        </button>
      </div>

      <h3 className="font-serif text-[20px] md:text-[22px] font-medium leading-[1.25] tracking-tight text-ink group-hover:text-accent transition-colors mb-2">
        {item.title}
      </h3>
      <p className="text-[14px] leading-[1.55] text-ink-2 mb-2">{item.blurb}</p>

      {/* Caption — the value-add layer */}
      <p className="text-[14px] leading-[1.5] text-ink-2 border-l-2 border-accent pl-3 italic mt-1 mb-2">
        <strong className="not-italic text-ink font-semibold">Why this matters for you:</strong>{' '}
        {item.caption}
      </p>

      {/* visible click affordance — also reveals where the link goes */}
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-muted pt-2 border-t border-line group-hover:text-accent transition-colors">
        <span className="truncate">{host || 'open source'}</span>
        <span className="ml-auto">open →</span>
      </div>
    </a>
  );
}
