# Compass — find your bearing in AI

A personalized AI content feed. Take a 5-minute placement quiz, get a daily feed of news, tools, prompts, and how-tos tuned to your level and your work.

## What this is

A pivot from the earlier `Are You AI Ready?` $1 quiz funnel into a free content feed with a paid premium layer. Same diagnostic engine, different product around it.

**The hypothesis:** the right wedge for AI literacy isn't a one-shot quiz — it's an ongoing feed that filters AI's noise to what matters for *who you are*. The quiz becomes a placement test for the feed.

**Differentiation moat:** the quiz produces a (level × job) cell. Most AI newsletters have one segment. Compass has 40. The same news shows up with different framing depending on which cell you're in.

## Stack

- **Next.js 14** (app router, TypeScript)
- **Neon** — managed serverless Postgres
- **Clerk** — auth (magic link + Google + GitHub, drop-in UI)
- **Tailwind CSS** — with custom CSS variables for the editorial color palette
- **OpenAI** — `gpt-4o-mini` writes the per-user caption on each feed item
- **Resend** — welcome email + weekly digest (skip for v1)
- **Stripe** — Compass+ subscription (skip for v1)
- **Vercel** — deployment

## What's built (this commit)

This commit lays the foundation. **No backend is wired up yet** — you run `npm install`, set up Supabase + the env vars, and the landing page renders. Quiz + feed screens come in the next commits.

```
compass/
├── app/
│   ├── layout.tsx          # root layout, fonts, metadata
│   ├── page.tsx            # landing page — Compass brand
│   └── globals.css         # CSS variables + Tailwind
├── components/
│   ├── BrandMark.tsx       # compass icon used in nav
│   └── CompassRose.tsx     # hero compass rose (animated on landing, points at theta on result)
├── lib/
│   ├── types.ts            # shared types
│   ├── cat-engine.ts       # ported adaptive engine (theta + SE + category balancing)
│   ├── question-bank.ts    # 45 questions × 5 tools × 3 difficulty tiers
│   ├── profiling.ts        # 3 profile questions (job / experience / goal)
│   ├── db.ts               # Neon Postgres client (server-only)
│   └── auth.ts             # Clerk helpers (currentUserId, requireUserId)
├── middleware.ts           # Clerk auth middleware — protects /feed, /profile, /saved, /admin
├── db/
│   └── schema.sql          # 6 tables: profiles, items, captions, saved_items, interactions, subscriptions
├── public/
│   └── landing-preview.html  # standalone version of the landing — open in any browser
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── .env.local.example
```

## Quick preview without `npm install`

Open `public/landing-preview.html` in any browser. You'll see the new Compass brand and landing page rendered with no build step.

## Running for real

```bash
cd compass
npm install
cp .env.local.example .env.local
# fill in Neon DATABASE_URL + Clerk keys + OpenAI key (Resend/Stripe optional)
npm run dev
```

Then run the schema against your Neon database:

```bash
# either:
psql "$DATABASE_URL" -f db/schema.sql
# or paste db/schema.sql into Neon's SQL Editor in the dashboard
```

## The CAT (computerized adaptive test) engine

Lives in `lib/cat-engine.ts`. Highlights:

- **Single global skill estimate (`theta`, 0–100)** — not per-tool. A right answer on Claude makes the next Gemini question harder.
- **Seeded from profiling** — `weekly` users start at θ=72; `never` users start at θ=20.
- **Category balancing** — questions tagged across 4 categories (capability / concept / judgment / risk); the engine prefers under-represented categories.
- **Dynamic length** — stops at 5–12 questions. Once standard error drops below 6 (or theta is clearly at an edge), the quiz ends.
- **Deterministic scoring** — same answers always produce the same score.

## Database

Six tables in Neon:

| Table          | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `profiles`     | one row per user — level, theta, job, goal                           |
| `items`        | feed items (news/tool/prompt/howto) with tagging for level + job     |
| `captions`     | per-cell LLM captions, cached forever                                |
| `saved_items`  | user × item — bookmarks                                              |
| `interactions` | view / click / dismiss / more_like — for ranking + future ML signals |
| `subscriptions`| Stripe state — free vs Compass+                                      |

Auth is enforced in the application layer — every server action / route handler calls `requireUserId()` from `lib/auth.ts` (Clerk) and includes `WHERE user_id = $clerkUserId` in its query. Neon has no RLS by design; Clerk handles auth separately.

## Roadmap

### v1 — done

- [x] Brand identity + landing page
- [x] CAT engine + question bank ported to TS
- [x] Neon schema + seed items
- [x] Clerk auth (middleware + sign-in/sign-up pages)
- [x] Profile sync via `saveQuizResult` server action
- [x] Quiz screens (profiling 1–3 → adaptive)
- [x] Result page with compass-rose needle snapping to theta
- [x] Feed page (server-rendered, per-type budget, per-cell captions)
- [x] LLM caption pipeline (gpt-4o-mini, cached forever in `captions` table)
- [x] Saved items page
- [x] Profile page
- [x] Manual admin (`/admin/items`) gated by `ADMIN_EMAILS` env

### Next

- [ ] Reddit / RSS / HN pollers (Vercel cron → `items` table with `status=pending`)
- [ ] Caption regeneration triggers (re-run when item or profile changes)
- [ ] Stripe Checkout for Compass+
- [ ] Weekly digest email via Resend
- [ ] Shareable result card (OG image)
- [ ] Custom feed controls (mute topics, pin tools)

## Legacy

The original `Are You AI Ready?` prototype lives in the parent directory (`../src/`, `../index.html` etc.). It's preserved for reference and will be removed once Compass is in users' hands.
