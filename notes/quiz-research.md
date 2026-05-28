# AI Literacy Quiz — Research Memo

**Date:** April 19, 2026
**Question:** What makes a personal AI literacy quiz actually feel like a real diagnostic — not a BuzzFeed quiz?

---

## TL;DR

Move from 8 self-report MCQs to **10 performance-based items** across **four formats** (single-choice, multi-select, open-text, Likert) covering **five dimensions** (knowledge, usage, fluency, judgment, safety). Score open-ended items with an LLM-as-judge using a rubric — we can stub that now with a local heuristic and wire your API key later without touching the UI.

This matches where serious AI-literacy research has landed in 2024–2025 (GLAT, MAILS short-form, SAIL4ALL).

---

## What the academic literature actually does

Four instruments keep showing up:

**MAILS — Meta AI Literacy Scale** (Carolus, Koch, et al., 2023). 34-item self-report, 10-item short form. Facets: *Use & Apply · Understand · Detect · Ethics · Create · Self-efficacy · Self-management*. Entirely Likert. Good for research, weak for our use case — self-report lets confident-but-wrong people score themselves high.

**Long & Magerko** (CHI 2020). The conceptual backbone: **17 competencies in 5 themes** — *What is AI? · What can AI do? · How does AI work? · How should AI be used? · How do people perceive AI?* Not itself an instrument, but every serious assessment since 2023 cites this framework.

**GLAT — Generative AI Literacy Assessment Test** (2024). This is the one to copy. **Performance-based**, 18–20 items, web-based and timed, mixes MCQ + open-ended, scored with LLM + human spot-checks. Specifically built for generative AI (ChatGPT era), not 2019-era "is AI in your thermostat" stuff. Closest to what we want.

**SAIL4ALL** (Nature, 2025). Scale for all adults — emphasizes that non-technical adults need judgment and ethics, not coding.

**Across all of them the consensus format is:**

| Format | What it measures | Example |
|---|---|---|
| Single-select MCQ | Knowledge, recognition | "Which of these is FALSE about ChatGPT?" |
| Multi-select MCQ | Tool & concept breadth | "Which of these are AI chatbots? (Select all)" |
| Scenario MCQ | Judgment | "You got a statistic from AI for a proposal. What do you do?" |
| Open-text | Understanding, fluency | "In your own words, what's a hallucination?" |
| Likert self-report | Confidence (for calibration) | "How confident are you that you'd spot a wrong answer?" |

The magic move is **calibration**: a self-reported "very confident" paired with a wrong objective answer is a flag for overconfidence — worth surfacing in the result.

---

## Why not fully LLM-generated questions

Tempting, but it breaks three things we care about:

1. **The "1 of 4 levels" promise.** If every person sees different questions, levels aren't comparable — Maya's "Curious" doesn't mean what Deon's "Curious" means. BuzzFeed gets away with this because it doesn't promise real diagnosis.
2. **Cost per user.** An API call per question × 10 questions × every quiz taker gets expensive fast, especially when most of those calls would produce something a static bank already has.
3. **Quality variance.** Hand-tuned questions with known-good distractors beat LLM-generated ones on discriminative power. Harder to QA a moving target.

**Where LLM does earn its keep:** scoring the 2–3 open-ended items per quiz. That's cheap (~$0.002/user with Haiku), fast, and gives us the nuance that MCQ can't. This is exactly the "LLM-as-judge" pattern — well-established, rubric-scored, categorical 0–3.

---

## Proposed quiz (10 items, ~2.5 min)

Mapping each item to a dimension and a Long & Magerko theme. Times assume median user.

