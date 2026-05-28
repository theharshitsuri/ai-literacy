'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, SignInButton, SignUpButton } from '@clerk/nextjs';
import { CompassRose } from '@/components/CompassRose';
import { BrandMark } from '@/components/BrandMark';
import { LEVELS } from '@/lib/levels';
import { levelFromTheta, thetaToScore } from '@/lib/cat-engine';
import type { QuizState, ProfilingAnswers, Level } from '@/lib/types';
import { saveQuizResult } from '../actions';

const STORAGE_KEY = 'compass.quiz.v1';

type Persisted = {
  phase: string;
  profilingAnswers: ProfilingAnswers;
  quizState: QuizState | null;
};

function readQuizState(): Persisted | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.quizState) {
      parsed.quizState.usedKeys = new Set<string>(parsed.quizState.usedKeys || []);
    }
    return parsed;
  } catch { return null; }
}

type HydrationState = 'loading' | 'has-result' | 'no-result';

export function CompleteClient() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [hydration, setHydration] = useState<HydrationState>('loading');
  const [persisted, setPersisted] = useState<Persisted | null>(null);
  const [savedToDb, setSavedToDb] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Hydrate from localStorage — fixes the flash of "No quiz result found"
  useEffect(() => {
    const data = readQuizState();
    if (data?.quizState) {
      setPersisted(data);
      setHydration('has-result');
    } else {
      setHydration('no-result');
    }
  }, []);

  // Auto-save once authed AND we have a result. Saves the profile row.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !persisted?.quizState || savedToDb || isPending) return;
    startTransition(async () => {
      const res = await saveQuizResult({
        profilingAnswers: persisted.profilingAnswers,
        finalTheta: persisted.quizState!.theta,
      });
      if (res.ok) {
        setSavedToDb(true);
        // Don't clear localStorage immediately — give the user time to see
        // their result. Clear when they actually navigate to /feed.
      } else {
        setSaveErr(res.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, persisted]);

  // ---- still loading from localStorage ----
  if (hydration === 'loading') {
    return (
      <main className="min-h-screen bg-paper text-ink grid place-items-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <BrandMark size={36} />
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted">finding your bearing…</div>
        </div>
      </main>
    );
  }

  // ---- truly no quiz state ----
  if (hydration === 'no-result' || !persisted?.quizState) {
    return (
      <main className="min-h-screen bg-paper text-ink grid place-items-center p-6 text-center">
        <div>
          <BrandMark size={28} />
          <p className="mt-4 text-ink-2">No quiz result found. Take the quiz first.</p>
          <a href="/quiz" className="mt-6 inline-block px-6 py-3 bg-ink text-paper rounded-lg">Start the quiz →</a>
        </div>
      </main>
    );
  }

  const theta = persisted.quizState.theta;
  const score = thetaToScore(theta);
  const level: Level = levelFromTheta(theta);
  const meta = LEVELS[level];
  const asked = persisted.quizState.asked;
  const correctCount = persisted.quizState.history.filter(h => h.correct).length;

  // "Open your feed" should only be clickable once auth + profile-save are both done.
  // Otherwise the user races /feed → profile lookup → finds nothing → bounces back.
  const canOpenFeed = isSignedIn && savedToDb;
  const openFeed = () => {
    if (!canOpenFeed) return;
    localStorage.removeItem(STORAGE_KEY);
    router.push('/feed');
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-16 py-5 border-b border-line">
        <a href="/" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span>
          </span>
        </a>
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">your result</span>
      </nav>

      <section className="px-5 md:px-16 py-12 md:py-20 max-w-[1200px] mx-auto qfade">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-5 flex flex-wrap items-center gap-3">
          <span>· your bearing ·</span>
          <span className="text-line">/</span>
          <span>score {score}/30</span>
          <span className="text-line">/</span>
          <span>theta {theta.toFixed(1)}</span>
          <span className="text-line">/</span>
          <span>{asked} answered · {correctCount} correct</span>
        </div>

        <div className="grid md:grid-cols-[1.05fr_1fr] gap-10 md:gap-16 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-3">
              Level 0{meta.rank} of 04 · {meta.cardinal}
            </div>
            <h1 className="font-serif font-normal text-[clamp(40px,6vw,72px)] leading-[0.96] tracking-tightest mb-5">
              {meta.name}
            </h1>
            <p className="font-serif italic text-[clamp(18px,2vw,22px)] text-ink-2 mb-7 max-w-[520px]">
              {meta.short}
            </p>
            <p className="text-[15px] leading-[1.6] text-ink-2 max-w-[540px]">
              {meta.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isSignedIn ? (
                <>
                  <button
                    onClick={openFeed}
                    disabled={!canOpenFeed}
                    className={`px-6 py-3.5 rounded-lg font-semibold text-[15px] transition-colors ${
                      canOpenFeed
                        ? 'bg-ink text-paper hover:bg-accent'
                        : 'bg-line text-muted cursor-not-allowed'
                    }`}
                  >
                    {savedToDb ? 'Open your feed →' : 'Saving your result…'}
                  </button>
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
                    {savedToDb ? '✓ saved to your account' : isPending ? 'saving…' : saveErr ? `save failed: ${saveErr}` : 'starting…'}
                  </span>
                </>
              ) : (
                <>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/quiz/complete"
                    signInForceRedirectUrl="/quiz/complete"
                  >
                    <button className="px-6 py-3.5 bg-ink text-paper rounded-lg font-semibold text-[15px] hover:bg-accent transition-colors">
                      Save my result + see my feed →
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal" forceRedirectUrl="/quiz/complete">
                    <button className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">
                      already have an account? sign in
                    </button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <CompassRose theta={theta} animated={false} size={460} highlight={level} />
          </div>
        </div>
      </section>

      <div className="h-px bg-line max-w-[1200px] mx-auto" />

      {/* STRENGTHS + GAPS */}
      <section className="px-5 md:px-16 py-14 max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· strengths ·</div>
          <h2 className="font-serif text-[28px] font-normal leading-tight mb-5">What you've got going.</h2>
          <ul className="flex flex-col gap-3">
            {meta.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-accent font-mono mt-0.5">✓</span>
                <span className="text-[15px] leading-[1.5] text-ink-2">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· gaps ·</div>
          <h2 className="font-serif text-[28px] font-normal leading-tight mb-5">What the feed will work on.</h2>
          <ul className="flex flex-col gap-3">
            {meta.gaps.map((g, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-muted font-mono mt-0.5">→</span>
                <span className="text-[15px] leading-[1.5] text-ink-2">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Per-tool breakdown */}
      <section className="px-5 md:px-16 pb-20 max-w-[1200px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-3">· per-tool breakdown ·</div>
        <h2 className="font-serif text-[28px] font-normal leading-tight mb-5">How you did across the major tools.</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(persisted.quizState.toolScore).map(([tool, s]) => {
            const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={tool} className="p-4 border border-line rounded-lg bg-paper">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-1">{tool}</div>
                <div className="font-serif text-2xl">{s.correct}/{s.total}</div>
                <div className="font-mono text-[11px] text-ink-2 mt-1">{pct}%</div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
