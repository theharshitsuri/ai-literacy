// /admin/items — minimal admin to add a feed item by hand. Protected by Clerk
// middleware. You decide who's an admin by checking the user's email against
// ADMIN_EMAILS (env var) — anyone else gets redirected away.
//
// In v1 this is the only ingestion path. Reddit / RSS / HN pollers ship next.
import { requireUserId } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { UserButton } from '@clerk/nextjs';
import { AddItemForm } from './AddItemForm';
import type { Item } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass — admin' };

async function isAdmin(): Promise<boolean> {
  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
  const allow = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  return allow.length === 0 ? false : allow.includes(email);
}

export default async function AdminItemsPage() {
  await requireUserId();
  if (!(await isAdmin())) redirect('/feed');

  const items = await sql`
    select id, title, source_url, type, status, level_min, level_max, jobs, created_at
    from items
    order by created_at desc
    limit 50
  ` as unknown as Item[];

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
          <a href="/feed" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">feed</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <section className="px-5 md:px-12 py-10 max-w-[1100px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· content management ·</div>
        <h1 className="font-serif text-[40px] font-normal leading-tight mb-10">Item library.</h1>

        <AddItemForm />

        <h2 className="font-serif text-[24px] font-normal mt-14 mb-4">Recent items ({items.length})</h2>
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-paper-2">
              <tr className="text-left">
                <th className="px-3 py-2 font-mono uppercase tracking-[0.1em] text-[10px] text-muted">Title</th>
                <th className="px-3 py-2 font-mono uppercase tracking-[0.1em] text-[10px] text-muted">Type</th>
                <th className="px-3 py-2 font-mono uppercase tracking-[0.1em] text-[10px] text-muted">Level</th>
                <th className="px-3 py-2 font-mono uppercase tracking-[0.1em] text-[10px] text-muted">Jobs</th>
                <th className="px-3 py-2 font-mono uppercase tracking-[0.1em] text-[10px] text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="border-t border-line">
                  <td className="px-3 py-2 max-w-[420px] truncate"><a href={it.source_url} target="_blank" rel="noreferrer noopener" className="hover:text-accent">{it.title}</a></td>
                  <td className="px-3 py-2 font-mono text-accent">{it.type}</td>
                  <td className="px-3 py-2 text-ink-2">{it.level_min} → {it.level_max}</td>
                  <td className="px-3 py-2 text-ink-2 text-[12px]">{(it.jobs || []).join(', ')}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    <span className={it.status === 'live' ? 'text-ok' : it.status === 'pending' ? 'text-muted' : 'text-ink-2'}>
                      {it.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