| # | Format | Dimension | Theme (L&M) | Est. time |
|---|---|---|---|---|
| Q1 | Single MCQ | Usage — when did you last use it | What AI can do | 8s |
| Q2 | Multi MCQ | Tool awareness | What is AI | 12s |
| Q3 | **Open text** | Prompt fluency | How AI works | 40s |
| Q4 | **Open text** | Hallucination understanding | How AI works | 25s |
| Q5 | Single MCQ | Verification behavior (scenario) | How should AI be used | 12s |
| Q6 | Multi MCQ | Safety — what to never paste | How should AI be used | 15s |
| Q7 | Single MCQ | Factual — spot the false claim | What AI can do | 12s |
| Q8 | Single MCQ | Judgment (wedding toast scenario) | How should AI be used | 15s |
| Q9 | Likert 1–4 | Self-reported confidence (for calibration) | How people perceive AI | 6s |
| Q10 | **Open text** | Curiosity — what you want AI to do | How people perceive AI | 25s |

**Total:** ~2m 50s — still comfortably within the "under 3 minutes" promise.

**Scoring** — 0–3 points per item, max 30. Re-calibrate level bands:
- Newcomer 0–9
- Curious 10–17
- User 18–24
- Ready 25–30

Q10 is not scored — it's for personalization (we feed it to the newsletter + result page as "you wanted help with X").

**Calibration flag:** if Q9 = 4 ("very confident") but objective score (Q3–Q7) < 12, flag as "overconfident" and add a gentle line in the result ("you're more confident than your answers suggest — that's the most common AI-literacy trap").

---

## LLM-scoring rubric (for open-ends Q3, Q4, Q10-note)

**Q3 — Prompt quality (0–3):**
- 0 — Empty, gibberish, or "write me an email"
- 1 — Basic ask, no context
- 2 — Has a clear task + 1 of {role, format, tone, context}
- 3 — Has a clear task + 2+ of {role, format, tone, context, constraints, examples}

**Q4 — Hallucination understanding (0–3):**
- 0 — Blank, "don't know," or wrong (e.g., "AI dreaming")
- 1 — Vague gesture at "AI being wrong"
- 2 — Correct: AI confidently makes things up
- 3 — Correct + specific (mentions plausible-but-fake citations, dates, facts, or names a consequence)

**Q10** — not scored, but LLM extracts 2–3 keywords for result personalization.

Each judgment call should be **categorical 0/1/2/3** (per LLM-as-judge best practice — avoids float drift), with the rubric in the prompt plus 2 few-shot examples. Haiku is fine. Validate on 30 hand-scored responses before trusting production.

---

## Implementation plan

1. Expand `src/data.jsx` `QUIZ` to support `type: 'single' | 'multi' | 'text' | 'likert'` with per-type scoring.
2. Rewrite `src/screens/quiz.jsx` to render each type (single-select tap · multi-select tap · text area · Likert strip).
3. Keep progress bar + one-per-screen flow.
4. `scoreAnswers()` handles all types. Open-ends get a **local heuristic score** (checks for length + keyword hits) flagged as *preliminary*; the real LLM scoring hook is marked so you can wire your API key later without touching UI.
5. Recalibrate level bands to 0–30 max.

Everything else (job selector, result, email, newsletter, workplace) keeps working — they read from the same `level` + `score` outputs.

---

## Sources

- [MAILS — Meta AI Literacy Scale (arXiv)](https://arxiv.org/abs/2302.09319)
- [MAILS short-form validation (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11544068/)
- [GLAT — The Generative AI Literacy Assessment Test (arXiv)](https://arxiv.org/html/2411.00283v1)
- [GLAT on ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2666920X25000761)
- [Long & Magerko — What is AI Literacy? (CHI 2020)](https://aiunplugged.lmc.gatech.edu/wp-content/uploads/sites/36/2020/08/CHI-2020-AI-Literacy-Paper-Camera-Ready.pdf)
- [SAIL4ALL — Scale of AI Literacy for All (Nature, 2025)](https://www.nature.com/articles/s41599-025-05978-3)
- [AI literacy assessment for non-technical adults (ERIC)](https://files.eric.ed.gov/fulltext/EJ1437452.pdf)
- [LLM-as-a-Judge practical guide (Evidently)](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- [Monte Carlo — 7 best practices for LLM-as-Judge](https://www.montecarlodata.com/blog-llm-as-judge/)
