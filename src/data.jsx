// =====================================================================
// Are You AI Ready? — personal AI literacy assessment
// UPGRADED: Performance-based adaptive question bank
// 75 questions across 5 tools × 3 difficulty tiers × 5 categories
// Adaptive engine: correct → harder next question on same tool
//                  wrong  → easier next question on same tool
// Answer options shuffled at render time — correct answer never in
// same position twice.
//
// Modeled on GLAT (arXiv:2411.00283) and Long & Magerko's 17 competencies.
// LLM-as-judge scoring preserved for open-text items.
// =====================================================================

// -----------------------------------------------------------------
// TOOL DEFINITIONS
// -----------------------------------------------------------------
const TOOLS = [
  { id: 'chatgpt',    name: 'ChatGPT',    topic: 'ChatGPT'    },
  { id: 'claude',     name: 'Claude',     topic: 'Claude'     },
  { id: 'gemini',     name: 'Gemini',     topic: 'Gemini'     },
  { id: 'copilot',    name: 'Copilot',    topic: 'Copilot'    },
  { id: 'perplexity', name: 'Perplexity', topic: 'Perplexity' },
];

// -----------------------------------------------------------------
// QUESTION BANK — 5 tools × 3 tiers × 3 questions = 45 core MCQs
// Each question: { q, o (options array), a (correct index), e (explanation) }
// Options are shuffled at render time via shuffleOptions()
// -----------------------------------------------------------------
const QUESTION_BANK = {
  chatgpt: {
    easy: [
      {
        q: 'ChatGPT is made by which company?',
        o: ['Google', 'OpenAI', 'Microsoft', 'Apple'],
        a: 1,
        e: 'ChatGPT is built by OpenAI. Microsoft is a major investor but not the creator.',
      },
      {
        q: 'What type of AI is ChatGPT primarily?',
        o: ['Image generator', 'Large language model', 'Search engine', 'Voice assistant'],
        a: 1,
        e: 'ChatGPT is a large language model (LLM) — it generates text by predicting likely next words based on patterns learned from training data.',
      },
      {
        q: 'Which of these can ChatGPT do well right now?',
        o: ['Make phone calls for you', 'Book appointments', 'Draft and summarise text', 'Edit your photos'],
        a: 2,
        e: "ChatGPT's core strength is language — writing, editing, summarising, brainstorming. It can't interact with external systems or real-time data by default.",
      },
    ],
    medium: [
      {
        q: 'ChatGPT "hallucinates." In plain terms, this means it:',
        o: ['Crashes unexpectedly', 'Generates confident but false information', 'Refuses to answer', 'Runs slowly on older devices'],
        a: 1,
        e: 'Hallucination means the model produces plausible-sounding but incorrect facts — it predicts likely words, not verified truth.',
      },
      {
        q: 'Which task is ChatGPT LEAST reliable for?',
        o: ["Drafting a professional email", 'Summarising a long document', "Giving today's live stock price", 'Brainstorming creative ideas'],
        a: 2,
        e: "ChatGPT has a training cutoff and no live data by default — it cannot reliably give you current stock prices or today's news.",
      },
      {
        q: 'What is a "system prompt" in ChatGPT?',
        o: ['A technical error message', 'Hidden instructions that shape how the AI behaves', 'The first message you type', 'A pre-built email template'],
        a: 1,
        e: "A system prompt is a behind-the-scenes instruction set that defines the AI's persona, rules and behaviour — invisible to users but powerful.",
      },
    ],
    hard: [
      {
        q: 'GPT-4o\'s "o" means "omni." What does this change about the model?',
        o: ['It is open-source', 'It processes text, audio and images natively in a single model', 'It gives free unlimited access', 'It only answers in one language'],
        a: 1,
        e: 'GPT-4o is a unified model handling text, audio and images together — rather than routing through separate specialist models for each modality.',
      },
      {
        q: 'What does "temperature" control in the GPT API?',
        o: ['Server response speed', 'Number of tokens generated', 'Randomness of output — higher = more creative, lower = more predictable', 'Which model version is used'],
        a: 2,
        e: 'Temperature (0–2) controls sampling randomness. Low values give deterministic, factual output. High values give creative, variable output.',
      },
      {
        q: 'Why can the same GPT-4 prompt return different answers each time?',
        o: ['The model learns between sessions', 'It forgets context between requests', 'Different servers handle each request differently', 'Temperature causes probabilistic token sampling'],
        a: 3,
        e: 'With temperature above 0, token selection is random each time. The model samples from probable next tokens, so results vary even on the same input.',
      },
    ],
  },

  claude: {
    easy: [
      {
        q: 'Claude is built by which company?',
        o: ['OpenAI', 'Google', 'Anthropic', 'Meta'],
        a: 2,
        e: "Claude is Anthropic's AI assistant. Anthropic was founded in 2021 by former OpenAI researchers with AI safety as a core mission.",
      },
      {
        q: 'What is Anthropic, the company behind Claude, primarily focused on?',
        o: ['Social media AI', 'Gaming and entertainment AI', 'AI safety and building reliable, interpretable AI', 'Making the fastest AI available'],
        a: 2,
        e: 'Anthropic was built around AI safety — studying how to make AI systems reliable, honest and steerable, not just powerful.',
      },
      {
        q: 'What is Claude generally considered better than most AI at?',
        o: ['Generating photorealistic images', 'Real-time web search', 'Following long, complex instructions carefully', 'Translating spoken audio live'],
        a: 2,
        e: 'Claude is widely praised for nuanced instruction-following, handling very long documents and being less prone to fabricating information.',
      },
    ],
    medium: [
      {
        q: 'What is a "context window" and why does Claude\'s matter?',
        o: ['A settings panel in the app', 'How fast Claude processes text', 'How many users can use Claude at once', "How much text Claude can read and remember in one session — Claude's is very large"],
        a: 3,
        e: "Context window is working memory. Claude's is large enough to hold entire books — enabling deep analysis of long contracts, codebases or reports.",
      },
      {
        q: 'Claude\'s "Constitutional AI" training is designed to make Claude:',
        o: ['Faster at generating responses', 'Cheaper to run', 'More consistently safe, helpful and honest', 'Funnier and more conversational'],
        a: 2,
        e: "Constitutional AI is Anthropic's method of training using a written set of principles — producing more reliably helpful, harmless and honest responses.",
      },
      {
        q: "Which task plays most to Claude's specific strengths?",
        o: ['Generating a realistic portrait', "Predicting next week's weather", 'Live translation of spoken audio', 'Reading a 60-page legal contract and answering detailed questions about it'],
        a: 3,
        e: "Claude's large context window and careful reasoning make it exceptional at deep document analysis — legal, financial and technical documents.",
      },
    ],
    hard: [
      {
        q: 'What is "prompt injection" and why should Claude users know about it?',
        o: ['A way to save prompts for reuse', 'A speed optimisation method', 'A technique to compress long prompts', "A malicious attack where hidden text in content hijacks the AI's instructions"],
        a: 3,
        e: "Prompt injection hides instructions inside documents or web content to override the AI's intended behaviour — a real risk when processing untrusted external inputs.",
      },
      {
        q: "Claude's published model card communicates what?",
        o: ['The engineering team behind Claude', "Claude's server architecture", "Claude's pricing tiers", "Claude's capabilities, limitations, safety evaluations and intended use cases"],
        a: 3,
        e: "Model cards are AI transparency documents disclosing what a model can do, where it fails, how it was evaluated and what it's designed for.",
      },
      {
        q: 'Why might Claude refuse a request that another AI would complete?',
        o: ['Claude is technically less capable', 'Claude has a smaller context window', 'Claude requires a paid subscription for advanced tasks', "Anthropic's safety training is more conservative on certain content categories"],
        a: 3,
        e: "Different companies set different safety thresholds. Anthropic's Constitutional AI approach is deliberately more cautious in specific areas — a design choice, not a capability gap.",
      },
    ],
  },

  gemini: {
    easy: [
      {
        q: 'Gemini is built into which suite of tools?',
        o: ['Microsoft Office', 'Apple iWork', 'Notion and Slack', 'Google Workspace — Gmail, Docs, Sheets and more'],
        a: 3,
        e: 'Gemini is embedded across Google Workspace — available as a sidebar assistant in Gmail, Docs, Sheets and Slides.',
      },
      {
        q: 'What does "multimodal" mean when describing Gemini?',
        o: ['It works across many countries', 'It answers multiple questions at once', 'It runs on multiple devices simultaneously', 'It can understand text, images, audio and video — not just words'],
        a: 3,
        e: 'Multimodal means the model handles multiple input types. You can show Gemini a photo and ask questions about it alongside text.',
      },
      {
        q: 'Gemini Ultra vs Gemini Nano — main difference?',
        o: ['Ultra is free, Nano costs money', 'Ultra works offline, Nano needs internet', 'Ultra handles images, Nano handles text', "Ultra is Google's most powerful cloud model, Nano runs on-device on mobile"],
        a: 3,
        e: "Google offers Gemini at different sizes. Ultra is the flagship powerful version; Nano is lightweight and runs directly on Android devices offline.",
      },
    ],
    medium: [
      {
        q: 'What is "Gemini grounding" in Google Workspace?',
        o: ['A safety filter for harmful content', 'A way to reset Gemini to defaults', 'A feature for offline use', "Connecting Gemini to your organisation's actual files and emails for contextually relevant answers"],
        a: 3,
        e: "Grounding means Gemini accesses your real Drive documents, emails and Calendar to give specific, contextual answers rather than generic ones.",
      },
      {
        q: "You ask Gemini in Gmail to summarise your inbox. What's a key risk?",
        o: ['It permanently deletes emails', 'It changes your email formatting', 'It auto-replies to emails', 'It surfaces sensitive or private emails you may have forgotten about'],
        a: 3,
        e: 'When AI reads your full inbox it surfaces everything — including old sensitive messages. Always review AI summaries and be aware of what access you have granted.',
      },
      {
        q: "Gemini's image generation uses which underlying model?",
        o: ['DALL-E', 'Stable Diffusion', 'Adobe Firefly', "Imagen — Google's own text-to-image model"],
        a: 3,
        e: "Google's image generation is powered by Imagen, their proprietary model integrated into Gemini and Google Workspace products.",
      },
    ],
    hard: [
      {
        q: "Google's AI Overviews in Search faced criticism in 2024 because:",
        o: ['It was too slow to load', 'It cost users money', 'It blocked normal search results', 'Early versions produced dangerously wrong answers including harmful health advice'],
        a: 3,
        e: 'AI Overviews generated embarrassing errors — advising eating rocks for minerals — raising serious questions about deploying AI in high-stakes positions.',
      },
      {
        q: 'Like all modern LLMs, Gemini is built on which architecture?',
        o: ['Recurrent Neural Networks', 'Convolutional Neural Networks', 'BERT bidirectional encoders', 'Transformer architecture — introduced in "Attention Is All You Need" (2017)'],
        a: 3,
        e: "The Transformer architecture, introduced in 2017, underlies virtually all modern large language models including Gemini, GPT and Claude.",
      },
      {
        q: "What is Google's NotebookLM and what makes it distinct?",
        o: ["Google's AI code editor", 'A Gemini plugin that browses the web', "Google's alternative to Teams", 'A Gemini-powered tool where you upload your own documents and chat with that specific content'],
        a: 3,
        e: "NotebookLM lets you upload your own sources and Gemini becomes an expert on your specific content — not its general training data.",
      },
    ],
  },

  copilot: {
    easy: [
      {
        q: 'Microsoft Copilot is powered by which AI model underneath?',
        o: ['Google Gemini', 'Anthropic Claude', 'Meta LLaMA', 'OpenAI GPT-4'],
        a: 3,
        e: "Copilot runs on OpenAI's GPT-4 — the result of Microsoft's multi-billion dollar investment and partnership with OpenAI.",
      },
      {
        q: 'Where can you find Microsoft Copilot?',
        o: ["Only on Microsoft's website", 'Only in Microsoft Word', 'Only on Windows 11 laptops', 'Across Windows, Office apps, Edge browser and Teams'],
        a: 3,
        e: "Copilot is embedded across Microsoft's entire ecosystem — Windows 11, Word, Excel, PowerPoint, Outlook, Teams, Edge and Bing.",
      },
      {
        q: 'What can Copilot in Word help you do?',
        o: ['Send the document by email automatically', 'Run macros and scripts', 'Generate images inside the document', 'Draft, summarise and rewrite text'],
        a: 3,
        e: 'Copilot in Word helps you create first drafts, summarise long documents, rewrite sections in different tones and extract key points.',
      },
    ],
    medium: [
      {
        q: 'How is Microsoft 365 Copilot different from the free Copilot?',
        o: ['It is faster with no usage limits', 'It generates higher-quality images', 'It works without internet', "It has access to your organisation's Microsoft 365 data — emails, meetings and files"],
        a: 3,
        e: "Microsoft 365 Copilot is the enterprise version grounded in your Teams meetings, Outlook emails, SharePoint files and more.",
      },
      {
        q: 'Copilot in Teams can do which of the following?',
        o: ['Live-translate audio into 40 languages', 'Change your video background automatically', 'Make follow-up calls on your behalf', 'Summarise meetings and suggest action items in real time'],
        a: 3,
        e: 'Copilot in Teams transcribes and summarises meetings as they happen, identifies action items and lets late joiners ask what they missed.',
      },
      {
        q: 'What is a key governance concern with enterprise Copilot?',
        o: ["Copilot stores data outside your country", 'It charges per query per employee', 'It only works in English', "AI may surface confidential files employees can access but didn't know existed"],
        a: 3,
        e: "Because Copilot searches your full Microsoft 365 estate, it can expose documents employees technically have access to but didn't know existed.",
      },
    ],
    hard: [
      {
        q: 'What is Copilot Studio designed for?',
        o: ['Designing slides with AI', 'Editing video with AI', 'Writing code in Azure DevOps', "Building custom AI agents and chatbots on top of Copilot's platform"],
        a: 3,
        e: "Copilot Studio is Microsoft's low-code platform for creating bespoke AI agents for specific organisational workflows and data sources.",
      },
      {
        q: 'Why did many organisations pause Copilot rollouts after deployment?',
        o: ['The interface was too complex', 'It performed poorly on non-English content', 'The per-seat cost exceeded budget', "Poor Microsoft 365 permissions meant Copilot surfaced content users shouldn't see"],
        a: 3,
        e: "Many enterprises paused after discovering their Microsoft 365 permissions were poorly managed — Copilot faithfully surfaces everything a user has access to.",
      },
      {
        q: 'What is the "semantic index" in Microsoft 365 Copilot?',
        o: ['A list of all email subjects', 'A set of approved prompt templates', 'A ranked list of most-used documents', "A vector embedding of your org's content enabling retrieval by meaning, not just keyword"],
        a: 3,
        e: "The semantic index converts your organisation's content into vector embeddings — allowing Copilot to find relevant information by conceptual meaning rather than exact keyword matches.",
      },
    ],
  },

  perplexity: {
    easy: [
      {
        q: 'What fundamentally separates Perplexity from ChatGPT?',
        o: ['It generates images alongside text', 'It only answers technology questions', 'It is only available on mobile', 'It searches the live web and cites its sources with every answer'],
        a: 3,
        e: "Perplexity is an AI search engine — it retrieves live web results and shows citations. ChatGPT by default works from training data with a fixed cutoff date.",
      },
      {
        q: 'Perplexity shows citations after answers. What should you do with them?',
        o: ['Skip them — citations prove correctness', 'Assume they are always academic sources', 'Ignore them — citations are decorative', 'Click through to check the original sources, especially on important topics'],
        a: 3,
        e: 'Citations make verification easier but Perplexity can still misquote or misrepresent sources. Always check the original when the answer matters.',
      },
      {
        q: 'What is a knowledge cutoff, and how does Perplexity address it?',
        o: ['When AI gets too slow — Perplexity uses faster servers', 'When AI runs out of memory — Perplexity has more RAM', 'When AI refuses a question — Perplexity is more permissive', "When training data ends at a fixed date — Perplexity searches the live web for current information"],
        a: 3,
        e: "All LLMs have a training cutoff — a date after which they have no data. Perplexity sidesteps this by searching the web in real time.",
      },
    ],
    medium: [
      {
        q: 'What is RAG and how does Perplexity use it?',
        o: ['Rapid Answer Generation — explains its speed', 'Random Answer Generation — explains variability', 'Robust AI Grounding — a safety framework', 'Retrieval-Augmented Generation — retrieves real web documents then uses AI to synthesise an answer'],
        a: 3,
        e: 'RAG retrieves relevant real documents first, then feeds them to a language model to generate a grounded answer — combining search and generation.',
      },
      {
        q: 'Perplexity Pro Search differs from standard because it:',
        o: ['Shows more advertising', 'Only searches academic journals', 'Generates images alongside answers', 'Runs multiple iterative searches and synthesises a deeper, more comprehensive answer'],
        a: 3,
        e: 'Pro Search runs several searches in sequence, reasons about combined results and builds a more comprehensive answer — much better for complex multi-part questions.',
      },
      {
        q: 'Which query would Perplexity handle better than a standard Google search?',
        o: ['Weather in London right now', 'Pizza restaurants near me', 'How do I reset my iPhone', 'What happened at the Fed meeting this week and what do economists think it means for mortgages?'],
        a: 3,
        e: 'Perplexity excels at synthesis questions requiring multiple sources — it reads and combines articles into a nuanced answer, which a list of links cannot.',
      },
    ],
    hard: [
      {
        q: "What is Perplexity's Pages feature?",
        o: ['A saved history of past searches', 'A Chrome browser extension', 'A reading list for bookmarking articles', 'A feature generating full structured long-form articles with sections and cited sources'],
        a: 3,
        e: 'Pages generates a complete structured article on any topic — AI-written content with cited sources — useful for research overviews and content creation starting points.',
      },
      {
        q: "Why might Perplexity's answers sometimes contradict themselves on the same topic?",
        o: ['It generates answers randomly', 'It personalises differently for each user', 'It has a known consistency bug', "Different sources it retrieves may genuinely disagree — and Perplexity synthesises without always flagging those conflicts"],
        a: 3,
        e: 'Perplexity blends multiple sources that may hold different views. When sources conflict it sometimes merges them without flagging the disagreement — a key limitation.',
      },
      {
        q: "Perplexity specifically threatens Google's core business because:",
        o: ['It is significantly cheaper to use', 'It blocks all advertising', 'It works faster on mobile', "It gives direct synthesised answers instead of links, removing the incentive to visit websites and disrupting the web's ad-revenue model"],
        a: 3,
        e: "Google's model depends on users clicking through to websites where ads are shown. Perplexity's direct answers eliminate that click — threatening publishers and Google's search dominance simultaneously.",
      },
    ],
  },
};

