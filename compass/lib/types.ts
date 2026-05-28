// Shared types across the Compass app.

export type ToolId = 'chatgpt' | 'claude' | 'gemini' | 'copilot' | 'perplexity';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'capability' | 'concept' | 'judgment' | 'risk';
export type Level = 'newcomer' | 'curious' | 'user' | 'ready';

export type JobId =
  | 'retail'
  | 'office'
  | 'smb'
  | 'creative'
  | 'teach'
  | 'health'
  | 'trades'
  | 'student'
  | 'retired'
  | 'developer'
  | 'other';

// A raw question in the QUESTION_BANK
export type RawQuestion = {
  q: string;          // prompt
  o: string[];        // 4 options
  a: number;          // correct index
  e: string;          // explanation
};

// A rendered question (options shuffled, with metadata).
export type RenderedQuestion = {
  question: string;
  opts: string[];
  correctIdx: number;
  explanation: string;
  diff: Difficulty;
  toolId: ToolId;
  cat: Category;
  qKey: string;       // toolId:diff:idx — stable identity for de-duping
};

// CAT engine state.
export type QuizState = {
  // CAT vars
  theta: number;          // 0–100 ability estimate
  se: number;             // standard error
  asked: number;
  done: boolean;
  doneReason: '' | 'max' | 'confident' | 'edge';

  // History of answers
  history: Array<{
    qKey: string;
    toolId: ToolId;
    diff: Difficulty;
    cat: Category;
    correct: boolean;
    thetaAfter: number;
    seAfter: number;
  }>;

  // Coverage tracking
  usedKeys: Set<string>;
  catCount: Record<Category, number>;
  toolCount: Record<ToolId, number>;

  // Legacy bookkeeping
  toolScore: Record<ToolId, { correct: number; total: number }>;
  diffTrack: Record<Difficulty, { c: number; t: number }>;
  totalPoints: number;
};

// Profiling answers (job + AI usage + goal text).
export type ProfilingAnswers = {
  p1?: JobId;
  p1_other?: string;
  p2?: 'never' | 'heard' | 'once' | 'sometimes' | 'weekly';
  p3?: string;
};

// User profile saved in the DB after quiz completion.
// user_id is Clerk's user id (e.g. 'user_2abc123…') — always a string.
export type Profile = {
  user_id: string;
  email: string;
  job_id: JobId | null;
  job_other: string | null;
  level: Level | null;
  theta: number | null;
  goal_text: string | null;
  created_at: string;
  updated_at: string;
};

// Feed item.
export type Item = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  blurb: string;            // short summary
  type: 'news' | 'tool' | 'prompt' | 'howto';
  level_min: Level;
  level_max: Level;
  jobs: JobId[] | ['all'];
  status: 'pending' | 'live' | 'rejected';
  published_at: string;
  approved_at: string | null;
  created_at: string;
};
