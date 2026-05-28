// Default loading skeleton — used by Next.js for any route that takes a
// moment to stream in. Keeps the brand on screen so the demo never blanks.
import { BrandMark } from '@/components/BrandMark';

export default function Loading() {
  return (
    <main className="min-h-screen bg-paper text-ink grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <BrandMark size={36} />
        </div>
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted">loading</div>
      </div>
    </main>
  );
}
