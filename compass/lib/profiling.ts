// Profiling — three questions that run BEFORE the adaptive quiz.
// Their answers (1) seed the CAT engine's starting theta and (2) determine
// which job pack drives the personalized feed after the quiz.
//
//   p1  job  (single-select grid)
//   p2  AI usage  (single)
//   p3  goal  (free-text, optional but recommended)

import type { JobId } from './types';

export type Job = {
  id: JobId;
  label: string;
  icon: string;
  sample: string;
};

export const JOBS: Job[] = [
  { id: 'retail',    label: 'Retail or service',      icon: '◉', sample: 'Cashier, barista, gas station, server…' },
  { id: 'office',    label: 'Office or admin',        icon: '▣', sample: 'Assistant, ops, coordinator, analyst…' },
  { id: 'smb',       label: 'Small business owner',   icon: '◆', sample: 'Solo founder, shop owner, freelancer…' },
  { id: 'creative',  label: 'Creative work',          icon: '◐', sample: 'Writer, designer, marketer, photographer…' },
  { id: 'teach',     label: 'Teaching or education',  icon: '✦', sample: 'Teacher, tutor, professor, trainer…' },
  { id: 'health',    label: 'Healthcare',             icon: '✚', sample: 'Nurse, doctor, therapist, technician…' },
  { id: 'trades',    label: 'Trades & manual work',   icon: '▼', sample: 'Construction, plumbing, electrical, repair…' },
  { id: 'developer', label: 'Developer or engineer',  icon: '⌘', sample: 'Software, data, IT, infrastructure…' },
  { id: 'student',   label: 'Student',                icon: '◇', sample: 'High school, college, grad…' },
  { id: 'retired',   label: 'Retired',                icon: '◯', sample: 'Just exploring AI for personal use' },
  { id: 'other',     label: 'Something else',         icon: '▽', sample: 'Tell us in one word' },
];

// Profiling questions
export type ProfilingQuestion =
  | { id: 'p1'; num: '01'; topic: string; type: 'job-grid'; prompt: string; hint: string }
  | { id: 'p2'; num: '02'; topic: string; type: 'single';   prompt: string; hint: string; options: { id: string; label: string }[] }
  | { id: 'p3'; num: '03'; topic: string; type: 'text';     prompt: string; hint: string; placeholder: string; minChars: number };

export const PROFILING: ProfilingQuestion[] = [
  {
    id: 'p1', num: '01', topic: 'Your work', type: 'job-grid',
    prompt: 'What do you do for work?',
    hint: 'Personalizes your feed — no wrong answer.',
  },
  {
    id: 'p2', num: '02', topic: 'AI experience', type: 'single',
    prompt: 'Have you used an AI tool like ChatGPT, Claude, or Gemini?',
    hint: 'No wrong answer — just honest.',
    options: [
      { id: 'never',     label: 'Never heard of them' },
      { id: 'heard',     label: 'Heard of them, never tried' },
      { id: 'once',      label: 'Tried once or twice' },
      { id: 'sometimes', label: 'Use them sometimes' },
      { id: 'weekly',    label: 'Use them weekly or daily' },
    ],
  },
  {
    id: 'p3', num: '03', topic: 'Your goal', type: 'text',
    prompt: "What's one thing you'd love AI to help you with?",
    hint: 'One sentence. Shapes what your feed surfaces.',
    placeholder: "I'd love AI to…",
    minChars: 4,
  },
];
