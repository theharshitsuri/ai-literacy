// /upgrade — Compass+ marketing page. Real Stripe checkout comes later;
// for now this just makes the upgrade link work and previews the offer.
import { BrandMark } from '@/components/BrandMark';
import { UserButton } from '@clerk/nextjs';

export const metadata = { title: 'Compass+ — try free for 14 days' };

export default function UpgradePage() {
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
          <a href="/feed" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">back to feed</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <section className="px-5 md:px-12 py-16 max-w-[820px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">· Compass+ ·</div>
        <h1 className="font-serif text-[clamp(40px,5vw,60px)] font-normal leading-[1.02] tracking-tightest mb-5">
          For the people who already use AI daily.
        </h1>
        <p className="text-[16px] leading-[1.6] text-ink-2 max-w-[540px] mb-10">
          The free tier shows you 5 items per day and a weekly digest. Compass+ unlocks the deep end — full daily feed, the entire prompt library, monthly written-for-your-level deep dives, archive search, and feed controls.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 border border-line rounded-xl bg-paper">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mb-3">Free</div>
            <h3 className="font-serif text-[28px] font-normal mb-1">$0 / month</h3>
            <p className="text-[13px] text-ink-2 mb-6">Forever free.</p>
            <ul className="flex flex-col gap-2 text-[14px] text-ink-2">
              <li>→ Placement quiz</li>
              <li>→ Up to 5 feed items / day</li>
              <li>→ Weekly digest email</li>
              <li>→ Save up to 25 items</li>
            </ul>
          </div>
          <div className="p-8 border-2 border-accent rounded-xl bg-ink text-paper relative">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-3">Compass+</div>
            <h3 className="font-serif text-[28px] font-normal mb-1">$9 / month</h3>
            <p className="text-[13px] text-paper/60 mb-6">14-day free trial. Cancel anytime.</p>
            <ul className="flex flex-col gap-2 text-[14px] text-paper">
              <li>→ Full daily feed (no item cap)</li>
              <li>→ Full prompt library — every level × job</li>
              <li>→ Monthly written-for-your-level deep dives</li>
              <li>→ Archive search across all past items</li>
              <li>→ Feed controls (mute topics, pin tools)</li>
            </ul>
            <button
              className="mt-8 w-full px-5 py-3.5 bg-paper text-ink rounded-md font-semibold hover:bg-accent hover:text-paper transition-colors"
              disabled
              title="Stripe coming soon"
            >
              Start 14-day trial · coming soon
            </button>
          </div>
        </div>

        <p className="mt-8 font-mono text-[11px] tracking-[0.14em] uppercase text-muted text-center">
          stripe checkout ships with the next release · for now, free covers everything
        </p>
      </section>
    </main>
  );
}
