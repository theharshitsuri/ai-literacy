// /admin/queue — review pending items from the ingest pipeline. Items
// classified at < AUTO_APPROVE_THRESHOLD land here. Approve → status=live.
// Reject → status=rejected (so we don't re-ingest the same URL).
import { requireUserId } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { UserButton } from '@clerk/nextjs';
import { ReviewRowClient } from './ReviewRowClient';
import type { Item } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass — review queue' };

async function isAdmin(): Promise<boolean> {
  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
  const allow = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  return allow.length === 0 ? false : allow.includes(email);
}

export default async function ReviewQueue() {
  await requireUserId();
  if (!(await isAdmin())) redirect('/feed');

  const pending = await sql`
    select id, source, source_url, title, blurb, type,
           level_min, level_max, jobs, status, published_at, created_at
    from items where status = 'pending'
    order by created_at desc
    limit 100
  ` as unknown as Item[];

  const counts = await sql`
    select status, count(*)::int as n
    from items group by status
  ` as unknown as Array<{ status: string; n: number }>;
  const live = counts.find(c => c.status === 'live')?.n || 0;
  const pen  = counts.find(c => c.status === 'pending')?.n || 0;
  const rej  = counts.find(c => c.status === 'rejected')?.n || 0;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-12 py-5 border-b border-line">
        <a href="/feed" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span> <span className="text-muted text-[11px] font-mono uppercase tracking-[0.18em] ml-2">admin</span>
          </span>
        </a>
        <div className="flex items-center gap-5">
          <a href="/admin/items" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">items</a>
          <a href="/feed" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">feed</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <section className="px-5 md:px-12 py-10 max-w-[1100px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· ingest review ·</div>
        <h1 className="font-serif text-[40px] font-normal leading-tight mb-2">Pending items.</h1>
        <p className="text-ink-2 text-[14px] mb-8">
          Live: <strong>{live}</strong> &middot; Pending: <strong>{pen}</strong> &middot; Rejected: <strong>{rej}</strong>
        </p>

        {pending.length === 0 ? (
          <div className="p-10 border border-line rounded-xl bg-paper-2 text-center">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· nothing to review ·</div>
            <p className="text-[15px] text-ink-2">Queue is empty. The next ingest runs daily at 14:00 UTC.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map(item => (
              <ReviewRowClient key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
