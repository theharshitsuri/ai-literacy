# Deploying Compass for a pitch / MVP demo

This is the end-to-end checklist to get Compass live on a real URL with the full flow working — quiz, sign-up, personalized feed.

Time to first demo: **~30 minutes** assuming you have accounts.

---

## What you need

- A Neon account (https://neon.tech) — Postgres database
- A Clerk account (https://clerk.com) — auth
- An OpenAI account with an API key — for caption generation
- A Vercel account — hosting
- A GitHub repo (`theharshitsuri/ai-literacy`) — already exists

## Step 1 — Get the keys (10 min)

### Neon
1. https://console.neon.tech → New Project → name it `compass`
2. After provisioning, Dashboard → Connection String → copy the **pooled** one
3. That's your `DATABASE_URL`

### Clerk
1. https://dashboard.clerk.com → Create application → name `Compass`
2. Choose providers: Email + Google (more later)
3. API Keys page →
   - `Publishable key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret key` → `CLERK_SECRET_KEY`
4. Paths page → set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-up URL: `/quiz/complete`
   - After sign-in URL: `/feed`

### OpenAI
1. https://platform.openai.com/api-keys → Create new secret key
2. That's your `OPENAI_API_KEY`. Model defaults to `gpt-4o-mini`.

## Step 2 — Apply the schema + seed (5 min)

Pick one of:

**Option A — Neon SQL editor**
1. Neon dashboard → SQL Editor → New query
2. Paste contents of `compass/db/schema.sql` → Run
3. Six tables appear in the Table editor

**Option B — psql**
```bash
psql "$DATABASE_URL" -f compass/db/schema.sql
```

Then locally:
```bash
cd compass
cp .env.local.example .env.local
# fill in the 5 env vars: DATABASE_URL, CLERK keys (2), OPENAI key, ADMIN_EMAILS
npm install
npm run db:seed          # loads 32 curated items
npm run db:captions      # pre-bakes ~1,280 captions ($0.25, ~10 min)
```

`npm run db:captions` is critical for a pitch — without it the feed makes live OpenAI calls and the first render is slow.

## Step 3 — Verify locally (2 min)

```bash
npm run dev
```

Open http://localhost:3000:
- Landing renders, compass rose animates
- Click "Take the quiz" → profiling → adaptive
- Result page shows needle pointing at your theta
- Click "Save my result + see my feed" → Clerk modal opens
- Sign up → feed renders within 1s with personalized captions

If feed feels slow → `npm run db:captions` wasn't run.

## Step 4 — Deploy to Vercel (5 min)

```bash
cd compass
npx vercel
```

Walk through:
- Link to GitHub? Yes — pick `theharshitsuri/ai-literacy`
- Root directory? `compass`
- Framework? Next.js (detected automatically)

After first deploy, Vercel gives you a URL like `compass-abc123.vercel.app`. Open it — the landing page works.

But the quiz won't yet — Vercel doesn't have your env vars.

## Step 5 — Set Vercel env vars (5 min)

Vercel dashboard → your project → Settings → Environment Variables. Add each:

| Name                                | Value                                   |
| ----------------------------------- | --------------------------------------- |
| `DATABASE_URL`                      | (your Neon pooled connection string)    |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | (Clerk publishable)                     |
| `CLERK_SECRET_KEY`                  | (Clerk secret — production!)            |
| `OPENAI_API_KEY`                    | (your OpenAI key)                       |
| `OPENAI_MODEL`                      | `gpt-4o-mini`                           |
| `ADMIN_EMAILS`                      | `you@example.com`                       |
| `NEXT_PUBLIC_BASE_URL`              | `https://compass-abc123.vercel.app`     |

For all of these: scope = "Production, Preview, and Development".

Click "Deployments" → "Redeploy" → with latest commit.

## Step 6 — Production Clerk setup (3 min)

Clerk dashboard → your app → Settings → Domains:
- Add your Vercel URL (`https://compass-abc123.vercel.app`)
- Optional: add a custom domain later

Authorized redirect URLs (in Clerk):
- `https://compass-abc123.vercel.app/sign-in/sso-callback`
- `https://compass-abc123.vercel.app/sign-up/sso-callback`
- (Clerk usually adds these automatically — verify)

## Step 7 — The pitch demo walk

A 90-second flow that shows the whole product:

1. **Open the landing.** Pause on the compass rose. *"AI moves fast. Most newsletters dump everything on everyone. Compass starts with a 5-minute placement quiz and gives you a personalized feed."*
2. **Click "Take the quiz."** Walk through the three profiling questions slowly. *"We ask about your job, your AI experience, and one thing you want help with — those three answers seed the quiz."*
3. **Run the quiz.** Answer 5-9 questions truthfully. *"This is computerized adaptive testing — every right answer makes the next question harder. We stop as soon as we're confident in your level."*
4. **Land on the result.** *"The needle rotates to point at your bearing. That's not decorative — it's the user's coordinates."*
5. **Click "Save my result + see my feed."** Clerk modal pops, sign up.
6. **Land on feed.** *"Same news, different read depending on you. The italic line under each item is generated specifically for your level and your work."*
7. **Click into one item, save another.**
8. **Click profile** — *"Your bearing persists. Retake the quiz any time."*

## Common pitch failures + how to dodge

- **Caption latency** — pre-bake before the demo. Re-run `npm run db:captions` locally any time you add items.
- **Clerk Google sign-in not working** — verify the redirect URI in Google Cloud Console matches Clerk's expected one. Clerk's dashboard surface tells you exactly what to paste.
- **Empty feed for niche cells** — the 3-stage fallback in `lib/feed.ts` handles this. Confirm via `tsx db/test-feed-coverage.ts` if available.
- **Mobile demo on phone** — open Vercel URL, take the quiz on your phone. The compass rose and quiz cards are responsive but worth a once-over before going on stage.

## What still needs building (be honest about this)

If you're asked "what's not done yet":

- Stripe Compass+ checkout — pricing page exists, payment flow is stubbed
- Reddit/RSS/HN pollers — for now content is hand-curated via `/admin/items`
- Weekly digest email via Resend
- Shareable result OG card (the social card exists but per-user result cards are coming)
- Mobile app

You can phrase this as "MVP scope" — the foundational product loop is shipping; the monetization and growth surfaces ship next.
