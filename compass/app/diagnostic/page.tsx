// /diagnostic — visual dashboard of the health check at /api/diagnostic.
// Use this whenever something breaks in a demo. Tells you in one glance
// which piece is dead — env, DB, items, captions, or OpenAI.
import { BrandMark } from '@/components/BrandMark';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass — diagnostic' };

async function fetchDiagnostic() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const r = await fetch(`${base}/api/diagnostic`, { cache: 'no-store' });
    return await r.json();
  } catch (e: any) {
    return { error: e?.message || 'fetch failed' };
  }
}

export default async function DiagnosticPage() {
  const d = await fetchDiagnostic();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-12 py-5 border-b border-line">
        <a href="/" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span> <span className="text-muted text-[11px] font-mono uppercase tracking-[0.18em] ml-2">diagnostic</span>
          </span>
        </a>
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">{d.timestamp || '—'}</span>
      </nav>

      <section className="px-5 md:px-12 py-10 max-w-[860px] mx-auto">
        <h1 className="font-serif text-[36px] font-normal leading-tight mb-2">System check.</h1>
        <p className="text-ink-2 text-[14px] mb-10">If anything below is red, that's what's broken.</p>

        {/* env block */}
        <Section title="environment variables">
          {d.env && Object.entries(d.env).map(([k, v]) => (
            <Row key={k} label={k} ok={!!v} detail={typeof v === 'string' ? v : (v ? 'set' : 'MISSING')} />
          ))}
        </Section>

        <Section title="database">
          <Row label="connection" ok={d.db?.ok} detail={d.db?.ok ? 'reachable' : d.db?.error || 'down'} />
        </Section>

        <Section title="catalog">
          {d.counts?.ok ? (
            <>
              <Row label="live items"        ok={d.counts.value.live_items      > 0}  detail={`${d.counts.value.live_items} rows`} />
              <Row label="pending items"     ok                                     detail={`${d.counts.value.pending_items} rows`} />
              <Row label="cached captions"   ok={d.counts.value.cached_captions  > 0}  detail={`${d.counts.value.cached_captions} rows`} />
              <Row label="user profiles"     ok                                     detail={`${d.counts.value.profiles} rows`} />
            </>
          ) : (
            <Row label="catalog" ok={false} detail={d.counts?.error || 'failed'} />
          )}
        </Section>

        <Section title="openai">
          <Row label="api key" ok={d.openai?.ok} detail={d.openai?.value || d.openai?.error || '—'} />
        </Section>

        <p className="mt-8 font-mono text-[10px] text-muted">
          Need to fix something? See <code>compass/DEPLOY.md</code>.
        </p>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted mb-3">· {title} ·</div>
      <div className="border border-line rounded-xl overflow-hidden divide-y divide-line">
        {children}
      </div>
    </div>
  );
}

function Row({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-paper">
      <span className="font-mono text-[12px]">
        <span className={`inline-block w-2 h-2 rounded-full mr-3 align-middle ${ok ? 'bg-ok' : 'bg-accent'}`} />
        {label}
      </span>
      <span className={`font-mono text-[11px] ${ok ? 'text-ink-2' : 'text-accent'}`}>{detail}</span>
    </div>
  );
}
