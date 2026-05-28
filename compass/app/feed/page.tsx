// /feed — the main product. Server component so we can call the DB and the
// LLM caption pipeline directly. Item-level interactions (save, dismiss) live
// in a small client component that fires server actions.
import { redirect } from 'next/navigation';
import { requireUserId } from '@/lib/auth';
import { getCurrentProfile, getFeedItems } from '@/lib/feed';
import { LEVELS } from '@/lib/levels';
import { JOBS } from '@/lib/profiling';
import { BrandMark } from '@/components/BrandMark';
import { UserButton } from '@clerk/nextjs';
import { FeedCardClient } from './FeedCardClient';
import { ProfileWaiting } from './ProfileWaiting';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass — your feed' };

export default async function FeedPage() {
  const userId = await requireUserId();
  const profile = await getCurrentProfile(userId);

  // No profile yet — could be one of:
  //   a) brand new sign-up, quiz state still in localStorage, save is in flight
  //   b) user signed up without taking the quiz
  // We can't tell the difference here, so show a waiting page with two CTAs:
  // "I just took the quiz" → /quiz/complete (will auto-save), or "I haven't yet" → /quiz.
  if (!profile || !profile.level || !profile.job_id) {
    return <ProfileWaiting />;
  }

  const items = await getFeedItems(profile, 12);
  const level = LEVELS[profile.level];
  const job = JOBS.find(j => j.id === profile.job_id);
  const jobLabel = profile.job_id === 'other' && profile.job_other ? profile.job_other : (job?.label || profile.job_id);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-12 py-5 border-b border-line bg-paper sticky top-0 z-10">
        <a href="/feed" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span>
          </span>
        </a>
        <div className="flex items-center gap-5">
          <a href="/saved" className="hidden md:block font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">saved</a>
          <a href="/profile" className="hidden md:block font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">profile</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <section className="px-5 md:px-12 py-10 md:py-14 max-w-[860px] mx-auto">
        {/* Profile bearing strip */}
        <div className="flex flex-wrap items-center gap-3 mb-3 font-mono text-[11px] tracking-[0.16em] uppercase text-muted">
          <span>· your bearing ·</span>
          <span className="text-line">/</span>
          <span className="text-accent">{level.cardinal} · {level.name}</span>
          <span className="text-line">/</span>
          <span>{jobLabel}</span>
          {profile.theta != null && (
            <>
              <span className="text-line">/</span>
              <span>θ {Number(profile.theta).toFixed(0)}</span>
            </>
          )}
        </div>
        <h1 className="font-serif font-normal text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-tight mb-3">
          Today's read.
        </h1>
        <p className="text-[15px] leading-[1.55] text-ink-2 mb-10 max-w-[520px]">
          {items.length} items tuned to where you are. Each caption is written for you specifically — same news, different read depending on your level and your work.
        </p>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <FeedCardClient key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <footer className="px-5 md:px-12 py-12 border-t border-line text-center">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
          want more? <a href="/upgrade" className="text-ink hover:text-accent">try compass+ free for 14 days</a>
        </div>
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="p-10 border border-line rounded-xl bg-paper-2 text-center">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· no items yet ·</div>
      <p className="text-[15px] leading-[1.5] text-ink-2 max-w-[460px] mx-auto">
        We're stocking the feed for your level and job. Check back in a few hours — new items arrive daily.
      </p>
    </div>
  );
}
