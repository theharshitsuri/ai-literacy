// Feed-specific skeleton. Shown while items + captions are being fetched
// (the first hit per session can take a moment if captions aren't cached).
import { BrandMark } from '@/components/BrandMark';

export default function FeedLoading() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-12 py-5 border-b border-line bg-paper">
        <a href="/feed" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span>
          </span>
        </a>
      </nav>
      <section className="px-5 md:px-12 py-10 md:py-14 max-w-[860px] mx-auto">
        <div className="h-3 w-48 bg-paper-2 rounded mb-4 animate-pulse" />
        <div className="h-12 w-72 bg-paper-2 rounded mb-3 animate-pulse" />
        <div className="h-3 w-96 bg-paper-2 rounded mb-10 animate-pulse" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="p-6 border border-line rounded-xl bg-paper">
              <div className="flex gap-2 mb-4">
                <div className="h-5 w-16 bg-paper-2 rounded animate-pulse" />
                <div className="h-5 w-24 bg-paper-2 rounded animate-pulse" />
              </div>
              <div className="h-6 w-3/4 bg-paper-2 rounded mb-3 animate-pulse" />
              <div className="h-4 w-full bg-paper-2 rounded mb-2 animate-pulse" />
              <div className="h-4 w-5/6 bg-paper-2 rounded mb-4 animate-pulse" />
              <div className="h-4 w-2/3 bg-paper-2 rounded border-l-2 border-accent pl-3 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
