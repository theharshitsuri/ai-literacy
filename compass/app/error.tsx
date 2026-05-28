'use client';

// Per-route error boundary. Catches anything thrown during render in a
// route segment. Rendered inside the root layout, so the brand survives.
import { useEffect } from 'react';
import { BrandMark } from '@/components/BrandMark';

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Real monitoring (Sentry / Datadog) goes here later. For now log to
    // console — visible in Vercel function logs.
    console.error('[compass] route error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-paper text-ink grid place-items-center p-6">
      <div className="max-w-md text-center">
        <BrandMark size={32} />
        <h1 className="font-serif text-3xl font-normal mt-5 mb-2">Something broke.</h1>
        <p className="text-ink-2 text-[15px] leading-[1.5] mb-6">
          We hit an error rendering this page. The team got a log entry.
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] tracking-[0.1em] text-muted mb-6">trace: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-5 py-2.5 bg-ink text-paper rounded-lg font-semibold text-[14px] hover:bg-accent transition-colors">Try again</button>
          <a href="/" className="px-5 py-2.5 border border-line rounded-lg font-semibold text-[14px] hover:border-ink transition-colors">Home</a>
        </div>
      </div>
    </main>
  );
}
