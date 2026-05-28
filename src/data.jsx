// =====================================================================
// Are You AI Ready? — personal AI literacy assessment
// 10 items (0-3 pts each, max 30) mixing single-choice, multi-select,
// open-text, and Likert — modeled on GLAT (arXiv:2411.00283) and
// Long & Magerko's 17 competencies.
//
// Dimensions:
//   usage · tool awareness · prompt fluency (text) · hallucination
//   understanding (text) · verification · safety · factual · judgment
//   · self-awareness · curiosity (text, personalization only)
//
// Open-text items (q3/q4/q10) are scored locally with heuristics;
// swap in `llmJudge()` below to use an LLM rubric. See notes/quiz-research.md.
// =====================================================================

const QUIZ = [
  {
    id: 'q1', num: '01', topic: 'Usage', type: 'single',
    prompt: 'When did you last use an AI chatbot like ChatGPT, Claude, or Gemini?',
    hint: 'No wrong answer — just honest.',
    options: [
      { id: 'never',     label: "I've never heard of them",               pts: 0 },
      { id: 'heard',     label: "Heard of them, never actually tried",    pts: 0 },
      { id: 'once',      label: "Tried once or twice, a while ago",       pts: 1 },
      { id: 'sometimes', label: "I use it sometimes",                     pts: 2 },
      { id: 'weekly',    label: "Weekly or daily — it's a habit",         pts: 3 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
  {
    id: 'q2', num: '02', topic: 'Tool awareness', type: 'multi',
    prompt: 'Which of these are AI chatbots you can have a real text conversation with? Pick all that apply.',
    hint: 'Pick as many as you recognize. Some are famous, some are traps.',
    options: [
      { id: 'chatgpt',    label: 'ChatGPT',    correct: true  },
      { id: 'claude',     label: 'Claude',     correct: true  },
      { id: 'gemini',     label: 'Gemini',     correct: true  },
      { id: 'perplexity', label: 'Perplexity', correct: true  },
      { id: 'alexa',      label: 'Alexa',      correct: false },
      { id: 'grammarly',  label: 'Grammarly',  correct: false },
    ],
    // 4 correct + 2 distractors (Alexa is a voice assistant, Grammarly is a writing aid).
    score: (ans, q) => {
      if (!Array.isArray(ans)) return 0;
      const correctIds = new Set(q.options.filter(o => o.correct).map(o => o.id));
      const picked = new Set(ans);
      const chosenCorrect = [...picked].filter(id => correctIds.has(id)).length;
      const chosenWrong   = [...picked].filter(id => !correctIds.has(id)).length;
      if (chosenWrong >= 2) return 0;
      if (chosenCorrect >= 4 && chosenWrong === 0) return 3;
      if (chosenCorrect >= 3) return 2;
      if (chosenCorrect >= 1 && chosenWrong === 0) return 1;
      return 0;
    },
  },
  {
    id: 'q3', num: '03', topic: 'Prompt fluency', type: 'text',
    prompt: "You want AI to write a cold email to a customer who's 30 days late on payment. Type the actual prompt you'd paste into ChatGPT.",
    hint: 'Not the email. The prompt. How you ask is what we\'re scoring.',
    placeholder: 'You are a...',
    minChars: 15,
    llmScored: true,
    rubric: '0 = empty or gibberish. 1 = basic ask, no context. 2 = clear task + one of {role, format, tone, context}. 3 = clear task + two or more of {role, format, tone, context, constraints}.',
    // Heuristic: look for structure markers (role/tone/length/context/constraints).
    score: (ans) => {
      if (typeof ans !== 'string') return 0;
      const t = ans.trim().toLowerCase();
      if (t.length < 15) return 0;
      const markers = [
        /\b(you are|act as|role|pretend|as (a|an))\b/.test(t),                // role
        /\b(tone|friendly|formal|warm|firm|polite|casual|stern|professional)\b/.test(t), // tone
        /\b(\d+ words?|\d+ sentences?|short|brief|concise|bullet|paragraph)\b/.test(t),  // format
        /\b(context|background|customer|invoice|late|owes|30 days|overdue|reminder)\b/.test(t), // context
        /\b(don't|avoid|no |not |without|but do|must)\b/.test(t),             // constraints
      ].filter(Boolean).length;
      if (t.length > 180 && markers >= 3) return 3;
      if (markers >= 3) return 2;
      if (markers >= 1 || t.length > 60) return 1;
      return 0;
    },
  },
  {
    id: 'q4', num: '04', topic: 'Understanding', type: 'text',
    prompt: 'In your own words — what does it mean when AI "hallucinates"?',
    hint: '1 or 2 sentences. Say what you actually think it means. No Googling.',
    placeholder: "It's when AI…",
    minChars: 10,
    llmScored: true,
    rubric: '0 = blank/wrong (e.g. "AI dreaming"). 1 = vague gesture at "AI being wrong." 2 = correct — AI confidently makes things up. 3 = correct + specific (fake citations/dates/names, or names a consequence).',
    score: (ans) => {
      if (typeof ans !== 'string') return 0;
      const t = ans.trim().toLowerCase();
      if (t.length < 10) return 0;
      const coreHit = /\b(make(s)? up|made up|making up|invent|fabricat|confident|wrong|false|incorrect|lie|lying|lies|not real|fake|doesn'?t exist|untrue|out of thin air)\b/.test(t);
      const specific = [
        /\b(source|citation|cite|reference|quote|book|paper|study|statistic|fact|date|name|case law|url|link)\b/.test(t),
        /\b(sounds?\s+(right|true|real|correct|plausible|believable|confident)|seems?\s+(right|true|confident))\b/.test(t),
      ].filter(Boolean).length;
      if (!coreHit) return 0;
      if (specific >= 2) return 3;
      if (specific >= 1) return 2;
      return 1;
    },
  },
  {
    id: 'q5', num: '05', topic: 'Verification', type: 'single',
    prompt: "ChatGPT gives you a statistic for a work proposal. It sounds right. You're short on time. What do you actually do?",
    hint: 'Honest answer — not the "correct" one.',
    options: [
      { id: 'paste',     label: "Paste it in — if it sounds right it probably is", pts: 0 },
      { id: 'confirm',   label: "Ask ChatGPT: 'are you sure?'",                    pts: 1 },
      { id: 'colleague', label: "Mention the stat to a colleague to sanity-check", pts: 2 },
      { id: 'source',    label: "Google the stat and find the original source",   pts: 3 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
  {
    id: 'q6', num: '06', topic: 'Safety', type: 'multi',
    prompt: 'Which of these is fine to paste into ChatGPT? Pick all the safe ones.',
    hint: 'Safe = OK to send to a big tech company. Unsafe = never.',
    options: [
      { id: 'news',     label: "A news article you're reading",                       correct: true  },
      { id: 'recipe',   label: 'A recipe you want to scale from 4 to 12 servings',     correct: true  },
      { id: 'resume',   label: 'Your own resume draft',                                correct: true  },
      { id: 'customer', label: "A customer's full name, email, and phone number",      correct: false },
      { id: 'revenue',  label: "Your company's unreleased quarterly numbers",           correct: false },
      { id: 'ssn',      label: "Your Social Security number or bank login",            correct: false },
    ],
    // 3 safe + 3 unsafe. Selecting SSN is a hard fail regardless.
    score: (ans, q) => {
      if (!Array.isArray(ans)) return 0;
      if (ans.includes('ssn')) return 0;
      const safeIds = new Set(q.options.filter(o => o.correct).map(o => o.id));
      const chosenSafe   = ans.filter(id => safeIds.has(id)).length;
      const chosenUnsafe = ans.filter(id => !safeIds.has(id)).length;
      if (chosenUnsafe >= 2) return 0;
      if (chosenSafe >= 3 && chosenUnsafe === 0) return 3;
      if (chosenSafe >= 2 && chosenUnsafe <= 1) return 2;
      if (chosenSafe >= 1 && chosenUnsafe === 0) return 1;
      return 0;
    },
  },
  {
    id: 'q7', num: '07', topic: 'Fact check', type: 'single',
    prompt: 'Which of these statements about current AI chatbots is FALSE?',
    hint: 'Only one is wrong. Trust nothing.',
    options: [
      { id: 'madeup',   label: "AI can confidently state facts that sound real but aren't",                        pts: 0 },
      { id: 'math',     label: 'AI is reliable for multi-step math with big numbers (no calculator needed)',        pts: 3 }, // the false one
      { id: 'strength', label: 'Different AI tools (ChatGPT, Claude, Gemini) have different strengths',             pts: 0 },
      { id: 'recent',   label: "AI can't know what happened yesterday unless it searches the web",                   pts: 0 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
  {
    id: 'q8', num: '08', topic: 'Judgment', type: 'single',
    prompt: "You're writing a wedding toast for your sister. What's the best use of AI?",
    hint: 'There is a reasonable answer here.',
    options: [
      { id: 'writeit', label: "Have AI write the whole toast. I'll edit it lightly.",                             pts: 1 },
      { id: 'rules',   label: 'Ask AI the rules of a good toast, then write mine from scratch',                   pts: 2 },
      { id: 'drafts',  label: 'Ask for 3 drafts in different tones. Pick one. Rewrite in my voice.',              pts: 3 },
      { id: 'none',    label: "Don't use AI — a wedding toast has to come from me",                               pts: 1 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
  {
    id: 'q9', num: '09', topic: 'Self-awareness', type: 'likert',
    prompt: "When AI gives you an answer, how confident are you that you'd notice if it was wrong?",
    hint: "Gut-check — we'll calibrate this against your other answers.",
    scale: [
      { id: '1', label: "Not really — I'd probably just believe it", pts: 0 },
      { id: '2', label: "A little — only if it was obviously off",    pts: 1 },
      { id: '3', label: 'Mostly — I catch most things',               pts: 2 },
      { id: '4', label: 'Very — I always verify before I use it',     pts: 3 },
    ],
    score: (ans, q) => (q.scale.find(s => s.id === ans)?.pts) ?? 0,
  },
  {
    id: 'q10', num: '10', topic: 'Curiosity', type: 'text',
    prompt: "Last one — what's one thing you'd love AI to help you with but don't know how?",
    hint: "One sentence. This isn't scored for your level — it shapes what we send you.",
    placeholder: "I'd love AI to…",
    minChars: 4,
    llmScored: true,
    rubric: 'Scored loosely for engagement. 0 = blank. 1 = generic ("anything"). 2 = a specific topic. 3 = a specific topic + a reason or context.',
    score: (ans) => {
      if (typeof ans !== 'string') return 0;
      const t = ans.trim();
      if (t.length < 4) return 0;
      if (/^(anything|everything|idk|not sure|dunno|nothing|no idea)/i.test(t)) return 1;
      if (t.length > 60 && /\b(because|so (i|we|that)|would help|struggle|stuck|don'?t know how|always|every)\b/i.test(t)) return 3;
      if (t.length < 20) return 1;
      return 2;
    },
  },
];

// -----------------------------------------------------------------
// Adaptive variants — replace certain items based on earlier answers.
// Keeps the 10-item structure; only the content of slot 3, 4, or 7
// changes. Variant items use the SAME slot id (q3 / q4 / q7) so the
// answer is stored at the same key regardless of which variant showed.
// -----------------------------------------------------------------
const QUIZ_VARIANTS = {
  // Novice path — if Q1 says they've never really tried AI, asking them
  // to "write a prompt" or "define hallucinations in your own words" is
  // useless. Replace with recognition-style MCQs at the same difficulty.
  q3_novice: {
    id: 'q3', num: '03', topic: 'Prompt fluency', type: 'single', variant: 'novice',
    prompt: 'If you asked AI to help you write an email, which of these would give you the best result?',
    hint: 'Pick the one that would actually get you a usable email.',
    options: [
      { id: 'a', label: '"Write an email."',                                                                               pts: 0 },
      { id: 'b', label: '"Write an email for work."',                                                                      pts: 1 },
      { id: 'c', label: '"Write a short friendly email to my coworker asking if they can review my draft by Friday."',     pts: 2 },
      { id: 'd', label: '"You are a manager. Write a 3-sentence warm email to my coworker Jess asking her to review the Q2 report by Friday. Sign off casually."', pts: 3 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
  q4_novice: {
    id: 'q4', num: '04', topic: 'Understanding', type: 'single', variant: 'novice',
    prompt: 'When we say AI "hallucinates," we mean…',
    hint: 'Pick the closest meaning.',
    options: [
      { id: 'a', label: "The AI is having a breakdown",                                    pts: 0 },
      { id: 'b', label: "The AI tells you something that's wrong",                          pts: 1 },
      { id: 'c', label: "The AI confidently makes up facts or details that aren't real",    pts: 3 },
      { id: 'd', label: "The AI shows you images it imagined",                              pts: 0 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
  // Power path — if Q1 is weekly AND they got all 4 chatbots right on Q2,
  // the "AI is bad at math" question is too obvious. Ask something sharper.
  q7_power: {
    id: 'q7', num: '07', topic: 'Fact check', type: 'single', variant: 'power',
    prompt: "You use ChatGPT, Claude, and Gemini regularly. What's the single biggest thing to keep in mind?",
    hint: 'Only one is right.',
    options: [
      { id: 'same',    label: "They're basically the same — pick whichever has the prettiest UI",                                               pts: 0 },
      { id: 'liveweb', label: "None of them can see today's internet unless they explicitly fire a web-search tool mid-response",                pts: 2 },
      { id: 'blind',   label: "They each have different blind spots — Claude tends to reason better on long docs, GPT on code, Gemini on Google-flavored search. Match the tool to the task.", pts: 3 },
      { id: 'newest',  label: "The newest model is always the best one to use",                                                                  pts: 0 },
    ],
    score: (ans, q) => (q.options.find(o => o.id === ans)?.pts) ?? 0,
  },
};

// Decide which items to show given the answers so far. Safe to call
// with {} — returns the core list. Called on every render in quiz.jsx.
function resolveQuiz(answers) {
  const a = answers || {};
  const q1 = a.q1;
  const q2 = Array.isArray(a.q2) ? a.q2 : [];
  const correctTools = new Set(['chatgpt', 'claude', 'gemini', 'perplexity']);
  const isNovice = q1 === 'never' || q1 === 'heard';
  const hitRate = q2.filter(x => correctTools.has(x)).length;
  const isPower = q1 === 'weekly' && hitRate >= 4 && !q2.some(x => !correctTools.has(x));

  return QUIZ.map(q => {
    if (isNovice && q.id === 'q3') return QUIZ_VARIANTS.q3_novice;
    if (isNovice && q.id === 'q4') return QUIZ_VARIANTS.q4_novice;
    if (isPower  && q.id === 'q7') return QUIZ_VARIANTS.q7_power;
    return q;
  });
}

// -----------------------------------------------------------------
// LLM-as-judge — OpenAI Chat Completions, rubric-scored 0..3.
// Falls back to heuristic score on missing key / network error.
// Key is injected at build time from .env into window.OPENAI_API_KEY.
// Per-item rubrics live on each text item above. Few-shot examples
// anchor the grader so it's not overly conservative.
// -----------------------------------------------------------------
const LLM_EXAMPLES = {
  q3: [
    { answer: 'write an email', score: 0 },
    { answer: 'write an email to a customer who is late on payment', score: 1 },
    { answer: "Write a friendly but firm email to my customer who's 30 days late on payment. Keep it under 100 words.", score: 2 },
    { answer: 'You are a collections specialist. Write a warm but firm email to a customer 30 days overdue on invoice #1234. Offer a payment link. Under 100 words. No legal threats.', score: 3 },
  ],
  q4: [
    { answer: 'when AI stops working', score: 0 },
    { answer: 'when AI is wrong about something', score: 1 },
    { answer: 'when AI makes things up that sound right', score: 2 },
    { answer: 'when AI confidently invents fake citations, dates, or statistics that sound true but are totally made up', score: 3 },
  ],
  q10: [],
};

async function llmJudge(item, answer) {
  const heuristic = item.score ? item.score(answer, item) : 0;

  const key = typeof window !== 'undefined' ? window.OPENAI_API_KEY : null;
  if (!key || !item.rubric || typeof answer !== 'string' || answer.trim().length < (item.minChars || 1)) {
    return heuristic;
  }
  const model = (typeof window !== 'undefined' && window.OPENAI_MODEL) || 'gpt-4o-mini';
  const examples = LLM_EXAMPLES[item.id] || [];

  const sys = 'You are a fair grader for an AI literacy quiz. Reply with a single integer 0, 1, 2, or 3. No other text. Be generous but honest — if an answer meets the rubric for a score, give that score.';
  const userParts = [
    `Question: ${item.prompt}`,
    ``,
    `Rubric: ${item.rubric}`,
  ];
  if (examples.length) {
    userParts.push('', 'Examples:');
    for (const ex of examples) {
      userParts.push(`Answer: """${ex.answer}"""  →  ${ex.score}`);
    }
  }
  userParts.push('', `Now grade this answer: """${answer.trim()}"""`, '', 'Return only the integer score (0-3).');
  const user = userParts.join('\n');

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 4,
        messages: [
          { role: 'system', content: sys },
          { role: 'user',   content: user },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return heuristic;
    const data = await res.json();
    const raw = (data?.choices?.[0]?.message?.content || '').trim();
    const n = parseInt((raw.match(/[0-3]/) || [])[0], 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(3, n)) : heuristic;
  } catch {
    return heuristic;
  }
}

// Async version of scoreAnswers — uses llmJudge for text items, sync score
// for everything else. Parallelizes LLM calls. Populates __scoreCache so
// subsequent sync scoreAnswers(sameAnswers) returns the upgraded score.
async function scoreAnswersAsync(answers) {
  const items = resolveQuiz(answers);
  let total = 0;
  const llmPromises = [];
  for (const q of items) {
    const a = answers?.[q.id];
    if (q.type === 'text' && q.llmScored) {
      llmPromises.push(llmJudge(q, a));
    } else if (typeof q.score === 'function') {
      total += q.score(a, q) || 0;
    }
  }
  const llmScores = await Promise.all(llmPromises);
  for (const s of llmScores) total += s || 0;
  const k = __answersKey(answers);
  if (k) __scoreCache.set(k, total);
  return total;
}

// 10 job options for personalization.
const JOBS = [
  { id: 'retail',    label: 'Retail or service',        icon: '◉', sample: 'Cashier, barista, gas station, server…' },
  { id: 'office',    label: 'Office or admin',          icon: '▣', sample: 'Assistant, ops, coordinator, analyst…' },
  { id: 'smb',       label: 'Small business owner',     icon: '◆', sample: 'Running your own shop, trade, salon…' },
  { id: 'creative',  label: 'Creative or marketing',    icon: '✦', sample: 'Designer, writer, marketer, social…' },
  { id: 'teach',     label: 'Teaching or education',    icon: '✎', sample: 'Teacher, tutor, professor, trainer…' },
  { id: 'health',    label: 'Healthcare',               icon: '✚', sample: 'Nurse, tech, therapist, admin…' },
  { id: 'trades',    label: 'Trades or manual work',    icon: '⚒', sample: 'Construction, plumbing, driver, chef…' },
  { id: 'student',   label: 'Student',                  icon: '◌', sample: 'High school, college, grad school…' },
  { id: 'retired',   label: 'Retired or exploring',     icon: '◍', sample: 'Between things, learning, curious…' },
  { id: 'other',     label: 'Something else',           icon: '○', sample: "We'll ask you to describe it." },
];

// -----------------------------------------------------------------
// Levels — derived from total quiz score (max 30 across 10 items)
// -----------------------------------------------------------------
const LEVELS = {
  newcomer: {
    id: 'newcomer',
    name: 'AI Newcomer',
    glyph: '◐',
    hex: '#2d6a4f',
    tag: 'starting from zero',
    range: [0, 9],
    rank: 1,
    percentile: 'bottom 25%',
    oneLiner: "You haven't really used AI yet — and that's actually fine. The people who got there first are mostly using it wrong. You get to skip their mistakes.",
    vibe: {
      warm: "No shame in starting now. Most people are bluffing anyway.",
      clinical: "Usage minimal. Awareness low. Risk profile: unknown.",
      playful: "Professionally AI-virgin. We'll fix that by Friday.",
    },
    strengths: [
      "No bad habits to unlearn",
      "You're asking the right question (this one)",
      "Every AI tool is easier than it's ever been",
    ],
    gaps: [
      "Haven't tried the main tools yet",
      "No mental model for what AI is good/bad at",
      "No verification habit — AI lies confidently",
    ],
    plan: [
      { d: 1, t: 'Install ChatGPT on your phone (free). Open it. Say hi.', w: '3 min' },
      { d: 2, t: 'Ask it the dumbest question you have. Let it answer.', w: '5 min' },
      { d: 3, t: 'Ask it to explain one thing you already know. See if it\'s right.', w: '5 min' },
      { d: 4, t: 'Learn one safety rule: never paste passwords, social security, or client names.', w: '5 min' },
      { d: 5, t: 'Use it to rewrite one message you\'re putting off.', w: '10 min' },
      { d: 6, t: 'Try one tool that isn\'t ChatGPT (Claude, Gemini, or Perplexity).', w: '10 min' },
      { d: 7, t: 'Pick the one thing you\'ll keep using weekly.', w: '5 min' },
    ],
    safetyRule: "Never paste passwords, social security numbers, or anything you wouldn't read aloud to a stranger. Everything you type is logged somewhere.",
  },
  curious: {
    id: 'curious',
    name: 'AI Curious',
    glyph: '◔',
    hex: '#b45309',
    tag: 'dabbled, no system',
    range: [10, 17],
    rank: 2,
    percentile: 'middle of the pack',
    oneLiner: "You've poked around ChatGPT a few times. Now you want it to actually be useful. The gap between you and an AI power user is 2 habits, not 20.",
    vibe: {
      warm: "You know what AI is. Time to make it earn its keep.",
      clinical: "Inconsistent usage. Low verification. Prompting rudimentary.",
      playful: "Tab-switcher. ChatGPT-curious. Yes you.",
    },
    strengths: [
      "You've felt AI work — once",
      "You're past the fear stage",
      "You know enough to ask better questions",
    ],
    gaps: [
      "No real workflow for your week",
      "You don't check AI output — yet",
      "You ask, you don't prompt",
    ],
    plan: [
      { d: 1, t: 'Pick ONE recurring task in your week AI could help with.', w: '5 min' },
      { d: 2, t: 'Write a prompt with: role + context + what you want back. Save it.', w: '15 min' },
      { d: 3, t: 'Run the same prompt in Claude (or Gemini) — compare.', w: '10 min' },
      { d: 4, t: 'Ask AI to double-check its own answer. Watch it catch itself.', w: '5 min' },
      { d: 5, t: 'Try a specialist: Perplexity for research, Midjourney for images.', w: '15 min' },
      { d: 6, t: 'Teach one friend or coworker the prompt you saved.', w: '10 min' },
      { d: 7, t: 'Decide what\'s worth doing weekly vs. one-off.', w: '5 min' },
    ],
    safetyRule: "Never paste names, account numbers, unreleased revenue, or anything confidential. Not even to 'summarize.' Treat every prompt like a tweet.",
  },
  user: {
    id: 'user',
    name: 'AI User',
    glyph: '◑',
    hex: '#e24a1a',
    tag: 'regular user, some gaps',
    range: [18, 23],
    rank: 3,
    percentile: 'top 20%',
    oneLiner: "You use AI weekly, sometimes daily. You get real leverage from it — but you've still got blind spots around verification, prompt structure, or safer workflows.",
    vibe: {
      warm: "You're ahead of most people you know. Let's fix the last 3 gaps.",
      clinical: "Stable usage. Partial verification. Prompt reuse incomplete.",
      playful: "You ship with AI. Colleagues ask you how. Nice.",
    },
    strengths: [
      "You have at least one workflow that works",
      "You've tried multiple tools",
      "You know the tool has limits — you just forget sometimes",
    ],
    gaps: [
      "You don't always verify — especially when busy",
      "You reinvent prompts you've written before",
      "You haven't built a reusable prompt library",
    ],
    plan: [
      { d: 1, t: 'Audit: what are your 3 most-repeated prompts this month?', w: '10 min' },
      { d: 2, t: 'Turn them into templates (role, context, format, examples).', w: '30 min' },
      { d: 3, t: 'Save them in one place (Notes, Notion, doc).', w: '5 min' },
      { d: 4, t: 'Add a verification step to the highest-stakes one.', w: '10 min' },
      { d: 5, t: 'Try one advanced tool: Claude Projects, ChatGPT Custom GPTs.', w: '20 min' },
      { d: 6, t: 'Track: how much time did AI save you this week? Honestly.', w: '10 min' },
      { d: 7, t: 'Pick one habit to keep. Drop one that wasn\'t worth it.', w: '10 min' },
    ],
    safetyRule: "Your risk isn't getting wrong answers — it's shipping confident-sounding wrong answers. Red-team your own output before sending.",
  },
  ready: {
    id: 'ready',
    name: 'AI Ready',
    glyph: '●',
    hex: '#14110d',
    tag: 'fluent, verified, safe',
    range: [24, 30],
    rank: 4,
    percentile: 'top 5%',
    oneLiner: "You're already doing what most people won't for another year. Your edge now is depth — chaining tools, building evaluations, and teaching others without sounding smug.",
    vibe: {
      warm: "You've built the habit. Let's get surgical.",
      clinical: "Usage high. Verification routine. Prompt library established.",
      playful: "You're the AI person at work. Use the power responsibly.",
    },
    strengths: [
      "You know what AI is bad at",
      "You verify reflexively",
      "You build workflows, not one-offs",
    ],
    gaps: [
      "You may be reinventing your own tools",
      "You haven't formalized your evaluations",
      "You haven't taught your team / friends yet",
    ],
    plan: [
      { d: 1, t: 'Map your top 5 AI workflows in one doc.', w: '15 min' },
      { d: 2, t: 'Pick one — rewrite as a chained multi-step prompt.', w: '30 min' },
      { d: 3, t: 'Build a 10-example eval set with expected outputs.', w: '30 min' },
      { d: 4, t: 'Compare two models head-to-head on the eval.', w: '20 min' },
      { d: 5, t: 'Automate one step with Zapier, Make, or a script.', w: '45 min' },
      { d: 6, t: 'Write one Loom/doc explaining your workflow to someone.', w: '15 min' },
      { d: 7, t: 'Ship it. Measure the actual lift.', w: '10 min' },
    ],
    safetyRule: "At your level, the risk isn't you — it's what you ship to people who trust you. Never auto-send AI output externally without a human review loop.",
  },
};

function levelFor(score) {
  for (const k of Object.keys(LEVELS)) {
    const [lo, hi] = LEVELS[k].range;
    if (score >= lo && score <= hi) return LEVELS[k];
  }
  return LEVELS.curious;
}

// Shared cache so once an async LLM score is computed, all downstream
// screens (result, workplace, email, newsletter) pick it up transparently
// through the same synchronous scoreAnswers() call.
const __scoreCache = new Map();
function __answersKey(a) { try { return JSON.stringify(a); } catch { return ''; } }

function scoreAnswers(answers) {
  const k = __answersKey(answers);
  if (k && __scoreCache.has(k)) return __scoreCache.get(k);
  const items = resolveQuiz(answers);
  let total = 0;
  for (const q of items) {
    const a = answers?.[q.id];
    if (typeof q.score === 'function') {
      total += q.score(a, q) || 0;
    }
  }
  return total;
}

// Calibration flag — "confident but objectively weak" is the most common
// AI-literacy failure mode. If the Likert self-rating says "mostly/very
// confident I'd catch a wrong answer" but the user bombed the verification
// + fact-check + safety items, flag it.
function overconfidenceFlag(answers) {
  const q9 = QUIZ.find(q => q.id === 'q9');
  const q9Score = q9 ? (q9.score(answers?.q9, q9) || 0) : 0;
  const objIds = ['q5', 'q6', 'q7'];
  const objScore = objIds.reduce((sum, id) => {
    const q = QUIZ.find(qq => qq.id === id);
    return sum + (q && typeof q.score === 'function' ? (q.score(answers?.[id], q) || 0) : 0);
  }, 0);
  return q9Score >= 2 && objScore < 4;
}

// Pull the curiosity text for result/newsletter personalization.
function extractCuriosity(answers) {
  const t = (answers?.q10 || '').trim();
  return t.length >= 4 ? t : null;
}

// =====================================================================
// Per-job content — 5 custom prompts + one "first win" + safety nuance.
// These get stitched into the level-specific result to feel bespoke.
// =====================================================================
const JOB_PACKS = {
  retail: {
    display: 'retail & service work',
    firstWinTitle: 'Write a customer reply in 30 seconds',
    firstWin: 'A customer complained. Paste their message and say:\n\n"Draft a short, warm reply. Acknowledge the issue, offer a fix, no corporate jargon. Under 80 words."',
    prompts: [
      { title: 'Defuse an angry customer',      prompt: 'Here\'s a complaint: "<paste>". Write a reply that acknowledges their frustration, offers one concrete fix, and doesn\'t sound corporate. Under 60 words.' },
      { title: 'Shift schedule swap message',    prompt: 'Draft a friendly text to my manager asking to swap my Saturday shift with Tuesday. Apologetic but not grovelling. 2 sentences.' },
      { title: 'Make a promo blurb',             prompt: 'We have 15% off [product] this weekend. Write 3 short versions: one for the register sign, one for the store Instagram, one for a group text.' },
      { title: 'End-of-shift handoff note',      prompt: 'I worked 2pm-10pm. Things to hand off: [list]. Write a clear, short handoff note for the next person. Bullets only.' },
      { title: 'Ask for a raise, politely',      prompt: 'I\'ve been at [place] for [months]. Here\'s what I\'ve done: [bullets]. Draft a respectful message asking to discuss my pay.' },
    ],
    safetyAdd: 'Never paste customer credit card numbers, home addresses, or ID photos — even to "summarize" them.',
  },
  office: {
    display: 'office & admin work',
    firstWinTitle: 'Turn a messy email thread into decisions',
    firstWin: 'Paste a long email thread and say:\n\n"Summarize in 3 sections: Decisions made, Action items with owners, Still-open questions. Be concrete. Flag anything unclear."',
    prompts: [
      { title: 'Summarize a meeting',            prompt: 'Here are my rough notes: "<paste>". Give me: decisions, action items (with owners), and open questions. Bullets only.' },
      { title: 'Rewrite a long email short',     prompt: 'Here\'s an email I need to send: "<paste>". Cut 40% without losing the key ask. Keep the tone professional but warm.' },
      { title: 'Draft a declining email',        prompt: 'Help me politely decline [thing] without burning the relationship. I still want to leave the door open. Under 5 sentences.' },
      { title: 'Turn a spreadsheet into a summary', prompt: 'Here\'s some data: "<paste rows>". Write 3 bullets that explain the pattern to someone who can\'t read spreadsheets. No jargon.' },
      { title: 'Prep for a 1:1',                 prompt: 'I have a 1:1 tomorrow with [role]. Give me 5 good questions to ask — not generic, specific to [goal]. Make me sound prepared.' },
    ],
    safetyAdd: 'Never paste customer names, internal financials, or anything marked confidential. Swap names for "Person A", "Company X" before pasting.',
  },
  smb: {
    display: 'running a small business',
    firstWinTitle: 'A week of social posts in 5 minutes',
    firstWin: 'Say:\n\n"I run [type of business] in [city]. Write 5 short Instagram captions for this week — different themes (behind-the-scenes, customer win, offer, FAQ, team). Each under 40 words, warm tone."',
    prompts: [
      { title: 'Write a week of social posts',    prompt: 'I run [business]. Write 5 Instagram captions for this week: behind-the-scenes, customer win, offer, FAQ, team moment. Under 40 words each.' },
      { title: 'Price a custom job',             prompt: 'A customer asked for [thing]. Walk me through a fair quote: time, materials, markup, minimum. Explain so I sound confident on the phone.' },
      { title: 'Hire without an HR team',        prompt: 'Draft a simple job post for [role] at a small business. No corporate fluff. Make it sound like a real person. 150 words max.' },
      { title: 'Respond to a Google review',      prompt: 'Someone left this review: "<paste>". Write a reply that\'s classy, acknowledges them, and makes future customers trust us more.' },
      { title: 'Simple monthly check-in',         prompt: 'Help me write a 5-question monthly check-in I can send to my top customers. Conversational, not a survey. Make replies easy.' },
    ],
    safetyAdd: 'Treat customer lists, revenue numbers, and supplier pricing as private. Describe, don\'t paste.',
  },
  creative: {
    display: 'creative & marketing work',
    firstWinTitle: 'Get unstuck on a brief in 3 minutes',
    firstWin: 'Say:\n\n"I\'m working on [project] for [audience]. The goal is [outcome]. Give me 10 concept directions — each one sentence, wildly different from each other. No safe bets."',
    prompts: [
      { title: 'Unstick a concept',              prompt: 'I\'m making [thing] for [audience]. Give me 10 concept directions — each one sentence, wildly different. No safe bets.' },
      { title: 'Rewrite copy three ways',        prompt: 'Here\'s a headline: "<paste>". Write 5 alternatives: one punchy, one emotional, one data-led, one playful, one contrarian.' },
      { title: 'Extract a brand voice',          prompt: 'Here are 3 samples of my writing: "<paste>". Describe my voice in 5 words. Then write a new sentence in that voice about [topic].' },
      { title: 'Critique my draft harshly',      prompt: 'Here\'s my draft: "<paste>". Give me the 3 most honest pieces of feedback. Skip the praise. What would a senior critic say?' },
      { title: 'Moodboard-in-words',             prompt: 'I want a vibe that\'s [2-3 references]. Describe it in 5 bullets: color, texture, pacing, typography, what to avoid. No images, just words.' },
    ],
    safetyAdd: 'Watch IP: don\'t paste unreleased client work or NDAs. And check generated content for "style theft" of named artists.',
  },
  teach: {
    display: 'teaching & education work',
    firstWinTitle: 'A lesson plan you can actually use',
    firstWin: 'Say:\n\n"I teach [subject] to [grade/level]. Plan one 45-minute lesson on [topic]: warm-up (5min), main activity (25min), check for understanding (10min), closer (5min). Include 3 questions to spot kids who didn\'t get it."',
    prompts: [
      { title: 'Plan a 45-min lesson',            prompt: 'Plan a 45-min lesson on [topic] for [grade]. Sections: warm-up, main activity, check-for-understanding, closer. Include 3 diagnostic questions.' },
      { title: 'Rewrite a reading for level',    prompt: 'Rewrite this passage for [grade level] so the ideas stay but the language fits: "<paste>". Keep the original word count within 20%.' },
      { title: 'Differentiate for 3 students',    prompt: 'I have a student who [strength] and one who [struggle]. Adapt this activity: "<paste>" into 3 tiers so all 3 can succeed.' },
      { title: 'Write a parent message',          prompt: 'Parent concerned about [thing]. Draft a reply that\'s warm, specific, and offers a next step. Professional but human. Under 150 words.' },
      { title: 'Quiz that tests understanding',   prompt: 'Generate 5 questions on [topic] that test understanding, not memorization. Include 1 common wrong answer each to check misconceptions.' },
    ],
    safetyAdd: 'Never paste student names, grades, or identifying info. Use "Student A" and describe the situation abstractly.',
  },
  health: {
    display: 'healthcare work',
    firstWinTitle: 'Explain something to a patient, plainly',
    firstWin: 'Say:\n\n"I need to explain [condition or procedure] to a patient who has no medical background. 6th-grade reading level. Warm, not condescending. Include: what it is, what they can expect, 2 things they can do. Under 150 words."',
    prompts: [
      { title: 'Plain-language explanation',      prompt: 'Explain [medical thing] to a patient. 6th-grade reading level. Warm, not condescending. Include 2 concrete things they can do. Under 150 words.' },
      { title: 'Summarize a shift handoff',       prompt: 'Here are my rough notes: "<paste>". Turn into a clean SBAR handoff: Situation, Background, Assessment, Recommendation. Bullets.' },
      { title: 'Drafted patient-education',       prompt: 'I need a 1-page handout on [topic] for patients going home. Bullet points, big headings, what to do, when to call.' },
      { title: 'Practice a hard conversation',    prompt: 'I need to tell a patient [hard news]. Role-play with me — you\'re the patient. Make me practice the first 60 seconds.' },
      { title: 'Cite-first clinical question',    prompt: 'I\'m trying to recall best practice for [question]. Give me the standard answer, then say which guideline it\'s from. If unsure — say so.' },
    ],
    safetyAdd: 'HIPAA: never paste patient names, DOBs, MRNs, or specific identifiers. Paraphrase and de-identify. AI is not a clinical decision-maker — verify against guidelines.',
  },
  trades: {
    display: 'trades & manual work',
    firstWinTitle: 'Estimate a job out loud',
    firstWin: 'Say:\n\n"Walk me through pricing a [job type] for a [size] space. Labor, materials, markup, minimum. Give me the talk-track so I sound confident quoting it on the phone."',
    prompts: [
      { title: 'Quote a job confidently',         prompt: 'Walk me through quoting a [job type] at [size]: labor hours, materials, markup, minimum. Give me the talk-track for the phone call.' },
      { title: 'Explain a problem to a customer', prompt: 'I need to tell a customer that [unexpected thing] was found on their job. Plain language, 3 options, what I recommend. No scary jargon.' },
      { title: 'Simple contract terms',           prompt: 'Write simple plain-English terms for a [job type] contract: scope, timeline, deposit, change-orders, what happens if. No legalese.' },
      { title: 'Invoice follow-up',               prompt: 'Customer is 2 weeks late paying. Draft a friendly, firm follow-up. Not awkward. Makes it easy for them to pay today.' },
      { title: 'Training a new helper',           prompt: 'Write a 1-page \'first day\' for someone starting as my helper on [trade]. Safety rules, tools they need, how to ask questions.' },
    ],
    safetyAdd: 'Keep customer addresses and contact info off AI. Use "my customer" or "the site". AI estimates are a starting point — your experience is the decider.',
  },
  student: {
    display: 'being a student',
    firstWinTitle: 'Turn a confusing topic into 3 bullets',
    firstWin: 'Say:\n\n"Explain [topic I\'m stuck on] to me like I\'m 14. 3 bullets, each one sentence. Then give me one question that would actually test if I understood it."',
    prompts: [
      { title: 'Explain like I\'m 14',            prompt: 'Explain [topic] like I\'m 14. 3 bullets max, then one question that tests if I actually get it.' },
      { title: 'Study plan for a test',           prompt: 'I have a test on [subject] in [days]. I know [X], shaky on [Y], lost on [Z]. Plan my study with 30-min blocks. Include review and sleep.' },
      { title: 'Outline an essay',                prompt: 'I need to write an essay on [topic]. Give me 3 possible thesis statements, then a 5-paragraph outline for the strongest one.' },
      { title: 'Check my work',                   prompt: 'Here\'s my draft: "<paste>". Find my weakest argument and tell me how to strengthen it. Don\'t rewrite — just coach me.' },
      { title: 'Professional email to a professor', prompt: 'Help me write a respectful email to my [subject] professor asking [thing]. I\'m nervous. Keep it short, polite, and specific.' },
    ],
    safetyAdd: 'Don\'t paste full assignments and submit AI output as your own — schools check for this. Use AI to learn, not to replace the work.',
  },
  retired: {
    display: 'exploring life after work',
    firstWinTitle: 'Ask AI anything you\'ve always wondered',
    firstWin: 'Say:\n\n"I\'ve always been curious about [topic]. Explain it to me like a smart, patient friend. Start simple, then go deeper if I ask. No jargon unless you explain it."',
    prompts: [
      { title: 'Curiosity without jargon',       prompt: 'Explain [topic I\'ve always wondered about] like a smart patient friend. Start simple. Willing to go deeper if I ask.' },
      { title: 'Plan a trip from scratch',        prompt: 'I want to visit [place] for [days]. I care about [interests], avoid [things]. Give me a day-by-day plan with easy pacing.' },
      { title: 'Write a family message',          prompt: 'I want to write [a letter / toast / note] to [person] for [occasion]. Help me say what I mean, warmly, without clichés.' },
      { title: 'Learn a new skill in steps',     prompt: 'I want to learn [skill]. Give me a beginner 4-week plan. 20 min a day. No overwhelm. What to do today.' },
      { title: 'Health question, carefully',     prompt: 'I have [non-urgent question]. Explain what it could be and when to actually see a doctor. Be clear — you\'re not a doctor.' },
    ],
    safetyAdd: 'For health, money, or legal questions — AI is a starting point, never the final word. Always check with a real person you trust.',
  },
  other: {
    display: 'whatever you do',
    firstWinTitle: 'Make one thing easier tomorrow',
    firstWin: 'Say:\n\n"Tomorrow I need to [task]. Help me think through the steps, the shortcuts, and one thing I might be overlooking. Keep it under 10 bullets."',
    prompts: [
      { title: 'Plan tomorrow',                  prompt: 'Tomorrow I need to [task]. Steps, shortcuts, one thing I might miss. Under 10 bullets.' },
      { title: 'Unstick a stuck thing',          prompt: 'I\'m stuck on [problem]. Ask me 5 clarifying questions one at a time. When you have enough, give me 3 options.' },
      { title: 'Rewrite my message',             prompt: 'Here\'s what I wrote: "<paste>". Keep the meaning. Make it 30% shorter. Warmer. No filler.' },
      { title: 'Learn about a thing',            prompt: 'Explain [topic] in 3 layers: one-line, paragraph, and deep. I\'ll stop you when I\'ve got it.' },
      { title: 'Decide between two options',      prompt: 'I\'m choosing between [A] and [B]. Ask me 3 questions. Then give me the honest pros/cons and your best guess.' },
    ],
    safetyAdd: 'Whatever you do, don\'t paste personal data — SSN, bank info, medical records, passwords. Swap real names and numbers for placeholders.',
  },
};

// -----------------------------------------------------------------
// Landing page headline variants (for A/B if you swap them in tweaks)
// -----------------------------------------------------------------
const HEADLINES = [
  {
    id: 'race',
    pre: '90-second AI literacy diagnostic',
    main: 'Are you AI ready?',
    sub: 'Not "is your job AI-ready." You. The person. How fluent are you with the tools everyone is suddenly using?',
  },
  {
    id: 'behind',
    pre: 'Feel a step behind?',
    main: "You're probably more AI literate than you think. Or less.",
    sub: "8 honest questions. Find out where you land among AI Newcomers, Curious, Users, and Ready.",
  },
  {
    id: 'level',
    pre: 'Everyone else is bluffing.',
    main: "What's your real AI literacy level?",
    sub: 'Do you actually use ChatGPT? Know what hallucinations are? Heard of Claude? Find out in under 2 minutes.',
  },
];

Object.assign(window, {
  QUIZ, QUIZ_VARIANTS, JOBS, LEVELS, JOB_PACKS, HEADLINES,
  scoreAnswers, scoreAnswersAsync, levelFor, overconfidenceFlag, extractCuriosity, llmJudge, resolveQuiz,
});
