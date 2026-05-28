// /saved — items the user bookmarked. Server-rendered.
import { requireUserId } from '@/lib/auth';
import { sql } from '@/lib/db';
import { BrandMark } from '@/components/BrandMark';
import { UserButton } from '@clerk/nextjs';
import type { Item } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass — saved' };

export default async function SavedPage() {
  const userId = await requireUserId();
  const rows = await sql`
    select i.id, i.title, i.blurb, i.type, i.source, i.source_url, s.saved_at
    from saved_items s
    join items i on s.item_id = i.id
    where s.user_id = ${userId}
    order by s.saved_at desc
  ` as Array<Item & { saved_at: string }>;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-12 py-5 border-b border-line">
        <a href="/feed" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span>
          </span>
        </a>
        <div className="flex items-center gap-5">
          <a href="/feed" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">feed</a>
          <a href="/profile" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">profile</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
      <section className="px-5 md:px-12 py-10 md:py-14 max-w-[860px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· saved items ·</div>
        <h1 className="font-serif text-[40px] font-normal leading-tight mb-10">Your bookmark stack.</h1>
        {rows.length === 0 ? (
          <p className="text-[15px] text-ink-2">Nothing saved yet. Tap <em>save</em> on any feed item to keep it here.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map(item => (
              <a key={item.id} href={item.source_url} target="_blank" rel="noreferrer noopener"
                className="block p-5 border border-line rounded-xl bg-paper hover:-translate-y-0.5 transition-transform">
                <div className="flex gap-2 mb-3 font-mono text-[10px] tracking-[0.14em] uppercase">
                  <span className="py-1 px-2 rounded-[3px] border border-accent text-accent">{item.type}</span>
                  <span className="py-1 px-2 rounded-[3px] border border-line text-ink-2 bg-paper-2">{item.source}</span>
                </div>
                <h3 className="font-serif text-[19px] font-medium leading-tight mb-1.5">{item.title}</h3>
                <p className="text-[14px] text-ink-2 leading-[1.5]">{item.blurb}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
