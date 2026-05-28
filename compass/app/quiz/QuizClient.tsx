'use client';

// Quiz client — full state machine for the placement quiz.
//
// Phases:
//   profiling-1  (job grid)
//   profiling-2  (AI experience, single-select)
//   profiling-3  (goal, free-text)
//   quiz         (adaptive MCQs via CAT engine)
//   complete     (renders <CompleteScreen> with the score; result UI lives in /quiz/complete route)
//
// State is persisted to localStorage at every step so a user who signs up
// mid-flow doesn't lose their progress. The post-result page reads the
// final state and writes it to the DB via a server action.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROFILING, JOBS } from '@/lib/profiling';
import {
  buildQuizState, pickNextQuestion, recordAnswer,
  MAX_Q, levelFromTheta, thetaToScore,
} from '@/lib/cat-engine';
import type {
  QuizState, RenderedQuestion, ProfilingAnswers, JobId,
} from '@/lib/types';
import { BrandMark } from '@/components/BrandMark';

type Phase = 'profiling-1' | 'profiling-2' | 'profiling-3' | 'quiz';

const STORAGE_KEY = 'compass.quiz.v1';

type Persisted = {
  phase: Phase;
  profilingAnswers: ProfilingAnswers;
  quizState: QuizState | null;
  currentQ: RenderedQuestion | null;
};

// ---- localStorage helpers (Sets don't survive JSON round-trip) ----
function serialise(s: Persisted): string {
  const q = s.quizState
    ? { ...s.quizState, usedKeys: Array.from(s.quizState.usedKeys) }
    : null;
  return JSON.stringify({ ...s, quizState: q });
}
function deserialise(raw: string): Persisted | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.quizState) {
      parsed.quizState.usedKeys = new Set<string>(parsed.quizState.usedKeys || []);
    }
    return parsed as Persisted;
  } catch { return null; }
}

