// =====================================================================
// COMPUTERIZED ADAPTIVE TEST (CAT) ENGINE — Compass quiz
// =====================================================================
// Single global skill estimate (theta, 0–100) + standard error (SE).
// Each next question is chosen by: target difficulty bucket (from theta)
// → prefer under-represented category → prefer under-represented tool.
//
// Seeded from profilingAnswers — a "weekly user" doesn't start at the
// same difficulty as a "never tried" user.
//
// Stops early once SE drops below a threshold OR theta is clearly at an
// edge of the distribution. Floor of 5 questions, hard cap at 12.
// =====================================================================

import type {
  ToolId, Difficulty, Category, Level,
  RawQuestion, RenderedQuestion, QuizState, ProfilingAnswers,
} from './types';
import { QUESTION_BANK, CATEGORY_TAGS, TOOLS } from './question-bank';

// ─── tuning constants ─────────────────────────────────────────────
export const MIN_Q     = 5;       // never stop before this many
export const MAX_Q     = 12;      // never go past this many
const   SE_STOP        = 6;       // stop once SE < this (after MIN_Q)
const   SE_INIT        = 22;      // starting SE
const   SE_DECAY       = 0.86;    // SE multiplier per answer
const   LR             = 0.32;    // learning rate for theta updates
const   DIFF_VAL: Record<Difficulty, number> = { easy: 30, medium: 55, hard: 80 };
const   DIFF_PTS: Record<Difficulty, number> = { easy: 5,  medium: 10, hard: 20 };
const   CATEGORIES: Category[] = ['capability', 'concept', 'judgment', 'risk'];

// ─── shuffle helpers ──────────────────────────────────────────────
function _shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── seed from profiling ──────────────────────────────────────────
export function seedFromProfile(profile?: ProfilingAnswers): { theta: number; se: number } {
  const usageMap: Record<NonNullable<ProfilingAnswers['p2']>, number> = {
    never:     20,
    heard:     30,
    once:      45,
    sometimes: 58,
    weekly:    72,
  };
  let theta = profile?.p2 ? usageMap[profile.p2] : 50;
  // Substantive goal text → small bump (signals engagement).
  const goal = (profile?.p3 || '').trim();
  if (goal.length >= 25) theta += 4;
  return { theta: Math.max(10, Math.min(85, theta)), se: SE_INIT };
}

// ─── shuffleOptions ───────────────────────────────────────────────
function shuffleOptions(rawQ: RawQuestion, diff: Difficulty, toolId: ToolId, catIdx: number): RenderedQuestion {
  const indexed = rawQ.o.map((opt, i) => ({ opt, isCorrect: i === rawQ.a }));
  const shuffled = _shuffle(indexed);
  const cat: Category = CATEGORY_TAGS[toolId][diff][catIdx] || 'capability';
  return {
    question:    rawQ.q,
    opts:        shuffled.map(x => x.opt),
    correctIdx:  shuffled.findIndex(x => x.isCorrect),
    explanation: rawQ.e,
    diff,
    toolId,
    cat,
    qKey:        `${toolId}:${diff}:${catIdx}`,
  };
}

// ─── build state ──────────────────────────────────────────────────
export function buildQuizState(profile?: ProfilingAnswers): QuizState {
  const seed = seedFromProfile(profile);
  return {
    theta: seed.theta,
    se: seed.se,
    asked: 0,
    done: false,
    doneReason: '',
    history: [],
    usedKeys: new Set<string>(),
    catCount: { capability: 0, concept: 0, judgment: 0, risk: 0 },
    toolCount: { chatgpt: 0, claude: 0, gemini: 0, copilot: 0, perplexity: 0 },
    toolScore: {
      chatgpt:    { correct: 0, total: 0 },
      claude:     { correct: 0, total: 0 },
      gemini:     { correct: 0, total: 0 },
      copilot:    { correct: 0, total: 0 },
      perplexity: { correct: 0, total: 0 },
    },
    diffTrack: { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } },
    totalPoints: 0,
  };
}

// ─── pick next question ───────────────────────────────────────────
function targetDiff(theta: number): Difficulty {
  if (theta < 40)  return 'easy';
  if (theta <= 65) return 'medium';
  return 'hard';
}

function diffFallback(target: Difficulty): Difficulty[] {
  if (target === 'easy')   return ['medium', 'hard'];
  if (target === 'medium') return ['easy', 'hard'];
  return ['medium', 'easy'];
}