// -----------------------------------------------------------------
// POINTS PER DIFFICULTY TIER
// -----------------------------------------------------------------
const DIFF_PTS = { easy: 5, medium: 10, hard: 20 };

// -----------------------------------------------------------------
// SHUFFLE HELPER — randomise array without mutating original
// -----------------------------------------------------------------
function _shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// -----------------------------------------------------------------
// SHUFFLE OPTIONS — randomise answer order at render time
// Returns { question, opts, correctIdx, explanation, diff, toolId }
// so quiz.jsx always knows which index is correct after shuffling.
// -----------------------------------------------------------------
function shuffleOptions(rawQ, diff, toolId) {
  const indexed = rawQ.o.map((opt, i) => ({ opt, isCorrect: i === rawQ.a }));
  const shuffled = _shuffle(indexed);
  return {
    question: rawQ.q,
    opts: shuffled.map(x => x.opt),
    correctIdx: shuffled.findIndex(x => x.isCorrect),
    explanation: rawQ.e,
    diff,
    toolId,
  };
}

// -----------------------------------------------------------------
// BUILD QUIZ SEQUENCE
// Each tool gets exactly 2 questions. Tool order is randomised.
// Difficulty starts at medium for every tool.
// After answering Q1 on a tool: correct → hard, wrong → easy.
// -----------------------------------------------------------------
function buildAdaptiveQuiz() {
  const toolOrder = _shuffle(TOOLS);
  // Each entry: { toolId, pass (0=first, 1=second) }
  const sequence = [];
  toolOrder.forEach(t => {
    sequence.push({ toolId: t.id, pass: 0 });
    sequence.push({ toolId: t.id, pass: 1 });
  });
  // Interleave so same tool's two questions aren't always adjacent
  // Simple approach: separate passes into two halves, then interleave
  const firstPass  = sequence.filter(s => s.pass === 0);
  const secondPass = sequence.filter(s => s.pass === 1);
  const interleaved = [];
  for (let i = 0; i < firstPass.length; i++) {
    interleaved.push(firstPass[i]);
    if (secondPass[i]) interleaved.push(secondPass[i]);
  }

  return {
    sequence: interleaved,
    // Per-tool difficulty state — starts medium, updated after each answer
    toolDiff: Object.fromEntries(TOOLS.map(t => [t.id, 'medium'])),
    // Track which questions have been used per tool+diff to avoid repeats
    usedKeys: Object.fromEntries(TOOLS.map(t => [t.id, new Set()])),
    // Per-tool score tracking for result breakdown
    toolScore: Object.fromEntries(TOOLS.map(t => [t.id, { correct: 0, total: 0 }])),
    // Difficulty breakdown for result screen
    diffTrack: { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } },
    // Total points accumulated
    totalPoints: 0,
    // Current question index
    currentIdx: 0,
  };
}

