// Quiz — two phases sharing the same component.
// phase='profiling' → 3 unscored questions, stores in profilingAnswers.
// phase='quiz'      → 10 adaptive MCQs via buildAdaptiveQuiz/pickQuestion/recordAnswer.
//                     onComplete receives the quizState object (passed as answers to app.jsx).
function QuizScreen({ tweaks, phase, onComplete, onBack, answers, setAnswers, profilingAnswers, setProfilingAnswers }) {
  const isProfilingPhase = phase === 'profiling';
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';

  // Profiling phase index — only used when isProfilingPhase
  const [qIdx, setQIdx] = React.useState(0);

  // Adaptive quiz state — initialized once on mount for the quiz phase
  const [adaptiveData, setAdaptiveData] = React.useState(() => {
    if (isProfilingPhase) return null;
    const state = window.buildAdaptiveQuiz();
    const toolId = state.sequence[0].toolId;
    const q = window.pickQuestion(state, toolId);
    return { state, q };
  });

  // ================================================================
  // PROFILING PHASE
  // ================================================================
  if (isProfilingPhase) {
    const allQuestions = window.PROFILING;
    const total = allQuestions.length;
    const q = allQuestions[qIdx];
    const isLast = qIdx === total - 1;
    const displayNum   = String(qIdx + 1).padStart(2, '0');
    const displayTotal = String(total).padStart(2, '0');

    const advanceWith = (latestAns) => {
      if (isLast) setTimeout(() => onComplete(latestAns), 240);
      else        setTimeout(() => setQIdx(qIdx + 1), 180);
    };

    const pickSingle = (optId) => {
      const next = { ...profilingAnswers, [q.id]: optId };
      setProfilingAnswers(next);
      advanceWith(next);
    };

    const onText = (e) => {
      setProfilingAnswers({ ...profilingAnswers, [q.id]: e.target.value });
    };

    const canAdvance = (() => {
      const a = profilingAnswers[q.id];
      if (q.type === 'text')     return typeof a === 'string' && a.trim().length >= (q.minChars || 1);
      if (q.type === 'single')   return !!a;
      if (q.type === 'job-grid') return !!a;
      return false;
    })();

    const next = () => advanceWith(profilingAnswers);
    const back = () => (qIdx === 0 ? onBack() : setQIdx(qIdx - 1));

    return (
      <>
        <NavBar step={`question ${displayNum} of ${displayTotal}`} onHome={onBack} />

        <Section>
          <Container size="sm" style={{ paddingTop: 'clamp(24px, 4vw, 40px)', paddingBottom: 'clamp(40px, 6vw, 80px)', minHeight: '70vh' }}>
            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <button onClick={back} style={btnPlain}>← back</button>
              <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                {allQuestions.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 3,
                    background: i < qIdx ? 'var(--accent)' : (i === qIdx ? 'var(--ink)' : 'var(--line)'),
                    borderRadius: 2,
                    transition: 'background .2s',
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)' }}>
                {displayNum}/{displayTotal}
              </span>
            </div>

            <div key={q.id} style={{ animation: 'qfade .35s ease both' }}>
              {/* Topic + about-you chip */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px',
                  border: '1px solid var(--accent)',
                  borderRadius: 3,
                  color: 'var(--accent)',
                  fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                }}>
                  <span>Q.{displayNum}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{q.topic}</span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 10px',
                  background: 'rgba(226,74,26,0.07)',
                  border: '1px solid var(--line)',
                  borderRadius: 3,
                  color: 'var(--muted)',
                  fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  about you
                </div>
              </div>

              <h2 style={{
                fontFamily: serifStack, fontWeight: 400,
                fontSize: 'clamp(26px, 4vw, 44px)', lineHeight: 1.08, letterSpacing: '-0.02em',
                margin: '0 0 14px', color: 'var(--ink)',
                textWrap: 'balance',
              }}>
                {q.prompt}
              </h2>
              <p style={{
                fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)',
                letterSpacing: '0.06em', margin: '0 0 28px',
              }}>
                — {q.hint}
              </p>

              {/* ====== JOB-GRID (p1) ====== */}
              {q.type === 'job-grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {window.JOBS.map(job => {
                    const picked = profilingAnswers.p1 === job.id;
                    return (
                      <button
                        key={job.id}
                        onClick={() => pickSingle(job.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '14px 16px',
                          border: picked ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                          borderRadius: 10,
                          background: picked ? 'var(--ink)' : 'rgba(255,255,255,0.5)',
                          color: picked ? 'var(--paper)' : 'var(--ink)',
                          cursor: 'pointer',
                          fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
                          textAlign: 'left',
                          transition: 'transform .12s, background .12s, color .12s',
                        }}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{job.icon}</span>
                        <span style={{ lineHeight: 1.25 }}>{job.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ====== SINGLE (p2) ====== */}
              {q.type === 'single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options.map((opt, i) => (
                    <ChoiceButton
                      key={opt.id}
                      label={opt.label}
                      badge={String.fromCharCode(65 + i)}
                      picked={profilingAnswers[q.id] === opt.id}
                      onClick={() => pickSingle(opt.id)}
                    />
                  ))}
                </div>
              )}

              {/* ====== TEXT (p3) ====== */}
              {q.type === 'text' && (
                <>
                  <textarea
                    value={profilingAnswers[q.id] || ''}
                    onChange={onText}
                    placeholder={q.placeholder}
                    rows={4}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      border: '1.5px solid var(--line)',
                      borderRadius: 10,
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--sans)',
                      fontSize: 16,
                      lineHeight: 1.5,
                      resize: 'vertical',
                      outline: 'none',
                      minHeight: 120,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                  />
                  <TextMeta q={q} value={profilingAnswers[q.id] || ''} />
                  <NextBar canAdvance={canAdvance} onNext={next} isLast={isLast} />
                </>
              )}

              <div style={{
                marginTop: 28,
                fontFamily: 'var(--mono)', fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--muted)', textAlign: 'center',
              }}>
                {q.type === 'job-grid' && 'tap to continue · personalizes your result'}
                {q.type === 'single'   && 'tap to continue · honesty gives the best result'}
                {q.type === 'text'     && 'your words matter here · this one is looked at'}
              </div>
            </div>
          </Container>
        </Section>

        <style>{`
          @keyframes qfade {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </>
    );
  }

  // ================================================================
  // QUIZ PHASE — adaptive MCQ engine
  // ================================================================
  if (!adaptiveData) return null;

  const { state: quizState, q: currentQ } = adaptiveData;
  const total      = quizState.sequence.length;
  const currentIdx = quizState.currentIdx;
  const displayNum   = String(currentIdx + 1).padStart(2, '0');
  const displayTotal = String(total).padStart(2, '0');

  const toolName = (window.TOOLS || []).find(t => t.id === currentQ.toolId)?.name || currentQ.toolId;
  const diffColor = { easy: '#2d6a4f', medium: '#b45309', hard: '#e24a1a' }[currentQ.diff] || 'var(--muted)';

  const pickAnswer = (optIdx) => {
    const wasCorrect = optIdx === currentQ.correctIdx;
    const nextState  = window.recordAnswer(quizState, currentQ.toolId, wasCorrect);
    const isDone     = nextState.currentIdx >= total;
    if (isDone) {
      setTimeout(() => onComplete(nextState), 240);
    } else {
      const nextToolId = nextState.sequence[nextState.currentIdx].toolId;
      const nextQ      = window.pickQuestion(nextState, nextToolId);
      setTimeout(() => setAdaptiveData({ state: nextState, q: nextQ }), 180);
    }
  };

  return (
    <>
      <NavBar step={`question ${displayNum} of ${displayTotal}`} onHome={onBack} />

      <Section>
        <Container size="sm" style={{ paddingTop: 'clamp(24px, 4vw, 40px)', paddingBottom: 'clamp(40px, 6vw, 80px)', minHeight: '70vh' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <button onClick={onBack} style={btnPlain}>← back</button>
            <div style={{ flex: 1, display: 'flex', gap: 4 }}>
              {Array.from({ length: total }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3,
                  background: i < currentIdx ? 'var(--accent)' : (i === currentIdx ? 'var(--ink)' : 'var(--line)'),
                  borderRadius: 2,
                  transition: 'background .2s',
                }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)' }}>
              {displayNum}/{displayTotal}
            </span>
          </div>

          <div key={currentIdx} style={{ animation: 'qfade .35s ease both' }}>
            {/* Tool + difficulty chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                border: '1px solid var(--accent)',
                borderRadius: 3,
                color: 'var(--accent)',
                fontFamily: 'var(--mono)', fontSize: 10,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                <span>Q.{displayNum}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{toolName}</span>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 10px',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 3,
                color: diffColor,
                fontFamily: 'var(--mono)', fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                {currentQ.diff}
              </div>
            </div>

            <h2 style={{
              fontFamily: serifStack, fontWeight: 400,
              fontSize: 'clamp(22px, 3.5vw, 38px)', lineHeight: 1.12, letterSpacing: '-0.02em',
              margin: '0 0 28px', color: 'var(--ink)',
              textWrap: 'balance',
            }}>
              {currentQ.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

            <div style={{
              marginTop: 28,
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--muted)', textAlign: 'center',
            }}>
              tap to continue · difficulty adapts to your answers
            </div>
          </div>
        </Container>
      </Section>

      <style>{`
        @keyframes qfade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ---- Shared choice row ----
function ChoiceButton({ label, badge, picked, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 18px',
      border: picked ? '1.5px solid var(--ink)' : '1px solid var(--line)',
      borderRadius: 10,
      background: picked ? 'var(--ink)' : 'rgba(255,255,255,0.5)',
      color: picked ? 'var(--paper)' : 'var(--ink)',
      cursor: 'pointer',
      fontFamily: 'var(--sans)',
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'left',
      letterSpacing: '-0.005em',
      transition: 'transform .12s, background .12s, color .12s',
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.995)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{
        width: 32, height: 32, borderRadius: 6,
        border: picked ? '1px solid var(--paper)' : '1px solid var(--line)',
        background: picked ? 'transparent' : 'var(--paper-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 13,
        color: picked ? 'var(--paper)' : 'var(--ink-2)',
        flexShrink: 0,
      }}>{badge}</span>
      <span style={{ flex: 1, lineHeight: 1.25 }}>{label}</span>
    </button>
  );
}

