'use client';

// Intermediate page shown when a signed-in user hits /feed but no profile
// exists yet. Two cases:
//   1) They JUST signed up via the result page — save is in flight.
//      → poll the API for the profile, redirect once it appears.
//   2) They signed up without taking the quiz.
//      → show "take the quiz" CTA.
//
// We auto-poll for ~6 seconds. If we still have no profile, surface the
// CTA and stop polling.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';

export function ProfileWaiting() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [stillWaiting, setStillWaiting] = useState(true);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await fetch('/api/me', { cache: 'no-store' });
        const j = await r.json();
        if (j?.ok && j.profile?.level) {
          // Profile is now there — reload /feed
          router.refresh();
          return;
        }
      } catch {}
      setAttempts(a => a + 1);
    }, 1200);
    return () => clearInterval(t);
  }, [router]);

  useEffect(() => {
    if (attempts >= 5) setStillWaiting(false);
  }, [attempts]);

  return (
    <main className="min-h-screen bg-paper text-ink grid place-items-center p-6">
      <div className="max-w-md text-center">
        <div className={stillWaiting ? 'animate-pulse' : ''}><BrandMark size={32} /></div>
        {stillWaiting ? (
          <>
            <h1 className="font-serif text-2xl font-normal mt-5 mb-2">Setting up your feed…</h1>
            <p className="text-ink-2 text-[14px] leading-[1.5]">
              Saving your quiz result. This usually takes a second.
            </p>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-6">
              attempt {attempts + 1}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-normal mt-5 mb-2">Take the quiz first.</h1>
            <p className="text-ink-2 text-[14px] leading-[1.5] mb-6">
              Your feed is built around your level + job — both come from the placement quiz.
            </p>
            <a href="/quiz" className="px-5 py-2.5 bg-ink text-paper rounded-lg font-semibold text-[14px] inline-block">
              Start the quiz →
            </a>
          </>
        )}
      </div>
    </main>
  );
}