// -----------------------------------------------------------------
// PICK NEXT QUESTION — reads current difficulty from quizState
// Called by quiz.jsx when rendering each question.
// -----------------------------------------------------------------
function pickQuestion(quizState, toolId) {
  const diff = quizState.toolDiff[toolId];
  const pool = QUESTION_BANK[toolId][diff];
  const used = quizState.usedKeys[toolId];

  // Find an unused question at this difficulty level
  let available = pool.filter((_, i) => !used.has(diff + ':' + i));
  // If all used (shouldn't happen with 3 per tier but safe fallback)
  if (!available.length) available = pool;

  const q = available[Math.floor(Math.random() * available.length)];
  const origIdx = pool.indexOf(q);
  used.add(diff + ':' + origIdx);

  return shuffleOptions(q, diff, toolId);
}

// -----------------------------------------------------------------
// RECORD ANSWER — updates quizState after each answer
// Call this in quiz.jsx after the user picks an option.
// Returns updated quizState (immutable update pattern).
// -----------------------------------------------------------------
function recordAnswer(quizState, toolId, wasCorrect) {
  const next = {
    ...quizState,
    toolDiff: { ...quizState.toolDiff },
    toolScore: {
      ...quizState.toolScore,
      [toolId]: { ...quizState.toolScore[toolId] },
    },
    diffTrack: {
      easy:   { ...quizState.diffTrack.easy   },
      medium: { ...quizState.diffTrack.medium },
      hard:   { ...quizState.diffTrack.hard   },
    },
  };

  const diff = quizState.toolDiff[toolId];
  const pts  = DIFF_PTS[diff];

  next.toolScore[toolId].total++;
  next.diffTrack[diff].t++;

  if (wasCorrect) {
    next.totalPoints += pts;
    next.toolScore[toolId].correct++;
    next.diffTrack[diff].c++;
    // Escalate difficulty
    if (diff === 'easy')   next.toolDiff[toolId] = 'medium';
    if (diff === 'medium') next.toolDiff[toolId] = 'hard';
    // Already hard — stays hard
  } else {
    // De-escalate difficulty
    if (diff === 'hard')   next.toolDiff[toolId] = 'medium';
    if (diff === 'medium') next.toolDiff[toolId] = 'easy';
    // Already easy — stays easy
  }

  next.currentIdx++;
  return next;
}

