// Landing — responsive 2-column hero on desktop, single column on mobile.

function LandingScreen({ tweaks, onStart }) {
  const h = window.HEADLINES.find(x => x.id === tweaks.headline) || window.HEADLINES[0];
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const serifWeight = tweaks.typePair === 'sans' ? 700 : 400;

  return (
    <>
      <NavBar step="enter" onHome={() => {}} />

      {/* HERO */}
      <Section>
        <Container size="xl" style={{ paddingTop: 'clamp(40px, 8vw, 100px)', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div className="hero-grid">
            {/* LEFT — headline column */}
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
                <Tag accent>ISSUE — 001</Tag>
                <Tag>∙ 90 SECONDS ∙</Tag>
              </div>

              <div style={{
                fontFamily: 'var(--mono)', fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.14em',
                color: 'var(--muted)', marginBottom: 18,
              }}>{h.pre}</div>

              <h1 style={{
                fontFamily: serifStack,
                fontSize: 'clamp(48px, 7vw, 96px)',
                lineHeight: 0.96, fontWeight: serifWeight,
                letterSpacing: '-0.025em',
                margin: 0,
                color: 'var(--ink)',
                textWrap: 'balance',
              }}>
                {h.main}
              </h1>

              <p style={{
                marginTop: 24,
                fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.5,
                color: 'var(--ink-2)',
                maxWidth: 520,
                textWrap: 'pretty',
              }}>{h.sub}</p>

              {/* CTA */}
              <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                {tweaks.paywall ? (
                  <BigButton onClick={onStart} variant="ink">
                    Begin diagnostic — $1
                  </BigButton>
                ) : (
                  <BigButton onClick={onStart} variant="ink">
                    Begin diagnostic — free
                  </BigButton>
                )}
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11,
                  color: 'var(--muted)', letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {tweaks.paywall ? 'Apple Pay · Instant refund' : '8 questions · no signup'}
                </div>
              </div>

              {/* Social proof strip */}
              <div style={{
                marginTop: 40, padding: '18px 0',
                borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex' }}>
                  {['#e24a1a', '#2d6a4f', '#b45309', '#14110d'].map((c, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c, border: '2px solid var(--paper)',
                      marginLeft: i === 0 ? 0 : -10,
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  <strong style={{ color: 'var(--ink)' }}>4,218</strong> people took it this month
                </div>
                <span style={{ color: 'var(--line)' }}>·</span>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>avg. completion <strong style={{ color: 'var(--ink)' }}>2m 04s</strong></div>
              </div>
            </div>

            {/* RIGHT — diagnostic card */}
            <div>
              <div style={{
                position: 'relative',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 'clamp(24px, 3vw, 40px)',
                boxShadow: '0 30px 60px rgba(20,17,13,0.08)',
              }}>
                <CornerTicks />

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 24,
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)' }}>
                    SPECIMEN REPORT · FRONT
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em' }}>
                    v.1
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontFamily: 'var(--serif)', fontStyle: 'italic',
                    fontSize: 42, lineHeight: 1,
                    boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.2)',
                  }}>?</div>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)' }}>
                      YOUR LEVEL
                    </div>
                    <div style={{ fontFamily: serifStack, fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {'{ one of four }'}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6, marginBottom: 24,
                }}>
                  {Object.values(window.LEVELS).map(lv => (
                    <div key={lv.id} style={{
                      padding: '10px 6px',
                      textAlign: 'center',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.5)',
                    }}>
                      <div style={{ fontSize: 18, color: lv.hex }}>{lv.glyph}</div>
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: 8,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: 'var(--muted)', marginTop: 4,
                      }}>{lv.name.replace('AI ', '')}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 10,
                }}>WHAT YOU GET</div>
                {[
                  ['01', 'Your AI literacy level — 1 of 4'],
                  ['02', '3 strengths · 3 gaps (no fluff)'],
                  ['03', 'A 7-day plan to level up'],
                  ['04', '5 prompts you can actually use'],
                  ['05', 'One safety rule that matters'],
                ].map(([n, t]) => (
                  <div key={n} style={{
                    display: 'flex', gap: 10, padding: '10px 0',
                    borderBottom: '1px dashed var(--line)',
                    alignItems: 'baseline',
                  }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>{n}</span>
                    <span style={{ flex: 1, fontSize: 14, color: 'var(--ink)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* WHY IT MATTERS */}
      <Section bg="var(--paper-2)">
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 100px)', paddingBottom: 'clamp(60px, 8vw, 100px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            · SECTION 001 · THE PROBLEM ·
          </div>
          <h2 style={{
            fontFamily: serifStack, fontWeight: serifWeight,
            fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.02em',
            lineHeight: 1.05, margin: 0, maxWidth: 820,
            textWrap: 'balance',
          }}>
            AI went from novelty to infrastructure in 18 months. Almost nobody <span style={{ fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal', color: 'var(--accent)' }}>actually knows</span> where they stand.
          </h2>
          <p style={{ marginTop: 24, fontSize: 17, color: 'var(--ink-2)', maxWidth: 640, lineHeight: 1.5 }}>
            You don't need a $499 bootcamp. You need an honest read on what you already know, what you're missing, and the two habits that close the gap for a real person — not a "power user."
          </p>

          <div className="stats-grid" style={{ marginTop: 48 }}>
            {[
              { k: '800M', v: 'people have used ChatGPT at least once', s: 'OpenAI, 2025' },
              { k: '37%',  v: "of AI users have never verified an answer — they don't know it lies", s: 'Pew, 2025' },
              { k: '1 in 4', v: 'adults have never tried AI. The gap widens every month.', s: 'Reuters, 2026' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '24px 20px',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: serifStack, fontSize: 52, color: 'var(--accent)',
                  lineHeight: 1, letterSpacing: '-0.03em', fontWeight: serifWeight,
                }}>{s.k}</div>
                <div style={{ marginTop: 12, fontSize: 15, color: 'var(--ink)', lineHeight: 1.35 }}>{s.v}</div>
                <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>— {s.s}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* TESTIMONIALS */}
      <Section>
        <Container size="lg" style={{ paddingTop: 'clamp(60px, 8vw, 100px)', paddingBottom: 'clamp(60px, 8vw, 100px)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 28 }}>
            · SECTION 002 · FIELD NOTES ·
          </div>
          <div className="testimonial-grid">
            {[
              { q: 'Told me I was "AI Curious." I was offended, then I had a prompt I actually used by Friday.', w: 'Maya R.', r: 'Took it in March' },
              { q: "I'd used ChatGPT like five times. It showed me I was missing the basics — hallucinations, Claude, how to verify. Clicked.", w: 'Deon P.', r: 'Took it in February' },
              { q: "I'm 67. I thought I was too late to learn this stuff. I wasn't. It gave me a plan I could actually follow.", w: 'Margaret L.', r: 'Took it in January' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: 28,
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: serifStack, fontSize: 20, lineHeight: 1.35,
                  fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal',
                  color: 'var(--ink)',
                  textWrap: 'pretty',
                }}>"{t.q}"</div>
                <div style={{
                  marginTop: 16,
                  fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}>
                  — {t.w} · {t.r}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FINAL CTA */}
      <Section bg="var(--ink)" style={{ color: 'var(--paper)' }}>
        <Container size="md" style={{ paddingTop: 'clamp(60px, 8vw, 100px)', paddingBottom: 'clamp(60px, 8vw, 100px)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', color: '#a9a392', textTransform: 'uppercase', marginBottom: 16 }}>
            · READY? ·
          </div>
          <h2 style={{
            fontFamily: serifStack, fontWeight: serifWeight,
            fontSize: 'clamp(36px, 6vw, 72px)',
            letterSpacing: '-0.025em', lineHeight: 1, margin: 0,
            color: 'var(--paper)',
            textWrap: 'balance',
          }}>
            Find out where you stand — <span style={{ color: 'var(--accent)', fontStyle: tweaks.typePair !== 'sans' ? 'italic' : 'normal' }}>in 90 seconds</span>.
          </h2>
          <p style={{ marginTop: 22, fontSize: 16, color: '#a9a392', maxWidth: 520, margin: '22px auto 0', lineHeight: 1.5 }}>
            Honest answer. Personalized plan. No bootcamp. No bullshit.
          </p>
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}>
            <BigButton onClick={onStart} variant="paper" style={{ minWidth: 280 }}>
              {tweaks.paywall ? 'Begin diagnostic — $1' : 'Begin diagnostic — free'}
            </BigButton>
          </div>
          <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', color: '#857e6f', textTransform: 'uppercase' }}>
            {tweaks.paywall ? 'Apple Pay / Google Pay · Not useful? Instant refund.' : 'No signup to start · 8 questions'}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.LandingScreen = LandingScreen;
