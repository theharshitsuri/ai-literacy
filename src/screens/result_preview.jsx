// ResultPreview — free teaser shown after quiz + job selection.
// Reveals score + level for free; blurs the actionable breakdown behind a $1 gate.
function ResultPreviewScreen({ tweaks, answers, jobId, jobOther, onUnlock, onBack }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const score = window.scoreAnswers(answers);
  const level = window.levelFor(score);
  const job = window.JOBS.find(j => j.id === jobId) || window.JOBS.find(j => j.id === 'other');
  const jobDisplay = jobId === 'other' && jobOther ? jobOther : job.label;
  const tone = tweaks.tone || 'warm';
  const vibeLine = level.vibe[tone] || level.vibe.warm;

  return (
    <>
      <NavBar step={`your result · ${level.name.toLowerCase()}`} onHome={onBack} />

      {/* HERO — identical to full result, shown free */}
      <Section bg="var(--paper-2)">
        <Container size="lg" style={{ paddingTop: 'clamp(32px, 5vw, 60px)', paddingBottom: 'clamp(40px, 6vw, 72px)' }}>
          <div style={{
            display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 24,
          }}>
            <span>∙ YOUR RESULT ∙</span>
            <span style={{ color: 'var(--line)' }}>/</span>
            <span>SCORE {score} / 30</span>
            <span style={{ color: 'var(--line)' }}>/</span>
            <span style={{ color: 'var(--accent)' }}>{level.percentile}</span>
          </div>

          <div className="result-hero">
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                fontFamily: 'var(--mono)', fontSize: 11,
                letterSpacing: '0.14em', color: 'var(--muted)',
                textTransform: 'uppercase', marginBottom: 12,
              }}>
                <span>Level 0{level.rank} of 04</span>
                <span>·</span>
                <span>{level.tag}</span>
              </div>

              <h1 style={{
                fontFamily: serifStack, fontWeight: 400,
                fontSize: 'clamp(52px, 9vw, 120px)',
                lineHeight: 0.92, letterSpacing: '-0.035em',
                margin: 0, textWrap: 'balance',
              }}>
                You're an <span style={{ color: level.hex, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>{level.name}</span>.
              </h1>

              <p style={{
                marginTop: 24, fontSize: 'clamp(16px, 1.4vw, 19px)',
                lineHeight: 1.5, color: 'var(--ink-2)',
                maxWidth: 620, textWrap: 'pretty',
              }}>{level.oneLiner}</p>

              <div style={{
                marginTop: 22, padding: '14px 18px',
                border: '1px solid var(--line)',
                borderLeft: `3px solid ${level.hex}`,
                background: 'var(--paper)', borderRadius: 6,
                fontFamily: serifStack, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
                fontSize: 18, color: 'var(--ink)', maxWidth: 560, lineHeight: 1.4,
              }}>
                "{vibeLine}"
              </div>
            </div>

            {/* Scorecard */}
            <div style={{
              padding: 'clamp(22px, 3vw, 36px)',
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              position: 'relative',
            }}>
              <CornerTicks />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 100, lineHeight: 1, color: level.hex, marginBottom: 8 }}>
                  {level.glyph}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  YOU ARE HERE
                </div>
                <div style={{ fontFamily: serifStack, fontSize: 24, letterSpacing: '-0.02em' }}>
                  {level.name}
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                {Object.values(window.LEVELS).map(lv => {
                  const here = lv.id === level.id;
                  return (
                    <div key={lv.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px',
                      background: here ? 'var(--ink)' : 'transparent',
                      color: here ? 'var(--paper)' : 'var(--ink)',
                      border: here ? '1px solid var(--ink)' : '1px solid transparent',
                      borderRadius: 4, marginBottom: 3,
                    }}>
                      <span style={{ fontSize: 18, color: lv.hex, width: 20 }}>{lv.glyph}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: here ? 600 : 400 }}>{lv.name}</span>
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 10,
                        color: here ? '#a9a392' : 'var(--muted)',
                        letterSpacing: '0.08em',
                      }}>{lv.range[0]}–{lv.range[1]}</span>
                    </div>
                  );
                })}
              </div>

              <MetaRow label="YOUR SCORE" value={`${score} / 30`} style={{ marginTop: 14 }} />
              <MetaRow label="JOB CONTEXT" value={jobDisplay.toLowerCase()} />
              <MetaRow label="TIME INVESTED" value="≈ 2 min" />
            </div>
          </div>
        </Container>
      </Section>

      {/* LOCKED CONTENT TEASER */}
      <Section>
        <Container size="lg" style={{ paddingTop: 'clamp(48px, 6vw, 72px)', paddingBottom: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · WHAT'S IN YOUR FULL REPORT ·
          </div>

          {/* Blurred preview with gradient fade + lock overlay */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.85 }}>
              {/* Strengths preview */}
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ fontFamily: serifStack, fontWeight: 400, fontSize: 26, margin: '0 0 12px', color: 'var(--ok)' }}>3 strengths</h3>
                {level.strengths.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: '11px 0',
                    borderBottom: '1px dashed var(--line)', alignItems: 'baseline',
                  }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ok)' }}>0{i + 1}</span>
                    <span style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.35 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* 7-day plan preview (first 2 days) */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontFamily: serifStack, fontWeight: 400, fontSize: 26, margin: '0 0 12px' }}>
                  7-day plan — for {jobDisplay.toLowerCase()}
                </h3>
                {level.plan.slice(0, 2).map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', background: 'var(--paper-2)',
                    border: '1px solid var(--line)', borderRadius: 8, marginBottom: 6,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: level.hex, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: serifStack, fontSize: 20, flexShrink: 0,
                    }}>{p.d}</div>
                    <div style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.35 }}>{p.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient fade + lock CTA */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 0%, var(--paper) 55%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: 8,
            }}>
              <div style={{
                textAlign: 'center',
                padding: '24px 28px',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 8px 32px rgba(20,17,13,0.06)',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  · LOCKED ·
                </div>
                <div style={{ fontFamily: serifStack, fontSize: 20, letterSpacing: '-0.01em', marginBottom: 6 }}>
                  Your full breakdown is ready.
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 18 }}>
                  3 strengths · 3 gaps · 7-day plan · 5 prompts for {jobDisplay.toLowerCase()} · first win today
                </div>
                <BigButton onClick={onUnlock} variant="ink">
                  Unlock full report — $1 →
                </BigButton>
                <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Apple Pay · Google Pay · Instant refund if not useful
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.ResultPreviewScreen = ResultPreviewScreen;