// -----------------------------------------------------------------
// SCORE CALCULATION
// Score = points earned / max possible points × 100
// Max possible depends on difficulty path taken.
// -----------------------------------------------------------------
function calcScore(quizState) {
  const { diffTrack, totalPoints } = quizState;
  const maxPossible =
    diffTrack.easy.t   * DIFF_PTS.easy   +
    diffTrack.medium.t * DIFF_PTS.medium +
    diffTrack.hard.t   * DIFF_PTS.hard;
  return maxPossible > 0 ? Math.round((totalPoints / maxPossible) * 100) : 0;
}

// -----------------------------------------------------------------
// LEGACY COMPATIBILITY SHIM
// The existing quiz.jsx, processing.jsx, result.jsx etc. call
// resolveQuiz(), scoreAnswers(), scoreAnswersAsync(), levelFor().
// These shims keep everything working without touching other files.
// -----------------------------------------------------------------

// scoreAnswers — returns 0..30 mapped from 0..100 for level thresholds
function scoreAnswers(answers) {
  // answers here is the quizState stored by app.jsx
  if (answers && typeof answers.totalPoints === 'number') {
    const pct = calcScore(answers);
    // Map 0-100 → 0-30 for LEVELS range compatibility
    return Math.round((pct / 100) * 30);
  }
  return 0;
}