export function pickNextQuestion(state: QuizState): RenderedQuestion | null {
  const target = targetDiff(state.theta);
  const tryDiffs: Difficulty[] = [target, ...diffFallback(target)];

  for (const diff of tryDiffs) {
    // collect all unused candidates at this difficulty
    type Candidate = { rawQ: RawQuestion; diff: Difficulty; toolId: ToolId; catIdx: number; qKey: string; cat: Category };
    const candidates: Candidate[] = [];
    for (const toolId of TOOLS) {
      const pool = QUESTION_BANK[toolId][diff];
      pool.forEach((rawQ, idx) => {
        const qKey = `${toolId}:${diff}:${idx}`;
        if (state.usedKeys.has(qKey)) return;
        const cat = CATEGORY_TAGS[toolId][diff][idx] || 'capability';
        candidates.push({ rawQ, diff, toolId, catIdx: idx, qKey, cat });
      });
    }
    if (!candidates.length) continue;

    // score each: under-represented cat (+10), under-represented tool (+5), small jitter
    const minCat  = Math.min(...CATEGORIES.map(c => state.catCount[c]));
    const minTool = Math.min(...TOOLS.map(t => state.toolCount[t]));
    const scored = candidates.map(c => ({
      ...c,
      score: (state.catCount[c.cat]    === minCat  ? 10 : 0)
           + (state.toolCount[c.toolId] === minTool ?  5 : 0)
           + Math.random() * 3,
    }));
    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0];
    return shuffleOptions(chosen.rawQ, chosen.diff, chosen.toolId, chosen.catIdx);
  }
  return null;
}

// ─── theta update ─────────────────────────────────────────────────
function updateTheta(theta: number, se: number, qDiffVal: number, correct: boolean): number {
  const seWeight = se / SE_INIT;
  const target = correct ? qDiffVal + 10 : qDiffVal - 10;
  return theta + LR * seWeight * (target - theta);
}

// ─── record answer ────────────────────────────────────────────────
export function recordAnswer(state: QuizState, currentQ: RenderedQuestion, wasCorrect: boolean): QuizState {
  const next: QuizState = {
    ...state,
    usedKeys:  new Set(state.usedKeys),
    catCount:  { ...state.catCount },
    toolCount: { ...state.toolCount },
    history:   [...state.history],
    toolScore: {
      ...state.toolScore,
      [currentQ.toolId]: { ...state.toolScore[currentQ.toolId] },
    },
    diffTrack: {
      easy:   { ...state.diffTrack.easy   },
      medium: { ...state.diffTrack.medium },
      hard:   { ...state.diffTrack.hard   },
    },
  };

  next.usedKeys.add(currentQ.qKey);
  next.catCount[currentQ.cat]++;
  next.toolCount[currentQ.toolId]++;

  const diff = currentQ.diff;
  next.toolScore[currentQ.toolId].total++;
  next.diffTrack[diff].t++;
  if (wasCorrect) {
    next.totalPoints += DIFF_PTS[diff];
    next.toolScore[currentQ.toolId].correct++;
    next.diffTrack[diff].c++;
  }

  next.theta = Math.max(5, Math.min(98, updateTheta(state.theta, state.se, DIFF_VAL[diff], wasCorrect)));
  next.se    = state.se * SE_DECAY;
  next.asked = state.asked + 1;

  next.history.push({
    qKey:       currentQ.qKey,
    toolId:     currentQ.toolId,
    diff,
    cat:        currentQ.cat,
    correct:    wasCorrect,
    thetaAfter: next.theta,
    seAfter:    next.se,
  });

  const stop = stopCheck(next);
  next.done = stop.done;
  next.doneReason = stop.reason;
  return next;
}

// ─── stop check ───────────────────────────────────────────────────
function stopCheck(state: QuizState): { done: boolean; reason: QuizState['doneReason'] } {
  if (state.asked >= MAX_Q)                                 return { done: true, reason: 'max' };
  if (state.asked < MIN_Q)                                  return { done: false, reason: '' };
  if (state.se < SE_STOP)                                   return { done: true, reason: 'confident' };
  if (state.asked >= 6 && (state.theta < 18 || state.theta > 85))
                                                            return { done: true, reason: 'edge' };
  return { done: false, reason: '' };
}

// ─── level mapping ────────────────────────────────────────────────
export function levelFromTheta(theta: number): Level {
  if (theta < 32) return 'newcomer';
  if (theta < 55) return 'curious';
  if (theta < 78) return 'user';
  return 'ready';
}

// 0–100 → 0–30 for legacy compat with prior copy ("X / 30")
export function thetaToScore(theta: number): number {
  return Math.round((theta / 100) * 30);
}
