// Quiz — 10 items, mixed types (single · multi · text · likert), one-per-screen.
function QuizScreen({ tweaks, onComplete, onBack, answers, setAnswers }) {
  const [qIdx, setQIdx] = React.useState(0);
  // Adaptive: resolved list updates whenever answers change. Branching off
  // Q1/Q2 shifts the later items (novice path / power path) in place.
  const quiz = window.resolveQuiz(answers);
  const q = quiz[qIdx];
  const total = quiz.length;
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';

  const isLast = qIdx === total - 1;

  const advance = (nextAnswers) => {
    if (isLast) setTimeout(() => onComplete(nextAnswers), 240);
    else        setTimeout(() => setQIdx(qIdx + 1), 180);
  };

  // ---- Single-choice: tap to auto-advance ----
  const pickSingle = (optId) => {
    const next = { ...answers, [q.id]: optId };
    setAnswers(next);
    advance(next);
  };

  // ---- Multi-select: toggle, require explicit Next ----
  const toggleMulti = (optId) => {
    const cur = Array.isArray(answers[q.id]) ? answers[q.id] : [];
    const on = cur.includes(optId);
    const nextPick = on ? cur.filter(x => x !== optId) : [...cur, optId];
    setAnswers({ ...answers, [q.id]: nextPick });
  };

  // ---- Text: debounce save into answers, require Next ----
  const onText = (e) => {
    setAnswers({ ...answers, [q.id]: e.target.value });
  };

  // ---- Likert: tap to auto-advance ----
  const pickLikert = (id) => {
    const next = { ...answers, [q.id]: id };
    setAnswers(next);
    advance(next);
  };

  // ---- Explicit Next (for multi/text) ----
  const canAdvance = (() => {
    const a = answers[q.id];
    if (q.type === 'multi')  return Array.isArray(a) && a.length >= 1;
    if (q.type === 'text')   return typeof a === 'string' && a.trim().length >= (q.minChars || 1);
    if (q.type === 'single') return !!a;
    if (q.type === 'likert') return !!a;
    return false;
  })();

  const next = () => advance(answers);
  const back = () => (qIdx === 0 ? onBack() : setQIdx(qIdx - 1));

  return (
    <>
      <NavBar step={`question ${q.num} of ${String(total).padStart(2, '0')}`} onHome={onBack} />

      <Section>
        <Container size="sm" style={{ paddingTop: 'clamp(24px, 4vw, 40px)', paddingBottom: 'clamp(40px, 6vw, 80px)', minHeight: '70vh' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <button onClick={back} style={btnPlain}>← back</button>
            <div style={{ flex: 1, display: 'flex', gap: 4 }}>
              {quiz.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3,
                  background: i < qIdx ? 'var(--accent)' : (i === qIdx ? 'var(--ink)' : 'var(--line)'),
                  borderRadius: 2,
                  transition: 'background .2s',
                }}/>
              ))}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)' }}>
              {q.num}/{String(total).padStart(2, '0')}
            </span>
          </div>

          <div key={q.id} style={{ animation: 'qfade .35s ease both' }}>
            {/* Topic + type chip */}
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
                <span>Q.{q.num}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{q.topic}</span>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 10px',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 3,
                color: 'var(--muted)',
                fontFamily: 'var(--mono)', fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                {q.type === 'single' && 'pick one'}
                {q.type === 'multi'  && 'pick all that apply'}
                {q.type === 'text'   && 'type your answer'}
                {q.type === 'likert' && 'gut check'}
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

            {/* ====== SINGLE ====== */}
            {q.type === 'single' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, i) => (
                  <ChoiceButton
                    key={opt.id}
                    label={opt.label}
                    badge={String.fromCharCode(65 + i)}
                    picked={answers[q.id] === opt.id}
                    onClick={() => pickSingle(opt.id)}
                  />
                ))}
              </div>
            )}

            {/* ====== MULTI ====== */}
            {q.type === 'multi' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options.map((opt, i) => {
                    const picked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt.id);
                    return (
                      <ChoiceButton
                        key={opt.id}
                        label={opt.label}
                        badge={picked ? '✓' : String.fromCharCode(65 + i)}
                        picked={picked}
                        onClick={() => toggleMulti(opt.id)}
                      />
                    );
                  })}
                </div>
                <NextBar canAdvance={canAdvance} onNext={next} isLast={isLast} />
              </>
            )}

            {/* ====== TEXT ====== */}
            {q.type === 'text' && (
              <>
                <textarea
                  value={answers[q.id] || ''}
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
                <TextMeta q={q} value={answers[q.id] || ''} />
                <NextBar canAdvance={canAdvance} onNext={next} isLast={isLast} />
              </>
            )}

            {/* ====== LIKERT ====== */}
            {q.type === 'likert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.scale.map((s, i) => (
                  <ChoiceButton
                    key={s.id}
                    label={s.label}
                    badge={String(i + 1)}
                    picked={answers[q.id] === s.id}
                    onClick={() => pickLikert(s.id)}
                  />
                ))}
              </div>
            )}

            {/* Helper line */}
            <div style={{
              marginTop: 28,
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--muted)',
              textAlign: 'center',
            }}>
              {q.type === 'single' && 'tap to continue · honesty gives the best result'}
              {q.type === 'multi'  && 'pick every one that fits · we score both hits and misses'}
              {q.type === 'text'   && 'your words matter here · this one is looked at'}
              {q.type === 'likert' && 'gut answer · no thinking required'}
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

// ---- Next bar (multi + text) ----
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
