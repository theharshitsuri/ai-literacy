// Welcome email (E0) preview — responsive inbox layout.
function EmailScreen({ tweaks, answers, jobId, jobOther, onBack, onOpenNewsletter }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const score = window.scoreAnswers(answers || {});
  const level = window.levelFor(score);
  const pack = window.JOB_PACKS[jobId] || window.JOB_PACKS.other;
  const job = window.JOBS.find(j => j.id === jobId) || window.JOBS.find(j => j.id === 'other');
  const jobDisplay = jobId === 'other' && jobOther ? jobOther : job.label;
  const accent = level.hex;

  return (
    <>
      <NavBar step="welcome email preview" onHome={onBack} />

      <Section bg="var(--paper-2)">
        <Container size="md" style={{ paddingTop: 'clamp(32px, 5vw, 60px)', paddingBottom: 'clamp(60px, 8vw, 100px)' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
            color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 14,
          }}>
            ∙ INBOX PREVIEW · EMAIL 1 OF 7 ∙
          </div>

          {/* Email frame */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
          }}>
            {/* Header bar */}
            <div style={{
              padding: '12px 18px',
              background: '#e1dccc',
              borderBottom: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
            }}>
              <span>← Inbox</span>
              <span>⌃ ⌄ ⎘</span>
            </div>

            {/* Email header */}
            <div style={{ padding: '22px 28px 10px' }}>
              <h1 style={{
                fontFamily: serifStack, fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 500, lineHeight: 1.2,
                margin: '0 0 16px', letterSpacing: '-0.01em',
              }}>
                Your {level.name} profile + 7-day plan inside ↓
              </h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>{level.glyph}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    areyou<span style={{ color: 'var(--accent)' }}>ai</span>ready.net
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    to you · just now ⌄
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '10px 28px 28px', borderTop: '1px solid var(--line)', marginTop: 14 }}>
              <p style={{
                fontFamily: serifStack,
                fontSize: 20, lineHeight: 1.45, fontWeight: 400,
                margin: '22px 0 10px', color: 'var(--ink)',
                fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
              }}>
                Quick note before you close this tab —
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 18px' }}>
                You just finished the diagnostic. Your level is <strong style={{ color: accent }}>{level.name}</strong>
                {' — '}<em>{level.tag}</em>. Here's your real plan, built for <strong>{jobDisplay.toLowerCase()}</strong>.
              </p>

              {/* Attachment card */}
              <div style={{
                border: '1px solid var(--line)', borderRadius: 8,
                background: 'rgba(255,255,255,0.5)',
                padding: '14px 16px', marginBottom: 22,
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <div style={{
                  width: 48, height: 60, borderRadius: 4,
                  background: '#fff', border: '1px solid var(--line)',
                  position: 'relative', flexShrink: 0,
                }}>
                  <div style={{ position: 'absolute', top: 8, left: 6, right: 6, height: 2, background: accent }}/>
                  <div style={{ position: 'absolute', top: 18, left: 6, right: 18, height: 1, background: 'var(--line)' }}/>
                  <div style={{ position: 'absolute', top: 24, left: 6, right: 12, height: 1, background: 'var(--line)' }}/>
                  <div style={{ position: 'absolute', top: 30, left: 6, right: 22, height: 1, background: 'var(--line)' }}/>
                  <div style={{
                    position: 'absolute', bottom: 4, right: 4,
                    fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700,
                    color: accent, letterSpacing: '0.05em',
                  }}>PDF</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>
                    {level.name} playbook for {jobDisplay.toLowerCase()}.pdf
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>
                    PDF · 2.4 MB · 18 pages
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--accent)', padding: '6px 10px' }}>↓</div>
              </div>

              {/* One-liner */}
              <div style={{
                padding: '14px 16px', borderLeft: `3px solid ${accent}`,
                background: 'rgba(255,255,255,0.4)',
                marginBottom: 22, borderRadius: 4,
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: 6 }}>
                  YOUR DIAGNOSTIC
                </div>
                <div style={{
                  fontFamily: serifStack, fontSize: 17, lineHeight: 1.4,
                  fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
                  color: 'var(--ink)',
                }}>
                  "{level.oneLiner}"
                </div>
              </div>

              {/* First win prompt */}
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
                color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8,
              }}>
                TRY THIS TODAY
              </div>
              <div style={{
                background: '#14110d', color: '#d8d1bf',
                padding: '16px 18px',
                borderRadius: 6,
                fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                marginBottom: 22,
              }}>
                <div style={{ color: 'var(--accent)', marginBottom: 6, fontWeight: 600 }}>{pack.firstWinTitle}</div>
                {pack.firstWin}
              </div>

              {/* 7-day plan */}
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
                color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10,
              }}>YOUR 7-DAY PLAN</div>
              <div style={{ marginBottom: 24 }}>
                {level.plan.map((d) => (
                  <div key={d.d} style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '10px 0', borderBottom: '1px dashed var(--line)',
                  }}>
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 11, color: accent, fontWeight: 700,
                      width: 44, flexShrink: 0, letterSpacing: '0.1em',
                    }}>DAY {d.d}</div>
                    <div style={{ flex: 1, fontSize: 14, color: 'var(--ink)', lineHeight: 1.4 }}>{d.t}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{d.w}</div>
                  </div>
                ))}
              </div>

              {/* Safety */}
              <div style={{
                padding: '14px 16px', marginBottom: 22,
                background: '#fff6ec',
                border: '1px solid var(--warn)',
                borderRadius: 6, fontSize: 14, lineHeight: 1.45, color: 'var(--ink)',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--warn)', marginBottom: 6 }}>
                  ⚠ ONE RULE, DON'T SKIP
                </div>
                {level.safetyRule}
              </div>

              {/* What's next */}
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
                color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10,
              }}>WHAT'S COMING</div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '12px 16px', background: 'rgba(255,255,255,0.4)' }}>
                {[
                  ['Day 2', 'A worked example in your workflow'],
                  ['Day 4', 'When NOT to use AI — mistakes & privacy'],
                  ['Day 6', 'A second workflow, one level deeper'],
                  ['Day 8', 'Reply with what you tried — we recalibrate'],
                ].map(([k, v]) => (
                  <MetaRow key={k} label={k} value={v} />
                ))}
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)', margin: '24px 0 10px' }}>
                Reply if the result felt off — we read every one.
              </p>
              <p style={{
                fontFamily: serifStack, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
                fontSize: 18, color: 'var(--ink)', margin: '0 0 6px',
              }}>
                — the AYAIR team
              </p>

              {/* Peek at newsletter */}
              <div style={{
                marginTop: 28, padding: '18px 18px',
                border: '1px dashed var(--ink)', borderRadius: 8,
                background: 'rgba(255,255,255,0.4)',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: 8 }}>
                  BONUS · THIS WEEK'S NEWSLETTER
                </div>
                <div style={{
                  fontFamily: serifStack, fontSize: 22, fontWeight: 400, lineHeight: 1.15,
                  letterSpacing: '-0.01em', margin: '0 0 14px',
                }}>
                  Issue 017, segmented for {level.name.toLowerCase()}s.
                </div>
                <BigButton onClick={onOpenNewsletter} variant="ink">
                  Open this week's issue
                </BigButton>
              </div>

              <div style={{
                marginTop: 30, paddingTop: 16, borderTop: '1px solid var(--line)',
                textAlign: 'center',
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
                color: 'var(--muted)', textTransform: 'uppercase',
              }}>
                areyou<span style={{ color: 'var(--accent)' }}>ai</span>ready.net · one prompt per week · unsubscribe
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.EmailScreen = EmailScreen;
