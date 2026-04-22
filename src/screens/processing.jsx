// Processing — simulated LLM personalization animation.
// Actually calls scoreAnswersAsync during the "thinking" delay so the
// open-text items (Q3, Q4, Q10) get graded by the LLM. The upgraded
// score is written into __scoreCache, so downstream screens (Result,
// Workplace, Email, Newsletter) pick it up via the same scoreAnswers(answers).

function ProcessingScreen({ tweaks, jobId, jobOther, answers, onDone, score, level }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const job = window.JOBS.find(j => j.id === jobId) || window.JOBS[0];
  const jobDisplay = jobId === 'other' && jobOther ? jobOther : job.label;

  // Prefer answers-driven scoring so the number you see here is the real one.
  // Fall back to the props for back-compat if a caller still passes them.
  const preScore = answers ? window.scoreAnswers(answers) : (score ?? 0);
  const preLevel = answers ? window.levelFor(preScore) : (level ?? window.LEVELS.curious);

  // Live score that will update once the async LLM scoring finishes.
  const [liveScore, setLiveScore] = React.useState(preScore);
  const [liveLevel, setLiveLevel] = React.useState(preLevel);

  const stages = React.useMemo(() => ([
    { t: `Reading your 10 answers…`,                                   d: 900 },
    { t: `Scoring 7 objective items locally…`,                         d: 1000 },
    { t: `Sending 3 open-text answers to gpt-4o-mini for grading…`,    d: 1300 },
    { t: `Calibrating confidence vs. accuracy…`,                       d: 900 },
    { t: `Loading examples for "${jobDisplay.toLowerCase()}"…`,        d: 1000 },
    { t: `Writing your 7-day plan…`,                                   d: 1100 },
    { t: `Finalizing your report…`,                                    d: 800 },
  ]), [jobDisplay]);

  const [stageIdx, setStageIdx] = React.useState(0);
  const [log, setLog] = React.useState([]);
  const [asyncDone, setAsyncDone] = React.useState(false);
  const [animDone, setAnimDone] = React.useState(false);

  // Kick off real async scoring on mount.
  React.useEffect(() => {
    let cancelled = false;
    if (!answers) { setAsyncDone(true); return; }
    (async () => {
      try {
        const s = await window.scoreAnswersAsync(answers);
        if (cancelled) return;
        setLiveScore(s);
        setLiveLevel(window.levelFor(s));
      } catch {
        // fallback — keep heuristic score
      } finally {
        if (!cancelled) setAsyncDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Animation loop.
  React.useEffect(() => {
    let cancelled = false;
    let acc = [];
    const run = async () => {
      for (let i = 0; i < stages.length; i++) {
        if (cancelled) return;
        setStageIdx(i);
        acc = [...acc, { t: stages[i].t, done: false }];
        setLog([...acc]);
        await new Promise(r => setTimeout(r, stages[i].d));
        if (cancelled) return;
        acc[acc.length - 1] = { ...acc[acc.length - 1], done: true };
        setLog([...acc]);
      }
      if (!cancelled) setAnimDone(true);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  // Only advance when BOTH the animation AND the async scoring are done.
  React.useEffect(() => {
    if (animDone && asyncDone) {
      const t = setTimeout(() => onDone(), 500);
      return () => clearTimeout(t);
    }
  }, [animDone, asyncDone]);

  const pct = Math.min(100, Math.round(((stageIdx + 1) / stages.length) * 100));

  return (
    <>
      <NavBar step="analyzing · please wait" onHome={() => {}} />

      <Section>
        <Container size="md" style={{ paddingTop: 'clamp(40px, 8vw, 100px)', paddingBottom: 'clamp(60px, 8vw, 100px)', textAlign: 'center' }}>
          {/* Spinner ring */}
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 28px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="60" cy="60" r="52" stroke="var(--line)" strokeWidth="2" fill="none" />
              <circle cx="60" cy="60" r="52" stroke="var(--accent)" strokeWidth="2" fill="none"
                strokeDasharray="326.7" strokeDashoffset={326.7 * (1 - pct / 100)}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset .4s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--ink)', fontWeight: 500,
            }}>{pct}%</div>
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            · Personalizing with gpt-4o-mini ·
          </div>
          <h2 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.02em',
            lineHeight: 1.05, margin: 0,
            textWrap: 'balance',
          }}>
            Analyzing your AI literacy…
          </h2>
          <p style={{
            marginTop: 14, fontSize: 15, color: 'var(--ink-2)',
            maxWidth: 480, margin: '14px auto 0', lineHeight: 1.45,
          }}>
            We're writing a plan specific to <strong style={{ color: 'var(--ink)' }}>{jobDisplay.toLowerCase()}</strong> — examples, prompts, and one safety rule that actually matters for you.
          </p>

          {/* Terminal-style log */}
          <div style={{
            marginTop: 40,
            maxWidth: 560, margin: '40px auto 0',
            textAlign: 'left',
            border: '1px solid var(--line)',
            borderRadius: 8,
            background: '#14110d',
            color: '#d8d1bf',
            padding: '18px 22px',
            fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.7,
            boxShadow: '0 20px 40px rgba(20,17,13,0.18)',
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.2em', color: '#857e6f',
              textTransform: 'uppercase', marginBottom: 10,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>→ openai.chat.completions( )</span>
              <span>sess_{Math.random().toString(36).slice(2, 8)}</span>
            </div>
            {log.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={{ color: l.done ? 'var(--ok)' : 'var(--accent)', width: 14, flexShrink: 0 }}>
                  {l.done ? '✓' : '◐'}
                </span>
                <span style={{ color: l.done ? '#d8d1bf' : '#fff' }}>
                  {l.t}
                  {!l.done && <span className="blink-dot"> ▍</span>}
                </span>
              </div>
            ))}
            {asyncDone && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #3a3528', color: '#d8d1bf' }}>
                <span style={{ color: 'var(--ok)', marginRight: 10 }}>✓</span>
                Matched: <strong>{liveLevel.name.toLowerCase()}</strong> ({liveScore}/30)
              </div>
            )}
          </div>
        </Container>
      </Section>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        .blink-dot { animation: blink 1s step-end infinite; }
      `}</style>
    </>
  );
}

window.ProcessingScreen = ProcessingScreen;