// ---- Text meta (char count + min) ----
function TextMeta({ q, value }) {
  const len = (value || '').trim().length;
  const ok = len >= (q.minChars || 1);
  return (
    <div style={{
      marginTop: 10,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'var(--mono)', fontSize: 11,
      color: 'var(--muted)', letterSpacing: '0.08em',
    }}>
      <span>{len} chars · min {q.minChars || 1}</span>
      <span style={{ color: ok ? 'var(--ok)' : 'var(--muted)' }}>
        {ok ? '✓ long enough' : 'keep going'}
      </span>
    </div>
  );
}

// ---- Next bar (text questions in profiling) ----
function NextBar({ canAdvance, onNext, isLast }) {
  return (
    <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
      <button
        disabled={!canAdvance}
        onClick={onNext}
        style={{
          padding: '14px 22px',
          border: 'none',
          borderRadius: 10,
          background: canAdvance ? 'var(--ink)' : 'var(--line)',
          color: canAdvance ? 'var(--paper)' : 'var(--muted)',
          fontFamily: 'var(--sans)',
          fontSize: 15,
          fontWeight: 600,
          cursor: canAdvance ? 'pointer' : 'not-allowed',
          letterSpacing: '-0.005em',
          transition: 'background .15s, color .15s',
        }}
      >
        {isLast ? 'Finish →' : 'Next →'}
      </button>
    </div>
  );
}

const btnPlain = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em',
  color: 'var(--muted)', padding: 0,
};

window.QuizScreen = QuizScreen;
