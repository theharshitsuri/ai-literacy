# Are You AI Ready? — Product + Technical Writeup

**Date:** April 19, 2026

## What it is

A personal AI literacy diagnostic masquerading as a lead magnet. Ten questions in under three minutes, an honest score out of 30, one of four levels (Newcomer / Curious / User / Ready), a personalized seven-day plan matched to your job, and — if you want — a workplace-specific upsell that pivots the same diagnostic into job-specific use.

The core insight the product is built on: the people who are loudest about AI often score the lowest, and the people who feel behind are usually one or two habits away from being fluent. The quiz is the proof.

## Who it's for

Non-technical adults aged 25–55 who feel a step behind on AI. Not developers. Not AI researchers. The retail manager, the office admin, the small-business owner, the teacher, the nurse. People who've heard the hype, maybe opened ChatGPT once or twice, and can't tell if they're doing okay or falling behind.

Counter-positioning: everything else in this category is either a BuzzFeed-style self-report quiz ("are you more of a ChatGPT or a Claude?") or a technical benchmark pitched at developers. Nothing meets the non-technical adult where they are — with a real diagnostic, fairly scored, that treats them like an adult.

## The quiz

Ten items. Four formats. Five literacy dimensions.

1. **Usage** — single-choice. When did you last use ChatGPT/Claude/Gemini?
2. **Tool awareness** — multi-select. Which of these are AI chatbots you can actually talk to? Includes traps — Alexa and Grammarly are AI-adjacent but not chatbots you have conversations with.
3. **Prompt fluency** — open-text. Type the actual prompt you'd paste into ChatGPT to write a late-payment email. Not the email. The prompt.
4. **Understanding** — open-text. In your own words, what does it mean when AI "hallucinates"?
5. **Verification** — single-choice scenario. ChatGPT gives you a statistic. You're short on time. What do you actually do?
6. **Safety** — multi-select. Which of these is fine to paste into ChatGPT? Selecting the SSN option is a hard fail regardless of other picks.
7. **Fact-check** — single-choice. Which statement about AI is FALSE?
8. **Judgment** — single-choice scenario. Wedding toast for your sister — what's the best use of AI?
9. **Self-awareness** — Likert 1–4. How confident are you that you'd catch a wrong answer?
10. **Curiosity** — open-text. One thing you'd love AI to help with but don't know how. Not scored for level — feeds the newsletter content.

Each item is 0–3 points. Max 30. Level bands: Newcomer 0–9, Curious 10–17, User 18–23, Ready 24–30.

### Adaptive branching

Items 3, 4, and 7 swap to variants based on Q1/Q2 answers.

The **novice path** fires when Q1 is "never heard" or "never tried." Q3 and Q4 become recognition-style MCQs instead of open-text. Asking someone who's never used AI to type a prompt produces nothing useful — they pick between four pre-written prompts of varying quality and between four definitions of "hallucinate."

The **power path** fires when Q1 is "weekly" AND Q2 correctly identifies all four chatbots with no wrong picks. Q7 swaps from "AI is bad at math" (obvious to a power user) to a sharper question about matching model to task — ChatGPT vs Claude vs Gemini strengths, live-web limitations, etc.

The **core path** is everyone else.

Same answers always produce the same score — it's a diagnostic, not a random walk. But the items people see are calibrated to their level.

## The research behind it

Full memo in `notes/quiz-research.md`. Short version: we reviewed four instruments — MAILS, Long & Magerko (CHI 2020), GLAT, and SAIL4ALL. Ran into the same pattern.

Self-report Likert doesn't measure literacy. MAILS gives someone who says "I'm confident I'd catch a wrong answer" a high score — even if in practice they'd wave through every hallucination. That's the most common AI-literacy failure mode.

Performance-based beats self-report. GLAT (arXiv:2411.00283) — the state-of-the-art AI literacy instrument, 2024 — mixes MCQ + open-ended + scenario, scored with LLM + human spot-checks. That's the template we copied.

Don't let LLMs generate every question. Tempting, but breaks three things: level comparability (if every person sees different questions, "you're a Curious" stops meaning anything across users), cost per taker (~$0.20/user instead of ~$0.002), and QA variance. The right move is static hand-tuned items, LLM scoring only on the open-ends.

Calibration over confidence. Q9 exists to check whether someone's self-reported confidence matches their objective score. When it doesn't, an `overconfidenceFlag()` helper surfaces "you're more confident than your answers suggest — the most common AI-literacy trap" on the result page.

## Scoring

**The seven objective items** (Q1, Q2, Q5–Q9) are scored synchronously in the browser with deterministic rules. No LLM. No ambiguity. Same answers always return the same points.

**The three open-text items** (Q3, Q4, Q10) are scored asynchronously by OpenAI `gpt-4o-mini` during the Processing screen's animated delay. Each has a per-item rubric (categorical 0–3, not float — LLM-as-judge best practice) and four few-shot examples to anchor the grader. The request uses temperature 0, max 4 tokens, and a strict system prompt that forces the reply to a single integer.

If the API fails, the network is down, or the key is missing, the scoring falls back silently to a local regex-based heuristic — checking for prompt-structure markers (role, tone, format, context, constraints) or correct understanding (makes-up + specificity). Users never see a failure.

A shared score cache (`__scoreCache`, keyed by `JSON.stringify(answers)`) means once the async score is computed during processing, every downstream screen (Result, Workplace, Email, Newsletter) picks up the upgraded number via the same synchronous `scoreAnswers(answers)` call — no extra plumbing.

## The four profiles

