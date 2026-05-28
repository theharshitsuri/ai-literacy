'use client';

import { useState, useTransition } from 'react';
import { approveItem, rejectItem } from './actions';
import type { Item } from '@/lib/types';

export function ReviewRowClient({ item }: { item: Item }) {
  const [pending, startTransition] = useTransition();
  const [decided, setDecided] = useState<'approved' | 'rejected' | null>(null);

  const onApprove = () => {
    setDecided('approved');
    startTransition(async () => { await approveItem(item.id); });
  };
  const onReject = () => {
    setDecided('rejected');
    startTransition(async () => { await rejectItem(item.id); });
  };

  if (decided) {
    return (
      <div className="p-4 border border-line rounded-lg bg-paper-2 text-[13px] font-mono text-muted">
        {decided === 'approved' ? '✓' : '✗'} {item.title.slice(0, 80)} — {decided}
      </div>
    );
  }

  return (
    <div className="p-5 border border-line rounded-xl bg-paper">
      <div className="flex gap-2 flex-wrap mb-2 font-mono text-[10px] tracking-[0.14em] uppercase">
        <span className="py-1 px-2 rounded-[3px] border border-accent text-accent">{item.type}</span>
        <span className="py-1 px-2 rounded-[3px] border border-line text-ink-2 bg-paper-2">{item.source}</span>
        <span className="py-1 px-2 rounded-[3px] border border-line text-ink-2 bg-paper-2">{item.level_min} → {item.level_max}</span>
        <span className="py-1 px-2 rounded-[3px] border border-line text-ink-2 bg-paper-2">{(item.jobs || []).join(', ')}</span>
      </div>
      <a href={item.source_url} target="_blank" rel="noreferrer noopener" className="font-serif text-[18px] font-medium leading-tight hover:text-accent">{item.title}</a>
      <p className="text-[13px] text-ink-2 leading-[1.5] mt-2 mb-3">{item.blurb}</p>
      <div className="flex gap-2">
        <button onClick={onApprove} disabled={pending}
          className="px-3 py-1.5 bg-ok text-paper rounded-md text-[12px] font-semibold hover:opacity-90 disabled:opacity-50">
          Approve → live
        </button>
        <button onClick={onReject} disabled={pending}
          className="px-3 py-1.5 border border-line rounded-md text-[12px] font-semibold hover:border-ink disabled:opacity-50">
          Reject
        </button>
      </div>
    </div>
  );
}
