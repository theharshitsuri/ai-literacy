// Responsive web primitives (no phone frame).
// Adaptive to desktop + phone via fluid sizing, max-width containers, and media queries applied at the CSS level (index.html).

function Tag({ children, mono = true, style = {}, accent = false }) {
  return (
    <span style={{
      fontFamily: mono ? 'var(--mono)' : 'var(--sans)',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      color: accent ? 'var(--accent)' : 'var(--ink-2)',
      padding: '4px 9px',
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--line)'}`,
      borderRadius: 4,
      background: accent ? 'rgba(226,74,26,0.06)' : 'rgba(255,255,255,0.4)',
      display: 'inline-block',
      ...style,
    }}>{children}</span>
  );
}

function MetaRow({ label, value, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline',
      fontFamily: 'var(--mono)', fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '0.14em',
      color: 'var(--muted)',
      borderBottom: '1px dashed var(--line)',
      padding: '7px 0',
      ...style,
    }}>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

function BigButton({ children, onClick, variant = 'ink', style = {}, arrow = true, size = 'lg', disabled = false }) {
  const styles = {
    ink:     { background: 'var(--ink)', color: '#fff', border: '1px solid var(--ink)' },
    accent:  { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
    outline: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink)' },
    ghost:   { background: 'rgba(20,17,13,0.04)', color: 'var(--ink)', border: '1px solid var(--line)' },
    paper:   { background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--ink)' },
  }[variant] || {};
  const sizePad = size === 'sm' ? '12px 16px' : size === 'md' ? '14px 18px' : '18px 22px';
  const sizeFont = size === 'sm' ? 14 : size === 'md' ? 15 : 16;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: sizePad,
      borderRadius: 10,
      fontFamily: 'var(--sans)',
      fontSize: sizeFont,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      transition: 'transform .15s, opacity .15s',
      opacity: disabled ? 0.5 : 1,
      ...styles, ...style,
    }}
    onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.99)')}
    onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
    onMouseLeave={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span>{children}</span>
      {arrow && <span style={{ fontFamily: 'var(--mono)', fontWeight: 400, opacity: 0.9 }}>→</span>}
    </button>
  );
}

// Page section — full-width wrapper with optional paper-2 background.
function Section({ children, bg, style = {} }) {
  return (
    <section style={{
      width: '100%',
      background: bg || 'transparent',
      ...style,
    }}>
      {children}
    </section>
  );
}

// Inner container — responsive max-width + padding.
function Container({ children, size = 'md', style = {} }) {
  const maxW = size === 'sm' ? 620 : size === 'md' ? 880 : size === 'lg' ? 1120 : 1280;
  return (
    <div style={{
      maxWidth: maxW,
      margin: '0 auto',
      padding: 'clamp(20px, 4vw, 48px) clamp(20px, 4vw, 40px)',
      width: '100%',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Top navigation bar — universal header for every screen.
function NavBar({ step, onHome }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(243,239,230,0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(12px, 2vw, 18px) clamp(20px, 4vw, 40px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <button onClick={onHome} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            border: '1.5px solid var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 14, lineHeight: 1,
          }}>?</span>
          <Wordmark size={13} compact />
        </button>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--muted)',
        }}>
          {step || 'personal AI literacy diagnostic'}
        </div>
      </div>
    </nav>
  );
}

function CornerTicks({ color = 'var(--muted)' }) {
  const l = 14, w = 1;
  const base = { position: 'absolute', background: color };
  return (
    <>
      <div style={{ ...base, top: 12, left: 12, width: l, height: w }}/>
      <div style={{ ...base, top: 12, left: 12, width: w, height: l }}/>
      <div style={{ ...base, top: 12, right: 12, width: l, height: w }}/>
      <div style={{ ...base, top: 12, right: 12, width: w, height: l }}/>
      <div style={{ ...base, bottom: 12, left: 12, width: l, height: w }}/>
      <div style={{ ...base, bottom: 12, left: 12, width: w, height: l }}/>
      <div style={{ ...base, bottom: 12, right: 12, width: l, height: w }}/>
      <div style={{ ...base, bottom: 12, right: 12, width: w, height: l }}/>
    </>
  );
}

function Wordmark({ size = 14, color, accent, compact = false }) {
  const c = color || 'var(--ink)';
  const a = accent || 'var(--accent)';
  if (compact) {
    return (
      <span style={{ fontFamily: 'var(--mono)', fontSize: size, color: c, letterSpacing: '-0.01em', fontWeight: 500 }}>
        areyou<span style={{ color: a, fontWeight: 700 }}>ai</span>ready
      </span>
    );
  }
  return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: size, fontWeight: 500, color: c, letterSpacing: '0.02em' }}>
      areyou<span style={{ color: a, fontWeight: 700 }}>ai</span>ready<span style={{ color: 'var(--muted)', fontWeight: 400 }}>.net</span>
    </span>
  );
}

// Universal bottom footer.
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      background: 'var(--paper-2)',
      padding: '40px 20px 60px',
      marginTop: 60,
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', gap: 24,
        alignItems: 'baseline', justifyContent: 'space-between',
        fontFamily: 'var(--mono)', fontSize: 11,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--muted)',
      }}>
        <Wordmark size={12} />
        <div>∙ diagnostic v1 · april 2026 ∙</div>
        <div>powered by <span style={{ color: 'var(--ink)' }}>claude</span></div>
      </div>
    </footer>
  );
}

Object.assign(window, { Tag, MetaRow, BigButton, Section, Container, NavBar, CornerTicks, Wordmark, Footer });
