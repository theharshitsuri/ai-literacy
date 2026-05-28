// Level metadata — text + UX surface shown on the result page and in the feed
// once the user is placed. Source of truth for level copy across the app.

import type { Level } from './types';

export type LevelMeta = {
  id: Level;
  name: string;
  short: string;          // 1-line vibe
  range: [number, number];// theta band
  scoreBand: [number, number]; // legacy 0–30 score band
  rank: 1 | 2 | 3 | 4;
  cardinal: 'W' | 'S' | 'E' | 'N';
  description: string;    // 2–3 sentence read on what this level means
  strengths: string[];
  gaps: string[];
};

export const LEVELS: Record<Level, LevelMeta> = {
  newcomer: {
    id: 'newcomer',
    name: 'AI Newcomer',
    short: 'Starting from zero — and that\'s fine.',
    range: [0, 32],
    scoreBand: [0, 9],
    rank: 1,
    cardinal: 'W',
    description: "You haven't used AI much yet — or you have but haven't found a routine. No shame in starting now. Most people who *act* like they know AI are bluffing. The next few weeks are the highest-leverage ones.",
    strengths: ['Beginner mindset — open to learning', 'Not yet stuck in bad habits', 'Big runway for compounding wins'],
    gaps: ['Unsure what AI is actually good at', 'No daily AI habit yet', 'Hard to tell signal from hype'],
  },
  curious: {
    id: 'curious',
    name: 'AI Curious',
    short: 'You\'ve dabbled. Time to make it earn its keep.',
    range: [32, 55],
    scoreBand: [10, 17],
    rank: 2,
    cardinal: 'S',
    description: "You know what AI is, you've poked at ChatGPT or Claude a few times. Now it's about turning curiosity into a system — a few repeatable use cases that actually save you time at work.",
    strengths: ['Comfortable with the basics', 'Curious about new tools', 'Willing to try things'],
    gaps: ['No clear use cases tied to work', 'Easily distracted by shiny new tools', 'Verification habits still forming'],
  },
  user: {
    id: 'user',
    name: 'AI User',
    short: "You're ahead of most people you know. Let's fix the last three gaps.",
    range: [55, 78],
    scoreBand: [18, 23],
    rank: 3,
    cardinal: 'E',
    description: "You use AI weekly, you know the difference between the major tools, you can write a decent prompt. The Compass feed at this level is about depth — picking the right tool per task, building your own prompt library, learning what to *not* trust.",
    strengths: ['Regular AI habit', 'Knows multiple tools', 'Generally good prompts'],
    gaps: ['Occasionally trusts hallucinations', 'Doesn\'t fully use long-context features', 'Hasn\'t built personal prompt library yet'],
  },
  ready: {
    id: 'ready',
    name: 'AI Ready',
    short: "You've built the habit. Let's get surgical.",
    range: [78, 100],
    scoreBand: [24, 30],
    rank: 4,
    cardinal: 'N',
    description: "You use AI fluently, you know its limits, you verify the right things. The Compass feed at this level is technical — model releases, eval results, agent patterns, governance shifts. Less 'what is AI'; more 'what's actually changing this week'.",
    strengths: ['Fluent across tools', 'Strong verification habits', 'Builds repeatable workflows'],
    gaps: ['Risk of overconfidence on edge cases', 'May not be tracking latest agent / MCP shifts', 'Worth pressure-testing your safety defaults'],
  },
};
