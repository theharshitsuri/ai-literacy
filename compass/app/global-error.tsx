'use client';

// Root-level error boundary. Runs OUTSIDE the root layout — required to
// render its own <html>/<body>. Catches errors that escape route-level
// error.tsx (e.g. errors in the root layout itself).
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[compass] global error:', error); }, [error]);
  return (
    <html lang="en">
      <body style={{ background: '#f5f1ea', color: '#1a1614', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '420px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, marginBottom: '12px' }}>Compass is offline.</h1>
          <p style={{ color: '#4a423a', marginBottom: '24px' }}>
            We hit a problem we couldn't recover from. The team got an alert.
          </p>
          <button onClick={reset} style={{ padding: '10px 20px', background: '#1a1614', color: '#f5f1ea', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
