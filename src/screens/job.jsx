// Job selector — shown after quiz, before LLM processing.
// 10 jobs in a responsive grid + optional "describe it" field for 'other'.

function JobScreen({ tweaks, jobId, jobOther, setJobId, setJobOther, onNext, onBack }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';

  const handlePick = (id) => {
    setJobId(id);
    if (id !== 'other') {
      // auto-advance for non-other jobs
      setTimeout(() => onNext(), 320);
    }
  };

  return (
    <>
      <NavBar step="last step before your result" onHome={onBack} />

      <Section>
        <Container size="md" style={{ paddingTop: 'clamp(32px, 5vw, 60px)', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em',
            color: 'var(--muted)', padding: 0, marginBottom: 20,
          }}>← back</button>

          <Tag accent>ONE LAST QUESTION</Tag>

          <h2 style={{
            fontFamily: serifStack, fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 60px)', lineHeight: 1.03, letterSpacing: '-0.02em',
            margin: '16px 0 10px', color: 'var(--ink)',
            textWrap: 'balance',
          }}>
            What do you do most days?
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--ink-2)', margin: '0 0 32px',
            maxWidth: 560, lineHeight: 1.45,
          }}>
            We use this to pick the right examples — a cashier's first win looks different from an office admin's. Pick the closest match.
          </p>

          <div className="job-grid">
            {window.JOBS.map(j => {
              const picked = jobId === j.id;
              return (
                <button key={j.id} onClick={() => handlePick(j.id)} style={{
                  textAlign: 'left',
                  padding: '18px 16px',
                  border: picked ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  borderRadius: 10,
                  background: picked ? 'var(--ink)' : 'rgba(255,255,255,0.5)',
                  color: picked ? 'var(--paper)' : 'var(--ink)',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.99)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{
                    fontSize: 22,
                    color: picked ? 'var(--paper)' : 'var(--accent)',
                    lineHeight: 1, marginTop: 2, flexShrink: 0,
                  }}>{j.icon}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>
                      {j.label}
                    </span>
                    <span style={{
                      display: 'block', marginTop: 3,
                      fontSize: 12,
                      color: picked ? '#a9a392' : 'var(--muted)',
                      lineHeight: 1.3,
                    }}>
                      {j.sample}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {jobId === 'other' && (
            <div style={{ marginTop: 24, animation: 'qfade .3s ease both' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Describe it in one line
              </div>
              <input
                type="text"
                value={jobOther || ''}
                onChange={(e) => setJobOther(e.target.value)}
                placeholder="e.g. I run a food truck · I'm a freelance editor · I'm between jobs"
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1px solid var(--line)', borderRadius: 8,
                  background: 'rgba(255,255,255,0.6)',
                  fontFamily: 'var(--sans)', fontSize: 15,
                  color: 'var(--ink)',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--line)'}
              />
            </div>
          )}

          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <BigButton
              onClick={onNext}
              variant={jobId ? 'ink' : 'ghost'}
              disabled={!jobId || (jobId === 'other' && !jobOther?.trim())}
            >
              Generate my personalized plan
            </BigButton>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--muted)',
            }}>
              takes about 8 seconds
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

window.JobScreen = JobScreen;