async function scoreAnswersAsync(answers) {
  return scoreAnswers(answers);
}

function resolveQuiz(answers) {
  // Legacy: return a 10-item array for progress bar rendering
  // Each item just needs an id for the progress bar in quiz.jsx
  return Array.from({ length: 10 }, (_, i) => ({ id: 'q' + (i + 1), num: String(i + 1).padStart(2, '0') }));
}

// -----------------------------------------------------------------
// PROFILING QUESTIONS — 3 unscored questions shown before the quiz.
// p1 → job (job-grid), p2 → AI experience (single), p3 → goal (text)
// Answers stored in profilingAnswers (separate bucket from quiz answers).
// -----------------------------------------------------------------
const PROFILING = [
  {
    id: 'p1', num: '01', topic: 'Your work', type: 'job-grid',
    prompt: 'What do you do for work?',
    hint: 'Personalizes your result — no wrong answer.',
  },
  {
    id: 'p2', num: '02', topic: 'AI experience', type: 'single',
    prompt: 'Have you ever used an AI tool like ChatGPT, Claude or Gemini?',
    hint: 'No wrong answer — just honest.',
    options: [
      { id: 'never',     label: "Never heard of them" },
      { id: 'heard',     label: "Heard of them but never tried" },
      { id: 'once',      label: "Tried once or twice" },
      { id: 'sometimes', label: "Use them sometimes" },
      { id: 'weekly',    label: "Use them weekly or daily" },
    ],
  },
  {
    id: 'p3', num: '03', topic: 'Your goal', type: 'text',
    prompt: "What's one thing you'd love AI to help you with?",
    hint: 'One sentence. This shapes your personalized plan.',
    placeholder: "I'd love AI to…",
    minChars: 4,
  },
];

