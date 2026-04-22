// Tweaks panel — exposes the design knobs the user asked for.
function TweaksPanel({ tweaks, setTweaks, open, onClose }) {
  if (!open) return null;

  const set = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  return (
    <div className="tweaks-panel open">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>TWEAKS</h3>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#a9a392',
          fontFamily: 'var(--mono)', fontSize: 14, cursor: 'pointer', padding: 0,
        }}>×</button>
      </div>

      <div className="tweak-row">
        <label>ACCENT COLOR</label>
        <div className="swatches">
          {[
            ['#e24a1a', 'vermillion'],
            ['#2d6a4f', 'forest'],
            ['#1a56db', 'ink blue'],
            ['#b45309', 'amber'],
            ['#14110d', 'black'],
          ].map(([hex, name]) => (
            <div key={hex} onClick={() => set('accent', hex)}
              title={name}
              className={'swatch ' + (tweaks.accent === hex ? 'on' : '')}
              style={{ background: hex }}/>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>TYPE PAIRING</label>
        <div className="chips">
          {[['serif', 'Serif + Mono'], ['sans', 'Sans only'], ['fraunces', 'Fraunces']].map(([v, n]) => (
            <div key={v} className={'chip ' + (tweaks.typePair === v ? 'on' : '')} onClick={() => set('typePair', v)}>{n}</div>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>TONE</label>
        <div className="chips">
          {['clinical', 'warm', 'playful'].map(v => (
            <div key={v} className={'chip ' + (tweaks.tone === v ? 'on' : '')} onClick={() => set('tone', v)}>{v}</div>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>PAYWALL</label>
        <div className="chips">
          <div className={'chip ' + (!tweaks.paywall ? 'on' : '')} onClick={() => set('paywall', false)}>Free</div>
          <div className={'chip ' + (tweaks.paywall ? 'on' : '')} onClick={() => set('paywall', true)}>$1</div>
        </div>
      </div>

      <div className="tweak-row">
        <label>QUIZ LAYOUT</label>
        <div className="chips">
          {[['typeform', 'One per screen'], ['scrolled', 'All scrolled']].map(([v, n]) => (
            <div key={v} className={'chip ' + (tweaks.quizLayout === v ? 'on' : '')} onClick={() => set('quizLayout', v)}>{n}</div>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>HEADLINE VARIANT</label>
        <div className="chips">
          {window.HEADLINES.map(h => (
            <div key={h.id} className={'chip ' + (tweaks.headline === h.id ? 'on' : '')} onClick={() => set('headline', h.id)}>{h.id}</div>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>RESULT HERO</label>
        <div className="chips">
          {[['identity', 'Identity'], ['plan', 'Week plan'], ['prompt', 'Prompt']].map(([v, n]) => (
            <div key={v} className={'chip ' + (tweaks.resultHero === v ? 'on' : '')} onClick={() => set('resultHero', v)}>{n}</div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 16, padding: '10px 12px',
        background: 'rgba(226,74,26,0.08)', border: '1px dashed rgba(226,74,26,0.4)',
        borderRadius: 6, fontSize: 11, color: '#f3efe6', lineHeight: 1.4,
      }}>
        Tip: also try the <strong>screen navigator</strong> above the phone to jump between steps.
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