Each profile has a color, glyph, tag, three-tone vibe line (warm / clinical / playful), three strengths, three gaps, a seven-day plan, and a safety rule. All written as the kind of thing you'd actually send to a friend.

- **AI Newcomer** — starting from zero. "No shame in starting now. Most people are bluffing anyway." Green, ◐.
- **AI Curious** — dabbled, no system. "You know what AI is. Time to make it earn its keep." Amber, ◔.
- **AI User** — regular user, some gaps. "You're ahead of most people you know. Let's fix the last three gaps." Orange, ◑.
- **AI Ready** — fluent, verified, safe. "You've built the habit. Let's get surgical." Ink, ●.

## Job personalization

Ten job buckets: retail, office, small-business, creative, teaching, healthcare, trades, student, retired, other.

Each job has a pack with a display name ("retail & service work," "healthcare work"), a "first win" — the one prompt they can use in the next 30 seconds — five role-specific prompt templates, and a safety addition layered on top of the level-specific safety rule.

Level × Job stitching: the seven-day plan comes from the level data, but the prompts and first-win come from the job pack. A Curious-tier office worker and a Curious-tier nurse get the same seven-day plan but different prompts.

## The flow

**Landing.** "Are you AI ready?" + 90-second diagnostic pitch + CTA.

**$1 checkout** (optional, toggleable from the tweak panel). Stripe-style form, no real card processing.

**Quiz.** Ten items, one per screen, adaptive branching, progress bar. Text items show char count vs. minimum. Multi-select requires explicit Next. Single-choice and Likert auto-advance on tap.

**Job picker.** Ten tiles plus an "other" text field.

**Processing.** Animated analyzing screen that actually calls OpenAI in parallel with the animation. A terminal-style log shows the real stages ("Sending 3 open-text answers to gpt-4o-mini…"). Completes when both the animation AND the async scoring finish, whichever is later. Shows the matched level + score before advancing.

**Result.** The centerpiece. Full-page editorial report. Hero with level identity, score out of 30, percentile. Level ladder showing all four tiers with your position highlighted. Three strengths + three gaps. Seven-day plan. Your safety rule. Example prompts from your job pack. Workplace-pivot CTA.

**Workplace** (optional). Pivots from personal literacy to job-specific use. "What a Curious-level office worker should try on Monday." A five-day workweek plan + three risks that matter at work + a $19 pack stub.

**Confirm.** Thanks for subscribing / paying.

**Welcome email.** Preview of the E0 that would go out, with level + job pack stitched in.

**Newsletter.** Preview of the first issue.

## Technical architecture

React 18 via unpkg + Babel Standalone for in-browser JSX. No build step beyond a `cat`-and-inline script. Single-file deployable HTML.

**Files.**

- `src/data.jsx` — quiz data, levels, job packs, scoring, LLM judge, adaptive resolver
- `src/primitives.jsx` — shared UI primitives
- `src/screens/*.jsx` — one file per screen
- `src/tweaks.jsx` — the edit-mode tweak panel
- `src/app.jsx` — the top-level composition
- `src/bundle.jsx` — generated concat of all sources (gitignored)
- `index.html` — dev entry
- `index-standalone.html` — generated with bundle inlined + env vars injected (gitignored because the API key is in it)
- `build.js` — the build pipeline (reads `.env`, cats sources, injects env, writes standalone)
- `smoke.js` — JSDOM + react-dom/server renders every screen to catch runtime errors

**Build pipeline.**

```
node build.js     # reads .env → src/bundle.jsx + index-standalone.html
node smoke.js     # renders all 11 screens under JSDOM
```

**Environment variables.**

- `OPENAI_API_KEY` — injected into `window.OPENAI_API_KEY` at build time
- `OPENAI_MODEL` — defaults to `gpt-4o-mini`

The key is currently client-side, inlined into the standalone HTML. For local/personal use this is fine. For any public deployment, the OpenAI call needs to move behind a serverless proxy (Cloudflare Worker or Vercel function).

## What's not built yet

**Real Stripe integration.** The $1 checkout and $19 workplace pack are UI stubs. No money moves.

**Real newsletter sending.** The email and newsletter screens are previews — beautifully rendered, but they don't hit a mail provider.

**Durable storage.** Answers live in React state only. Refresh = lose your place. No database.

**Server-side LLM proxy.** The OpenAI key is in the browser bundle. Fine for personal prototyping, not for shipping.

**Result sharing.** No "share my result" image or link. Worth adding — the level glyph + one-line summary would make a good social card.

**Email capture before result.** Currently you see the result first and the email capture is downstream. Moving capture before the result would maximize list growth but hurt the "genuine diagnostic" feel. Worth A/B-ing.

**More items for the top of the distribution.** Someone who scores 27 vs. 30 is very different in practice but the current instrument can't distinguish them. Adding two or three advanced items would tighten that band.

## Suggested next steps, ordered

1. **Wire Stripe + email provider.** Turn the stubs into real things. Biggest lift per hour.
2. **Server-side LLM proxy.** Twenty minutes on Cloudflare Workers. Protects the key before any public deploy.
3. **Shareable result card.** An SVG or OG image of "I'm an AI Curious (Level 02 of 04)." Drives organic traffic.
4. **Email sequence beyond E0.** The level × job matrix already maps cleanly to content; turn four levels × ten jobs into a drip sequence.
5. **Top-of-scale items.** Two or three advanced items for the Ready band so scores 24–30 are properly discriminated.
6. **LLM-generated follow-up.** One custom follow-up question per run, for color only. Adds personality without breaking diagnostic validity.
