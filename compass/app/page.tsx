import Link from 'next/link';
import { BrandMark, BrandWordmark } from '@/components/BrandMark';
import { CompassRose } from '@/components/CompassRose';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* ─── NAV ─── */}
      <nav className="flex justify-between items-center px-5 md:px-16 py-6 border-b border-line bg-paper sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-[10px]">
          <BrandMark size={24} />
          <span className="font-serif text-xl font-medium tracking-tight">
            Compass<span className="text-accent">.</span>
          </span>
        </Link>
        <div className="hidden md:flex gap-6 items-center text-sm text-muted">
          <Link href="#how" className="hover:text-ink">How it works</Link>
          <Link href="#feed" className="hover:text-ink">Feed</Link>
          <Link href="#pricing" className="hover:text-ink">Pricing</Link>
          <Link
            href="/signin"
            className="font-mono text-[12px] tracking-[0.06em] uppercase px-4 py-2 border border-ink rounded text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="px-5 md:px-16 py-12 md:py-28 max-w-[1280px] mx-auto grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-20 items-center">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-7 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            AI literacy + a feed tuned to you
          </div>
          <h1 className="font-serif font-normal leading-[0.95] tracking-tightest text-[clamp(48px,7vw,88px)]">
            Find your <em className="italic text-accent">bearing</em>
            <br />
            in AI.
          </h1>
          <p className="mt-7 max-w-[540px] text-[clamp(16px,1.6vw,19px)] leading-[1.55] text-ink-2">
            AI moves fast. Most newsletters dump everything on everyone — the same five tools, the
            same headlines, the same noise. Compass starts with a 5-minute placement quiz and gives
            you a personalized feed of news, tools, and prompts that fits{' '}
            <em className="italic">where you actually are</em> at work.
          </p>
          <div className="mt-10 flex flex-wrap gap-5 items-center">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-3 px-7 py-[18px] bg-ink text-paper text-base font-semibold rounded-lg hover:bg-accent transition-all hover:-translate-y-0.5"
            >
              Take the quiz <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
              free · 5 min · no signup to try
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <CompassRose size={460} animated />
        </div>
      </section>

      <div className="h-px bg-line max-w-[1200px] mx-auto" />

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="px-5 md:px-16 py-16 md:py-24 max-w-[1200px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mb-4">· How it works ·</div>
        <h2 className="font-serif font-normal text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-tight max-w-[700px] mb-12">
          A placement test, then a feed that knows where you are.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Step
            num="01 · 5 MIN"
            title="Take the placement quiz"
            body="10 adaptive questions across the five major AI tools. Performance-based — no self-rating. The quiz adjusts difficulty as it goes, so it ends quickly if your level is already clear."
          />
          <Step
            num="02 · INSTANT"
            title="Get your bearing"
            body="You land on one of four levels — Newcomer, Curious, User, or Ready — and pick the job that describes your work. That's your coordinates. The feed builds around them."
          />
          <Step
            num="03 · DAILY"
            title="Open your feed"
            body="Five to ten items a day — news, tools, prompts, how-tos — each one tagged for your level and your work. Same big news, different framing depending on who you are."
          />
        </div>
      </section>

      {/* ─── SAMPLE FEED ─── */}
      <section id="feed" className="px-5 md:px-16 py-16 md:py-24 bg-paper-2">
        <div className="max-w-[1200px] mx-auto">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mb-4">· What you'll see ·</div>
          <h2 className="font-serif font-normal text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-tight mb-4">
            Same news. Different read, depending on you.
          </h2>
          <p className="max-w-[620px] text-[15px] leading-[1.55] text-ink-2 mb-10">
            Below: how the same launch story shows up to two different Compass users. Notice the
            caption changes, not the item.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <FeedCard
              type="News"
              segment="Newcomer · Retail"
              time="2h ago"
              title="ChatGPT just got long-term memory across conversations"
              source="OpenAI · blog.openai.com"
              caption="if you've been retyping your store hours or shift schedule into ChatGPT every time you ask for help — you don't have to anymore. Tell it once. It remembers."
            />
            <FeedCard
              type="News"
              segment="Ready · Developer"
              time="2h ago"
              title="ChatGPT just got long-term memory across conversations"
              source="OpenAI · blog.openai.com"
              caption="the API now exposes memory_keys per user — you can read/write persistent state without your own session store. Migration notes in the linked changelog."
            />
            <FeedCard
              type="Prompt"
              segment="Curious · Healthcare"
              time="Saved 412×"
              title="Patient discharge summary → plain-English explainer"
              source="Compass prompt library"
              caption="tested with three nurse managers — it turns a clinical discharge note into a one-page summary a patient's family can actually read. Doesn't replace your sign-off; it saves you 20 min per patient."
            />
            <FeedCard
              type="Tool"
              segment="User · Office"
              time="Free tier"
              title="Granola — meeting notes that don't require a recording bot"
              source="granola.ai"
              caption="if you've avoided Otter/Fireflies because you don't want a bot joining every call, Granola runs locally on your laptop and writes the notes from your mic only. Free tier covers ~25 meetings/month."
            />
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="px-5 md:px-16 py-16 md:py-24 max-w-[1200px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mb-4">· Pricing ·</div>
        <h2 className="font-serif font-normal text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-tight mb-12 max-w-[700px]">
          Free to use. Pay if you want the deep end.
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-[880px]">
          <Plan
            kind="free"
            tag="Free forever"
            name="Compass"
            desc="Everything you need to start."
            priceNum="$0"
            features={['The placement quiz', 'Up to 5 feed items per day', 'Weekly digest email', 'Save up to 25 items']}
            cta="Start with the quiz"
            href="/quiz"
          />
          <Plan
            kind="premium"
            tag="Premium"
            name="Compass+"
            desc="For people who already use AI daily and want the deep end."
            priceNum="$9"
            features={[
              'Full daily feed (no item cap)',
              'Full prompt library — every level × job',
              'Monthly deep-dives written for your level',
              'Archive search across all past items',
              'Custom feed controls (mute topics, pin tools)',
            ]}
            cta="Try Compass+ free for 14 days"
            href="/upgrade"
          />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-5 md:px-16 py-14 border-t border-line flex flex-wrap justify-between items-center gap-6">
        <div className="font-serif text-lg">
          Compass<span className="text-accent">.</span>
        </div>
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">find your bearing in ai</div>
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-2">© 2026</div>
      </footer>
    </main>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="p-8 border border-line rounded-xl bg-paper hover:bg-paper-2 transition-colors">
      <div className="font-mono text-[11px] tracking-[0.2em] text-accent mb-3.5">{num}</div>
      <h3 className="font-serif text-2xl font-normal leading-[1.15] tracking-tight mb-2.5">{title}</h3>
      <p className="text-[15px] leading-[1.55] text-ink-2">{body}</p>
    </div>
  );
}