// -----------------------------------------------------------------
// 10 JOB OPTIONS FOR PERSONALISATION
// -----------------------------------------------------------------
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
// LEVELS — derived from score (mapped to 0-30 for compatibility)
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
      { d: 3, t: "Ask it to explain one thing you already know. See if it's right.", w: '5 min' },
      { d: 4, t: 'Learn one safety rule: never paste passwords, social security, or client names.', w: '5 min' },
      { d: 5, t: "Use it to rewrite one message you're putting off.", w: '10 min' },
      { d: 6, t: "Try one tool that isn't ChatGPT (Claude, Gemini, or Perplexity).", w: '10 min' },
      { d: 7, t: "Pick the one thing you'll keep using weekly.", w: '5 min' },
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
      { d: 4, t: "Ask AI to double-check its own answer. Watch it catch itself.", w: '5 min' },
      { d: 5, t: 'Try a specialist: Perplexity for research, Midjourney for images.', w: '15 min' },
      { d: 6, t: 'Teach one friend or coworker the prompt you saved.', w: '10 min' },
      { d: 7, t: "Decide what's worth doing weekly vs. one-off.", w: '5 min' },
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
      { d: 7, t: "Pick one habit to keep. Drop one that wasn't worth it.", w: '10 min' },
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

// -----------------------------------------------------------------
// LLM JUDGE — preserved from original for any open-text items
// -----------------------------------------------------------------
async function llmJudge(item, answer) {
  const heuristic = item.score ? item.score(answer, item) : 0;
  const key = typeof window !== 'undefined' ? window.OPENAI_API_KEY : null;
  if (!key || !item.rubric || typeof answer !== 'string') return heuristic;
  const model = (typeof window !== 'undefined' && window.OPENAI_MODEL) || 'gpt-4o-mini';
  const sys = 'You are a fair grader for an AI literacy quiz. Reply with a single integer 0, 1, 2, or 3. No other text.';
  const user = `Question: ${item.prompt}\n\nRubric: ${item.rubric}\n\nAnswer: """${answer.trim()}"""\n\nReturn only the integer score (0-3).`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model, temperature: 0, max_tokens: 4, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }),
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

