// Newsletter confirmation page — post-signup.
function ConfirmScreen({ tweaks, onRestart, onOpenEmail }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  return (
    <>
      <NavBar step="subscribed · check your inbox" onHome={onRestart} />

      <Section>
        <Container size="sm" style={{ paddingTop: 'clamp(40px, 6vw, 80px)', paddingBottom: 'clamp(60px, 8vw, 100px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 36 }}>
            <div style={{
              width: 180, height: 120,
              border: '1px solid var(--ink)',
              borderRadius: 4,
              position: 'relative',
              background: 'var(--paper-2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                clipPath: 'polygon(0 0, 100% 0, 50% 55%)',
                background: 'rgba(20,17,13,0.06)',
                borderBottom: '1px solid var(--line)',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22,
                boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.2)',
              }}>a</div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--muted)', marginBottom: 12 }}>
              ∙ DELIVERED ∙
            </div>
            <h1 style={{
              fontFamily: serifStack, fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 400,
              margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1,
            }}>
              Check your inbox.
            </h1>
            <p style={{
              fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5,
              maxWidth: 440, margin: '0 auto',
            }}>
              Your full 7-day plan, your personalized profile PDF, and your first weekly email are on their way.
            </p>
          </div>

          <div style={{ marginTop: 40, border: '1px solid var(--line)', borderRadius: 8, background: 'rgba(255,255,255,0.4)', padding: '22px 22px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', marginBottom: 14, textTransform: 'uppercase' }}>WHAT TO EXPECT</div>
            {[
              ['Today',   'Full profile + 7-day plan + safety guide (PDF)'],
              ['Day 2',   'One prompt, written for your job — to try today'],
              ['Day 4',   "When NOT to use AI — mistakes to avoid"],
              ['Day 6',   'A second worked example + real-world results'],
              ['Day 8',   'Reply & tell us what you tried'],
            ].map(([k, v]) => (
              <MetaRow key={k} label={k} value={v} />
            ))}
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <BigButton onClick={onOpenEmail} variant="ink" style={{ width: '100%' }}>
              Peek at your first email
            </BigButton>
            <BigButton onClick={onRestart} variant="outline" style={{ width: '100%' }}>
              Start over
            </BigButton>
          </div>

          <div style={{
            marginTop: 30, textAlign: 'center',
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
            color: 'var(--muted)', textTransform: 'uppercase',
          }}>
            areyou<span style={{ color: 'var(--accent)' }}>ai</span>ready.net · unsubscribe anytime
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.ConfirmScreen = ConfirmScreen;