export function QuizClient() {
  const router = useRouter();

  // hydrate from localStorage on mount (once)
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>('profiling-1');
  const [profilingAnswers, setProfilingAnswers] = useState<ProfilingAnswers>({});
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentQ, setCurrentQ] = useState<RenderedQuestion | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = deserialise(raw);
      if (s) {
        setPhase(s.phase);
        setProfilingAnswers(s.profilingAnswers);
        setQuizState(s.quizState);
        setCurrentQ(s.currentQ);
      }
    }
    setHydrated(true);
  }, []);

  // persist on every state change after hydration
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, serialise({ phase, profilingAnswers, quizState, currentQ }));
  }, [hydrated, phase, profilingAnswers, quizState, currentQ]);

  // === profiling-1: job grid ===
  if (phase === 'profiling-1') {
    return (
      <QuizFrame stepNum={1} stepTotal={3 + 5 /* hint at total */} kind="profiling"
        onBack={() => router.push('/')}>
        <QuestionHeader topic="Your work" prompt="What do you do?"
          hint="Personalizes your feed — no wrong answer." chipLabel="Pick one" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {JOBS.map(j => (
            <button
              key={j.id}
              onClick={() => {
                setProfilingAnswers({ ...profilingAnswers, p1: j.id });
                setTimeout(() => setPhase('profiling-2'), 160);
              }}
              className="text-left p-4 border border-line rounded-xl bg-paper hover:border-ink hover:bg-paper-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg text-accent">{j.icon}</span>
                <span className="font-medium text-[15px] leading-tight">{j.label}</span>
              </div>
              <p className="text-[12px] text-muted mt-1.5 leading-snug">{j.sample}</p>
            </button>
          ))}
        </div>
      </QuizFrame>
    );
  }

  // === profiling-2: AI experience single-select ===
  if (phase === 'profiling-2') {
    const q = PROFILING[1];
    if (q.type !== 'single') return null;
    const picked = profilingAnswers.p2;
    return (
      <QuizFrame stepNum={2} stepTotal={3 + 5} kind="profiling"
        onBack={() => setPhase('profiling-1')}>
        <QuestionHeader topic={q.topic} prompt={q.prompt} hint={q.hint} chipLabel="Pick one" />
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <ChoiceButton
              key={opt.id}
              label={opt.label}
              badge={String.fromCharCode(65 + i)}
              picked={picked === opt.id}
              onClick={() => {
                setProfilingAnswers({ ...profilingAnswers, p2: opt.id as ProfilingAnswers['p2'] });
                setTimeout(() => setPhase('profiling-3'), 160);
              }}
            />
          ))}
        </div>
      </QuizFrame>
    );
  }

  // === profiling-3: goal text ===
  if (phase === 'profiling-3') {
    const q = PROFILING[2];
    if (q.type !== 'text') return null;
    const goal = profilingAnswers.p3 || '';
    const okLen = goal.trim().length >= q.minChars;
    const onNext = () => {
      // bootstrap CAT state seeded from profiling
      const s = buildQuizState(profilingAnswers);
      const first = pickNextQuestion(s);
      setQuizState(s);
      setCurrentQ(first);
      setPhase('quiz');
    };
    return (
      <QuizFrame stepNum={3} stepTotal={3 + 5} kind="profiling"
        onBack={() => setPhase('profiling-2')}>
        <QuestionHeader topic={q.topic} prompt={q.prompt} hint={q.hint} chipLabel="Type your answer" />
        <textarea
          value={goal}
          onChange={(e) => setProfilingAnswers({ ...profilingAnswers, p3: e.target.value })}
          placeholder={q.placeholder}
          rows={4}
          autoFocus
          className="w-full px-5 py-4 border-[1.5px] border-line focus:border-ink outline-none rounded-[10px] bg-paper text-ink text-base leading-relaxed font-sans resize-vertical min-h-[120px]"
        />
        <div className="mt-3 flex justify-between font-mono text-[11px] text-muted tracking-[0.08em]">
          <span>{goal.trim().length} chars · min {q.minChars}</span>
          <span className={okLen ? 'text-ok' : 'text-muted'}>{okLen ? '✓ long enough' : 'keep going'}</span>
        </div>
        <NextBar disabled={!okLen} onNext={onNext} label="Start the quiz →" />
      </QuizFrame>
    );
  }

  // === adaptive quiz ===
  if (phase === 'quiz' && quizState && currentQ) {
    const asked = quizState.asked;
    const pickAnswer = (optIdx: number) => {
      if (advancing) return;
      setAdvancing(true);
      const correct = optIdx === currentQ.correctIdx;
      const next = recordAnswer(quizState, currentQ, correct);
      if (next.done) {
        // Persist final state then route to /quiz/complete
        localStorage.setItem(
          STORAGE_KEY,
          serialise({ phase: 'quiz', profilingAnswers, quizState: next, currentQ: null }),
        );
        setTimeout(() => router.push('/quiz/complete'), 280);
      } else {
        const nq = pickNextQuestion(next);
        if (!nq) {
          // out of questions — finish anyway
          localStorage.setItem(
            STORAGE_KEY,
            serialise({ phase: 'quiz', profilingAnswers, quizState: next, currentQ: null }),
          );
          setTimeout(() => router.push('/quiz/complete'), 280);
        } else {
          setTimeout(() => {
            setQuizState(next);
            setCurrentQ(nq);
            setAdvancing(false);
          }, 200);
        }
      }
    };

    const toolName = currentQ.toolId.charAt(0).toUpperCase() + currentQ.toolId.slice(1);
    return (
      <QuizFrame
        stepNum={asked + 1}
        stepTotal={MAX_Q}
        kind="quiz"
        onBack={() => setPhase('profiling-3')}
        progress={asked / MAX_Q}
      >
        <div className="flex gap-2 flex-wrap mb-5 font-mono text-[10px] tracking-[0.18em] uppercase">
          <span className="py-1 px-2.5 rounded-[3px] border border-accent text-accent">
            Q.{String(asked + 1).padStart(2, '0')} · {toolName}
          </span>
          <span className="py-1 px-2.5 rounded-[3px] border border-line text-ink-2 bg-paper-2">
            {currentQ.diff}
          </span>
          <span className="py-1 px-2.5 rounded-[3px] border border-line text-muted bg-paper-2">
            {currentQ.cat}
          </span>
        </div>
        <h2 className="font-serif text-[clamp(26px,4vw,40px)] leading-[1.1] tracking-tight font-normal mb-3 text-balance">
          {currentQ.question}
        </h2>
        <p className="font-mono text-[12px] tracking-[0.06em] text-muted mb-7">
          — pick the best answer
        </p>
        <div className="flex flex-col gap-2.5">
          {currentQ.opts.map((opt, i) => (
            <ChoiceButton
              key={i}
              label={opt}
              badge={String.fromCharCode(65 + i)}
              picked={false}
              onClick={() => pickAnswer(i)}
            />
          ))}
        </div>
        <div className="mt-7 text-center font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
          tap to continue · the quiz adapts to your answers
        </div>
      </QuizFrame>
    );
  }

  // hydrating
  return null;
}