function extractCuriosity(answers) { return null; }
function overconfidenceFlag(answers) { return false; }

// -----------------------------------------------------------------
// JOB PACKS — preserved exactly from original
// -----------------------------------------------------------------
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
    firstWinTitle: "Ask AI anything you've always wondered",
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
    safetyAdd: "Whatever you do, don't paste personal data — SSN, bank info, medical records, passwords. Swap real names and numbers for placeholders.",
  },
};

// -----------------------------------------------------------------
// LANDING PAGE HEADLINE VARIANTS
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
    sub: "10 honest questions. Find out where you land among AI Newcomers, Curious, Users, and Ready.",
  },
  {
    id: 'honest',
    pre: 'Most AI quizzes ask how confident you feel.',
    main: "This one tests what you actually know.",
    sub: 'Performance-based. Adaptive difficulty. 5 real tools. Your score reflects ability, not self-confidence.',
  },
];

// Shared score cache for compatibility
const __scoreCache = new Map();
function __answersKey(a) { try { return JSON.stringify(a); } catch { return ''; } }

// -----------------------------------------------------------------
// EXPORT EVERYTHING TO WINDOW (matches original pattern)
// -----------------------------------------------------------------
Object.assign(window, {
  // New adaptive engine
  TOOLS,
  QUESTION_BANK,
  DIFF_PTS,
  buildAdaptiveQuiz,
  pickQuestion,
  recordAnswer,
  calcScore,
  shuffleOptions,
  // Legacy compatibility
  QUIZ: [],
  QUIZ_VARIANTS: {},
  resolveQuiz,
  scoreAnswers,
  scoreAnswersAsync,
  llmJudge,
  overconfidenceFlag,
  extractCuriosity,
  // Shared data
  PROFILING,
  JOBS,
  LEVELS,
  JOB_PACKS,
  HEADLINES,
  levelFor,
});