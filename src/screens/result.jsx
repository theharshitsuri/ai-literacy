// Result — the centerpiece. Full-page report with level + job personalization.

function ResultScreen({ tweaks, answers, jobId, jobOther, onEmail, onBack, onWorkplace }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const score = window.scoreAnswers(answers);
  const level = window.levelFor(score);
  const job = window.JOBS.find(j => j.id === jobId) || window.JOBS.find(j => j.id === 'other');
  const pack = window.JOB_PACKS[jobId] || window.JOB_PACKS.other;
  const jobDisplay = jobId === 'other' && jobOther ? jobOther : job.label;
  const tone = tweaks.tone || 'warm';
  const vibeLine = level.vibe[tone] || level.vibe.warm;

  return (
    <>
      <NavBar step={`your result · ${level.name.toLowerCase()}`} onHome={onBack} />

      {/* HERO — the identity block */}
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
                margin: 0,
                textWrap: 'balance',
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
                <div style={{
                  fontSize: 100, lineHeight: 1,
                  color: level.hex,
                  marginBottom: 8,
                }}>{level.glyph}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>YOU ARE HERE</div>
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
                      borderRadius: 4,
                      marginBottom: 3,
                    }}>
                      <span style={{ fontSize: 18, color: lv.hex, width: 20 }}>{lv.glyph}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: here ? 600 : 400 }}>
                        {lv.name}
                      </span>
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

      {/* STRENGTHS / GAPS */}
      <Section>
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 80px)', paddingBottom: 'clamp(40px, 6vw, 60px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 24 }}>
            · PART I · YOUR PATTERN ·
          </div>
          <div className="two-col">
            <div>
              <h3 style={{ fontFamily: serifStack, fontWeight: 400, fontSize: 28, letterSpacing: '-0.01em', margin: '0 0 14px', color: 'var(--ok)' }}>
                3 strengths
              </h3>
              {level.strengths.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: '1px dashed var(--line)',
                  alignItems: 'baseline',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ok)' }}>0{i+1}</span>
                  <span style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.35 }}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ fontFamily: serifStack, fontWeight: 400, fontSize: 28, letterSpacing: '-0.01em', margin: '0 0 14px', color: 'var(--bad)' }}>
                3 gaps to close
              </h3>
              {level.gaps.map((g, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: '1px dashed var(--line)',
                  alignItems: 'baseline',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--bad)' }}>0{i+1}</span>
                  <span style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.35 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* FIRST WIN — the hero prompt */}
      <Section bg="var(--ink)" style={{ color: 'var(--paper)' }}>
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(60px, 8vw, 90px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: '#a9a392', textTransform: 'uppercase', marginBottom: 20 }}>
            · PART II · YOUR FIRST WIN · for {jobDisplay.toLowerCase()} ·
          </div>
          <h3 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(30px, 4.5vw, 52px)',
            letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
            color: 'var(--paper)',
            textWrap: 'balance',
          }}>
            {pack.firstWinTitle}
          </h3>
          <p style={{ marginTop: 18, fontSize: 16, color: '#a9a392', maxWidth: 580, lineHeight: 1.5 }}>
            Copy this prompt into ChatGPT, Claude, or Gemini. Replace the bracketed bits with your real situation. Ship it today.
          </p>

          <div style={{
            marginTop: 32,
            padding: 'clamp(22px, 3vw, 32px)',
            background: '#0f0e0c',
            border: '1px solid #3a352c',
            borderRadius: 10,
            fontFamily: 'var(--mono)', fontSize: 14,
            color: '#d8d1bf',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 12, right: 14,
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.14em', color: '#857e6f',
              textTransform: 'uppercase',
            }}>copy ↘</div>
            <span style={{ color: 'var(--accent)' }}>→ </span>{pack.firstWin}
          </div>
        </Container>
      </Section>

      {/* 7-DAY PLAN */}
      <Section>
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(40px, 6vw, 60px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · PART III · 7-DAY PLAN ·
          </div>
          <h3 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
            maxWidth: 700, textWrap: 'balance',
          }}>
            One week. One small action a day. Real change.
          </h3>
          <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-2)', maxWidth: 640, lineHeight: 1.45 }}>
            Built for a {level.name.toLowerCase()} who's {jobDisplay.toLowerCase()}. Don't skip ahead. Total time across all 7 days: under an hour.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {level.plan.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '18px 22px',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 8,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: level.hex, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: serifStack, fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
                  fontSize: 22, fontWeight: 400,
                  flexShrink: 0,
                }}>{p.d}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                    DAY {p.d}
                  </div>
                  <div style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.35 }}>{p.t}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11,
                  letterSpacing: '0.08em',
                  color: 'var(--muted)',
                  padding: '5px 10px',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  background: 'var(--paper)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>{p.w}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* JOB-SPECIFIC PROMPTS */}
      <Section bg="var(--paper-2)">
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(60px, 8vw, 90px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · PART IV · 5 PROMPTS · for {pack.display} ·
          </div>
          <h3 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
            maxWidth: 760, textWrap: 'balance',
          }}>
            Five prompts you can actually use this week.
          </h3>
          <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-2)', maxWidth: 620, lineHeight: 1.45 }}>
            Not generic AI tips — prompts built for the work you actually do. Copy, edit the brackets, paste.
          </p>

          <div className="prompt-grid" style={{ marginTop: 32 }}>
            {pack.prompts.map((p, i) => (
              <div key={i} style={{
                padding: 'clamp(20px, 2.5vw, 28px)',
                background: 'var(--paper)',
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
                  background: 'var(--paper-2)',
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

      {/* SAFETY RULE */}
      <Section>
        <Container size="md" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(40px, 6vw, 60px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            · PART V · THE ONE RULE ·
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
            }}>⚠ SAFETY</div>

            <h3 style={{
              fontFamily: serifStack, fontWeight: 400,
              fontSize: 'clamp(24px, 3vw, 34px)',
              letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0,
              textWrap: 'balance',
            }}>
              {level.safetyRule}
            </h3>
            <p style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, margin: '14px 0 0' }}>
              {pack.safetyAdd}
            </p>
          </div>
        </Container>
      </Section>

      {/* WORKPLACE TEASER — the optional job-specific pivot */}
      <Section bg="var(--paper-2)">
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 90px)', paddingBottom: 'clamp(60px, 8vw, 90px)' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(20px, 3vw, 40px)',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'clamp(28px, 4vw, 48px)',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            position: 'relative',
          }}>
            <CornerTicks />
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                · OPTIONAL · AT WORK ·
              </div>
              <h3 style={{
                fontFamily: serifStack, fontWeight: 400,
                fontSize: 'clamp(28px, 4vw, 44px)',
                letterSpacing: '-0.02em', lineHeight: 1.08, margin: 0,
                textWrap: 'balance',
              }}>
                Find out how to use AI <span style={{ color: 'var(--accent)', fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>in your job</span>.
              </h3>
              <p style={{ marginTop: 14, fontSize: 16, color: 'var(--ink-2)', maxWidth: 540, lineHeight: 1.45 }}>
                You're an {level.name}. Your job is {jobDisplay.toLowerCase()}. See what that combination actually looks like on Monday — 5 prompts, a workweek plan, and 3 risks that matter at work.
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <BigButton onClick={onWorkplace} variant="ink">
                Show me →
              </BigButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA — newsletter signup */}
      <Section bg="var(--ink)" style={{ color: 'var(--paper)' }}>
        <Container size="md" style={{ paddingTop: 'clamp(60px, 8vw, 100px)', paddingBottom: 'clamp(60px, 8vw, 100px)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', color: '#a9a392', textTransform: 'uppercase', marginBottom: 16 }}>
            · ONE MORE THING ·
          </div>
          <h2 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(34px, 5vw, 62px)',
            letterSpacing: '-0.025em', lineHeight: 1, margin: 0,
            color: 'var(--paper)',
            textWrap: 'balance',
          }}>
            Want one <span style={{ color: 'var(--accent)', fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>bespoke prompt</span> every week?
          </h2>
          <p style={{ marginTop: 22, fontSize: 16, color: '#a9a392', maxWidth: 520, margin: '22px auto 0', lineHeight: 1.5 }}>
            A weekly 5-minute read with one prompt to try, one thing not to do, and one thing changing in AI this week.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <BigButton onClick={onEmail} variant="paper">Send me the weekly — free first month</BigButton>
            <BigButton onClick={onBack} variant="outline" style={{ background: 'transparent', color: 'var(--paper)', borderColor: '#3a352c' }} arrow={false}>Start over</BigButton>
          </div>
          <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', color: '#857e6f', textTransform: 'uppercase' }}>
            $9/mo after · unsubscribe anytime
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.ResultScreen = ResultScreen;