// ---- inner components ----

function QuizFrame({
  children, stepNum, stepTotal, kind, onBack, progress,
}: {
  children: React.ReactNode;
  stepNum: number;
  stepTotal: number;
  kind: 'profiling' | 'quiz';
  onBack: () => void;
  progress?: number; // 0–1, only used in quiz phase
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="flex justify-between items-center px-5 md:px-16 py-5 border-b border-line bg-paper sticky top-0 z-10">
        <a href="/" className="flex items-center gap-[10px]">
          <BrandMark size={22} />
          <span className="font-serif text-lg font-medium tracking-tight">
            Compass<span className="text-accent">.</span>
          </span>
        </a>
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
          {kind === 'profiling' ? 'about you' : 'placement quiz'}
        </span>
      </nav>

      <section className="px-5 md:px-16 py-10 md:py-14 max-w-[760px] mx-auto qfade">
        <div className="flex items-center gap-3 mb-9">
          <button onClick={onBack} className="font-mono text-[12px] tracking-[0.08em] text-muted hover:text-ink">← back</button>
          <div className="flex-1 flex gap-1">
            {Array.from({ length: stepTotal }, (_, i) => {
              const active = i < stepNum;
              const here = i === stepNum - 1;
              return (
                <div key={i} className="flex-1 h-[3px] rounded-sm transition-colors"
                  style={{
                    background: active ? 'var(--accent)' : here ? 'var(--ink)' : 'var(--line)',
                    opacity: progress !== undefined && i >= stepNum ? 1 - (i - (stepNum - 1)) * 0.07 : 1,
                  }} />
              );
            })}
          </div>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted">
            {String(stepNum).padStart(2, '0')}/{String(stepTotal).padStart(2, '0')}
          </span>
        </div>
        {children}
      </section>
    </main>
  );
}

function QuestionHeader({ topic, prompt, hint, chipLabel }: { topic: string; prompt: string; hint: string; chipLabel: string }) {
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-5 font-mono text-[10px] tracking-[0.18em] uppercase">
        <span className="py-1 px-2.5 rounded-[3px] border border-accent text-accent">{topic}</span>
        <span className="py-1 px-2.5 rounded-[3px] border border-line text-muted bg-paper-2">{chipLabel}</span>
      </div>
      <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.08] tracking-tight font-normal mb-3 text-balance">
        {prompt}
      </h2>
      <p className="font-mono text-[12px] tracking-[0.06em] text-muted mb-7">— {hint}</p>
    </>
  );
}

function ChoiceButton({ label, badge, picked, onClick }: { label: string; badge: string; picked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-[10px] text-left font-medium text-[16px] leading-tight transition-all ${
        picked
          ? 'bg-ink text-paper border-[1.5px] border-ink'
          : 'bg-white/50 text-ink border border-line hover:border-ink active:scale-[0.99]'
      }`}
    >
      <span
        className={`w-8 h-8 rounded-md grid place-items-center font-mono text-[13px] flex-shrink-0 ${
          picked ? 'border border-paper text-paper bg-transparent' : 'border border-line text-ink-2 bg-paper-2'
        }`}
      >{badge}</span>
      <span className="flex-1 leading-[1.3]">{label}</span>
    </button>
  );
}

function NextBar({ disabled, onNext, label = 'Next →' }: { disabled: boolean; onNext: () => void; label?: string }) {
  return (
    <div className="mt-5 flex justify-end">
      <button
        disabled={disabled}
        onClick={onNext}
        className={`px-6 py-3.5 rounded-[10px] font-sans text-[15px] font-semibold transition-all ${
          disabled ? 'bg-line text-muted cursor-not-allowed' : 'bg-ink text-paper hover:bg-accent'
        }`}
      >{label}</button>
    </div>
  );
}
