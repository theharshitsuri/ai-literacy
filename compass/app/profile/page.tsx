// /profile — user's current bearing + retake-quiz button.
import { requireUserId } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/feed';
import { LEVELS } from '@/lib/levels';
import { JOBS } from '@/lib/profiling';
import { BrandMark } from '@/components/BrandMark';
import { CompassRose } from '@/components/CompassRose';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass — profile' };

export default async function ProfilePage() {
  const userId = await requireUserId();
  const profile = await getCurrentProfile(userId);
  if (!profile || !profile.level) redirect('/quiz');

  const level = LEVELS[profile.level];
  const job = JOBS.find(j => j.id === profile.job_id);
  const jobLabel = profile.job_id === 'other' && profile.job_other ? profile.job_other : (job?.label || profile.job_id || '');

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
          <a href="/saved" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">saved</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <section className="px-5 md:px-12 py-10 md:py-16 max-w-[1100px] mx-auto grid md:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· your profile ·</div>
          <h1 className="font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[1] tracking-tightest mb-5">
            {level.name}
          </h1>
          <p className="font-serif italic text-[20px] text-ink-2 mb-5">{level.short}</p>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-[14px] max-w-[440px]">
            <dt className="font-mono uppercase tracking-[0.1em] text-muted text-[11px]">Level</dt>
            <dd>{level.name} ({level.cardinal})</dd>
            <dt className="font-mono uppercase tracking-[0.1em] text-muted text-[11px]">Theta</dt>
            <dd>{profile.theta?.toFixed(1)} / 100</dd>
            <dt className="font-mono uppercase tracking-[0.1em] text-muted text-[11px]">Job</dt>
            <dd>{jobLabel}</dd>
            {profile.goal_text && (<>
              <dt className="font-mono uppercase tracking-[0.1em] text-muted text-[11px]">Goal</dt>
              <dd className="italic">{profile.goal_text}</dd>
            </>)}
          </dl>
          <div className="mt-8 flex gap-3 flex-wrap">
            <a href="/quiz" className="px-5 py-3 bg-ink text-paper rounded-lg font-semibold text-[14px] hover:bg-accent transition-colors">
              Retake the quiz →
            </a>
            <a href="/feed" className="px-5 py-3 border border-line rounded-lg font-semibold text-[14px] hover:border-ink transition-colors">
              Back to feed
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <CompassRose theta={Number(profile.theta) || 0} animated={false} size={420} highlight={profile.level} />
        </div>
      </section>
    </main>
  );
}
