// Workplace — the optional "now apply this at work" upsell path.
// Pivots from general AI literacy to job-specific use. Uses the same level + job data.

function WorkplaceScreen({ tweaks, answers, jobId, jobOther, onBack, onBuy }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const score = window.scoreAnswers(answers || {});
  const level = window.levelFor(score);
  const pack = window.JOB_PACKS[jobId] || window.JOB_PACKS.other;
  const job = window.JOBS.find(j => j.id === jobId) || window.JOBS.find(j => j.id === 'other');
  const jobDisplay = jobId === 'other' && jobOther ? jobOther : job.label;
  const accent = level.hex;

  // Per-level framing for "what this looks like at work"
  const WORK_FRAME = {
    newcomer: {
      promise: 'The first real win for a newcomer at work is one small automation. Not a workflow. One email. One doc. One meeting note.',
      risks:   ['Don\'t paste anything sensitive (client names, salary, internal links)', 'Assume every first output is wrong until you verify it', 'Tell your manager you\'re experimenting — don\'t be sneaky about it'],
    },
    curious: {
      promise: "You've used AI. Now make it earn its keep at work. One repeating task — templated, fast, reliable.",
      risks:   ['One tool is not enough — try Claude next to ChatGPT this week', 'Never ship AI-written content without a human read-through', 'Keep a "what worked / what didn\'t" note for 2 weeks'],
    },
    user: {
      promise: "You're past the beginner cliff. Your next jump at work is systems: reusable prompts, checked outputs, knowing when to not use AI.",
      risks:   ['Build an eval set before you trust a workflow in production', 'Document your prompt library — future you will forget', 'Know what your company\'s AI policy actually says'],
    },
    ready: {
      promise: "You don't need more prompts. You need to turn your individual fluency into team leverage — shared prompts, shared evals, shared tool choices.",
      risks:   ['Lead by showing, not mandating', 'Measure before/after or it didn\'t happen', 'Stay skeptical of your own taste — other roles fail differently'],
    },
  };
  const frame = WORK_FRAME[level.id] || WORK_FRAME.curious;

  // A tiny "week at work" — 5 workdays, level-aware.
  const WORK_WEEK = {
    newcomer: [
      ['Mon', 'Rewrite your next status update in ChatGPT. Keep the voice, fix the length.'],
      ['Tue', 'Summarize a long thread or doc you\'re dreading.'],
      ['Wed', 'Ask AI to explain a term from your role you half-understand.'],
      ['Thu', 'Draft one email you\'ve been putting off.'],
      ['Fri', 'Write down: where did it help? Where did it lie?'],
    ],
    curious: [
      ['Mon', 'Pick one recurring task. Draft a reusable prompt (role · context · format).'],
      ['Tue', 'Run the same prompt in ChatGPT and Claude. Note which wins.'],
      ['Wed', 'Apply it to real work. Measure: how much faster?'],
      ['Thu', 'Fix the prompt based on what went wrong.'],
      ['Fri', 'Save the final version. Name it. It\'s now a tool.'],
    ],
    user: [
      ['Mon', 'Audit one month of your AI history. Find your 3 most-repeated patterns.'],
      ['Tue', 'Template them — prompt · expected format · common failures.'],
      ['Wed', 'Build a 5-example mini eval for your top template.'],
      ['Thu', 'Run Claude vs GPT-5 on that eval. Log differences.'],
      ['Fri', 'Decide: which model for which task — with evidence this time.'],
    ],
    ready: [
      ['Mon', 'Pick one team workflow worth changing. Document the current state.'],
      ['Tue', 'Build a 10-example eval. Get one peer to add examples.'],
      ['Wed', 'Run 2–3 models, capture costs, latency, quality.'],
      ['Thu', 'Write the one-page recommendation — with numbers.'],
      ['Fri', 'Ship the shared prompt. Ask one person to try it. Iterate.'],
    ],
  };
  const week = WORK_WEEK[level.id] || WORK_WEEK.curious;

  return (
    <>
      <NavBar step={`workplace pack · for ${jobDisplay.toLowerCase()}`} onHome={onBack} />

      {/* HERO — pivot */}
      <Section bg="var(--paper-2)">
        <Container size="lg" style={{ paddingTop: 'clamp(32px, 5vw, 60px)', paddingBottom: 'clamp(40px, 6vw, 72px)' }}>
          <div style={{
            display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 24,
          }}>
            <span>∙ PART VI · AT WORK ∙</span>
            <span style={{ color: 'var(--line)' }}>/</span>
            <span>LEVEL · {level.name}</span>
            <span style={{ color: 'var(--line)' }}>/</span>
            <span style={{ color: 'var(--accent)' }}>JOB · {jobDisplay}</span>
          </div>

          <h1 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(44px, 7vw, 92px)',
            lineHeight: 0.96, letterSpacing: '-0.03em',
            margin: 0, maxWidth: 980, textWrap: 'balance',
          }}>
            Now let's put this <span style={{ color: accent, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>to work</span> — in your job.
          </h1>
          <p style={{
            marginTop: 22, fontSize: 'clamp(16px, 1.4vw, 19px)',
            lineHeight: 1.5, color: 'var(--ink-2)',
            maxWidth: 640, textWrap: 'pretty',
          }}>
            The diagnostic told you where <em>you</em> stand. This page is about where AI actually fits into <strong>{jobDisplay.toLowerCase()}</strong> — and what a {level.name.toLowerCase()} should (and shouldn't) try on Monday.
          </p>

          {/* Promise card */}
          <div style={{
            marginTop: 32,
            padding: 'clamp(22px, 3vw, 32px)',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderLeft: `3px solid ${accent}`,
            borderRadius: 8,
            maxWidth: 760,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              THE PIVOT FOR A {level.name.toUpperCase()}
            </div>
            <div style={{
              fontFamily: serifStack, fontSize: 22, lineHeight: 1.35,
              fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
              color: 'var(--ink)', textWrap: 'pretty',
            }}>
              {frame.promise}
            </div>
          </div>
        </Container>
      </Section>

      {/* 5 WORKPLACE PROMPTS */}
      <Section>
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(40px, 6vw, 60px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · 5 PROMPTS · {pack.display.toUpperCase()} ·
          </div>
          <h3 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
            maxWidth: 760, textWrap: 'balance',
          }}>
            Five prompts for {pack.display.toLowerCase()}. Paste, edit the brackets, ship.
          </h3>

          <div className="prompt-grid" style={{ marginTop: 32 }}>
            {pack.prompts.map((p, i) => (
              <div key={i} style={{
                padding: 'clamp(20px, 2.5vw, 28px)',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                    PROMPT 0{i+1}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                    copy ↘
                  </div>
                </div>
                <h4 style={{
                  fontFamily: serifStack, fontWeight: 400,
                  fontSize: 22, letterSpacing: '-0.01em',
                  margin: '0 0 12px', lineHeight: 1.15,
                }}>{p.title}</h4>
                <div style={{
                  padding: '14px 16px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.55,
                  color: 'var(--ink-2)',
                  flex: 1,
                }}>{p.prompt}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* A WEEK AT WORK */}
      <Section bg="var(--paper-2)">
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(60px, 8vw, 90px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · A WEEK AT WORK ·
          </div>
          <h3 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(30px, 4.5vw, 48px)',
            letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
            maxWidth: 760, textWrap: 'balance',
          }}>
            Five workdays. Small, useful, real.
          </h3>
          <p style={{ marginTop: 14, fontSize: 16, color: 'var(--ink-2)', maxWidth: 620, lineHeight: 1.45 }}>
            Built for a {level.name.toLowerCase()} doing {jobDisplay.toLowerCase()}. If any day feels too small — good. That means you'll actually do it.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {week.map(([d, t], i) => (
              <div key={d} style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '18px 22px',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 8,
              }}>
                <div style={{
                  width: 60, textAlign: 'center',
                  fontFamily: 'var(--mono)', fontSize: 11,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: accent, fontWeight: 700,
                  flexShrink: 0,
                }}>{d}</div>
                <div style={{ flex: 1, fontSize: 16, color: 'var(--ink)', lineHeight: 1.35 }}>{t}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* THREE RISKS AT WORK */}
      <Section>
        <Container size="md" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(40px, 6vw, 60px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · DON'T SKIP ·
          </div>
          <div style={{
            padding: 'clamp(28px, 4vw, 44px)',
            background: '#fff6ec',
            border: '2px solid var(--warn)',
            borderRadius: 10,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -14, left: 20,
              padding: '4px 10px',
              background: 'var(--warn)', color: '#fff',
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              borderRadius: 3,
            }}>⚠ 3 RULES AT WORK</div>

            {frame.risks.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderBottom: i === frame.risks.length - 1 ? 'none' : '1px dashed var(--warn)',
                alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--warn)', fontWeight: 700, letterSpacing: '0.06em' }}>0{i+1}</span>
                <span style={{ flex: 1, fontSize: 16, color: 'var(--ink)', lineHeight: 1.4 }}>{r}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA — the pack */}
      <Section bg="var(--ink)" style={{ color: 'var(--paper)' }}>
        <Container size="md" style={{ paddingTop: 'clamp(60px, 8vw, 100px)', paddingBottom: 'clamp(60px, 8vw, 100px)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', color: '#a9a392', textTransform: 'uppercase', marginBottom: 16 }}>
            · THE {pack.display.toUpperCase()} PACK ·
          </div>
          <h2 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(34px, 5.5vw, 64px)',
            letterSpacing: '-0.025em', lineHeight: 1, margin: 0,
            color: 'var(--paper)',
            textWrap: 'balance',
          }}>
            Want the <span style={{ color: accent, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>full toolkit</span> for {pack.display.toLowerCase()}?
          </h2>
          <p style={{ marginTop: 22, fontSize: 16, color: '#a9a392', maxWidth: 540, margin: '22px auto 0', lineHeight: 1.5 }}>
            20 ready-to-use prompts, 5 checklists, a printable safety card, and the {level.name.toLowerCase()} → next-level upgrade path — all tuned for {pack.display.toLowerCase()}.
          </p>

          <div style={{
            marginTop: 36, display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            maxWidth: 520, margin: '36px auto 0',
          }}>
            {[
              ['20', 'prompts'],
              ['05', 'checklists'],
              ['01', 'safety card'],
            ].map(([k, v]) => (
              <div key={v} style={{
                padding: '14px 10px',
                border: '1px solid #3a352c',
                borderRadius: 6,
              }}>
                <div style={{ fontFamily: serifStack, fontSize: 34, color: accent, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>{k}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: '#a9a392', textTransform: 'uppercase', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <BigButton onClick={onBuy} variant="paper">
              Grab the {pack.display} pack — $19
            </BigButton>
            <BigButton onClick={onBack} variant="outline" arrow={false} style={{ background: 'transparent', color: 'var(--paper)', borderColor: '#3a352c' }}>
              Back to my result
            </BigButton>
          </div>
          <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', color: '#857e6f', textTransform: 'uppercase' }}>
            one-time · instant download · 30-day refund
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.WorkplaceScreen = WorkplaceScreen;
