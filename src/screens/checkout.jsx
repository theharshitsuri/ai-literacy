// $1 Stripe-style checkout, responsive.
function CheckoutScreen({ onComplete, onBack }) {
  const [method, setMethod] = React.useState('apple');
  const [loading, setLoading] = React.useState(false);

  const pay = () => {
    setLoading(true);
    setTimeout(() => onComplete(), 900);
  };

  return (
    <>
      <NavBar step="$1 checkout · secure" onHome={onBack} />

      <Section>
        <Container size="sm" style={{ paddingTop: 'clamp(32px, 5vw, 60px)', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)',
            padding: 0, marginBottom: 24, letterSpacing: '0.08em',
          }}>← cancel & go back</button>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 22,
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
            color: 'var(--muted)',
          }}>
            <Wordmark size={12} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: 'var(--ok)', borderRadius: '50%', display: 'inline-block' }} />
              SECURE · 256-bit
            </span>
          </div>

          <div style={{ marginTop: 10, marginBottom: 26 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              One-time payment
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(64px, 10vw, 96px)', lineHeight: 1, fontWeight: 400 }}>$1</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>.00 USD</span>
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 8 }}>
              AI literacy diagnostic · personalized result · 7-day plan · safety guide
            </div>
          </div>

          {/* line-items */}
          <div style={{
            border: '1px solid var(--line)', borderRadius: 8,
            background: 'rgba(255,255,255,0.4)',
            padding: '16px 16px 6px',
            marginBottom: 24,
          }}>
            {[
              ['Diagnostic quiz (8 Qs)', '$0.00'],
              ['Level × job personalized profile', '$0.00'],
              ['5 copy-paste prompts for your job', '$0.00'],
              ['Weekly newsletter (first month)', 'free'],
            ].map(([k, v]) => (
              <MetaRow key={k} label={k} value={v} />
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
              padding: '14px 0 6px', textTransform: 'uppercase',
            }}>
              <span style={{ color: 'var(--ink)' }}>TOTAL DUE</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>$1.00</span>
            </div>
          </div>

          {/* payment method picker */}
          <div style={{ marginBottom: 10, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>Pay with</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <PayTile on={method==='apple'} onClick={() => setMethod('apple')} label="Apple Pay" glyph="" />
            <PayTile on={method==='google'} onClick={() => setMethod('google')} label="Google Pay" glyph="G" />
          </div>

          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--muted)',
            padding: '6px 0', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span>or card</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <div style={{
            border: '1px solid var(--line)', borderRadius: 8,
            padding: 14, marginBottom: 10,
            display: 'flex', gap: 10, alignItems: 'center',
            background: 'rgba(255,255,255,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--muted)', letterSpacing: '0.12em' }}>
              1234 1234 1234 1234
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <div style={{ width: 28, height: 18, borderRadius: 2, background: '#1a1f71' }} />
              <div style={{ width: 28, height: 18, borderRadius: 2, background: '#eb001b' }} />
            </div>
          </div>
          <div style={{
            border: '1px solid var(--line)', borderRadius: 8,
            padding: 14, marginBottom: 24,
            background: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--muted)',
          }}>
            email for receipt · you@work.com
          </div>

          <BigButton onClick={pay} variant="ink" arrow={!loading} style={{ width: '100%' }}>
            {loading ? 'Processing…' : 'Pay $1 & begin'}
          </BigButton>

          <div style={{
            marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center',
          }}>
            powered by Stripe · refunded instantly on reply
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

function PayTile({ on, onClick, label, glyph }) {
  return (
    <button onClick={onClick} style={{
      border: on ? '2px solid var(--ink)' : '1px solid var(--line)',
      borderRadius: 8, padding: '16px 12px',
      background: on ? 'var(--ink)' : 'rgba(255,255,255,0.4)',
      color: on ? 'var(--paper)' : 'var(--ink)',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 500,
    }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{glyph}</span>
      <span>{label}</span>
    </button>
  );
}

window.CheckoutScreen = CheckoutScreen;