function FeedCard({
  type,
  segment,
  time,
  title,
  source,
  caption,
}: {
  type: string;
  segment: string;
  time: string;
  title: string;
  source: string;
  caption: string;
}) {
  return (
    <div className="bg-paper border border-line rounded-xl p-6 flex flex-col gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,22,20,0.08)]">
      <div className="flex gap-2 flex-wrap font-mono text-[10px] tracking-[0.14em] uppercase">
        <span className="py-1 px-2.5 rounded-[3px] border border-accent text-accent">{type}</span>
        <span className="py-1 px-2.5 rounded-[3px] border border-line text-ink-2 bg-paper-2">{segment}</span>
        <span className="py-1 px-2.5 rounded-[3px] border border-line text-ink-2 bg-paper-2">{time}</span>
      </div>
      <h3 className="font-serif text-xl font-medium leading-[1.25] tracking-tight">{title}</h3>
      <p className="text-[13px] text-muted">{source}</p>
      <p className="text-[14px] leading-[1.5] text-ink-2 border-l-2 border-accent pl-3 italic">
        <strong className="not-italic text-ink font-semibold">Why this matters for you:</strong> {caption}
      </p>
    </div>
  );
}

function Plan({
  kind,
  tag,
  name,
  desc,
  priceNum,
  features,
  cta,
  href,
}: {
  kind: 'free' | 'premium';
  tag: string;
  name: string;
  desc: string;
  priceNum: string;
  features: string[];
  cta: string;
  href: string;
}) {
  const isPremium = kind === 'premium';
  return (
    <div className={`p-9 border rounded-xl ${isPremium ? 'bg-ink text-paper border-ink' : 'bg-paper border-line'}`}>
      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-3.5">{tag}</div>
      <h3 className={`font-serif text-[32px] font-normal leading-[1.05] tracking-tight mb-2 ${isPremium ? 'text-paper' : ''}`}>{name}</h3>
      <p className={`text-sm mb-6 ${isPremium ? 'text-paper/60' : 'text-ink-2'}`}>{desc}</p>
      <div className="flex items-baseline gap-1.5 mb-6">
        <span className={`font-serif text-[56px] font-normal leading-none ${isPremium ? 'text-paper' : ''}`}>{priceNum}</span>
        <span className={`font-mono text-xs tracking-wider ${isPremium ? 'text-paper/60' : 'text-muted'}`}>/ month</span>
      </div>
      <ul className="flex flex-col gap-2.5 mb-7">
        {features.map((f, i) => (
          <li key={i} className={`text-sm leading-[1.45] pl-[22px] relative ${isPremium ? 'text-paper' : 'text-ink-2'}`}>
            <span className="absolute left-0 text-accent font-mono">→</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block w-full text-center py-3.5 rounded-md text-sm font-semibold transition-all ${
          isPremium ? 'bg-paper text-ink hover:bg-accent hover:text-paper' : 'bg-ink text-paper hover:bg-accent'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
