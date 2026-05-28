// Branded 404. Rendered for unknown routes.
import { BrandMark } from '@/components/BrandMark';

export const metadata = { title: 'Compass — page not found' };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-paper text-ink grid place-items-center p-6">
      <div className="max-w-md text-center">
        <BrandMark size={32} />
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mt-5 mb-3">· 404 ·</div>
        <h1 className="font-serif text-4xl font-normal leading-tight mb-3">Off the map.</h1>
        <p className="text-ink-2 text-[15px] leading-[1.5] mb-7">
          The page you're looking for isn't here. Compass only points one direction — back home.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/" className="px-5 py-2.5 bg-ink text-paper rounded-lg font-semibold text-[14px] hover:bg-accent transition-colors">Home</a>
          <a href="/quiz" className="px-5 py-2.5 border border-line rounded-lg font-semibold text-[14px] hover:border-ink transition-colors">Take the quiz</a>
        </div>
      </div>
    </main>
  );
}
