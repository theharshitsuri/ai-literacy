// Weekly newsletter issue — what a real issue looks like, responsive.
function NewsletterScreen({ tweaks, answers, jobId, jobOther, onBack }) {
  const serifStack = tweaks.typePair === 'sans' ? 'var(--sans)' : 'var(--serif)';
  const score = window.scoreAnswers(answers || {});
  const level = window.levelFor(score);
  const pack = window.JOB_PACKS[jobId] || window.JOB_PACKS.other;
  const job = window.JOBS.find(j => j.id === jobId) || window.JOBS.find(j => j.id === 'other');
  const jobDisplay = jobId === 'other' && jobOther ? jobOther : job.label;
  const accent = level.hex;

  // Issue content by level — different issue per level to showcase segmentation.
  const ISSUES = {
    newcomer: {
      headline: 'Open ChatGPT. Ask it the dumbest question you have.',
      do:       'Install ChatGPT on your phone. Free. Ask it something you\'d be embarrassed to Google. Spend 4 minutes. That\'s it.',
      before:   "You keep meaning to try it. Another week passes. A coworker brings it up again.",
      after:    "You've actually used it. You have an opinion. You know what the interface looks like.",
      skipIf:   "you've already used it this year. Skip ahead — next week is for you.",
    },
    curious: {
      headline: 'Pick ONE task you repeat weekly. AI-ify it once.',
      do:       `Think about a weekly task in ${jobDisplay.toLowerCase()}. Write ONE good prompt for it (role + context + format). Save it in Notes. Use it once this week.`,
      before:   "You use ChatGPT sometimes but it's never the same thing twice — each prompt is from scratch.",
      after:    "One weekly task just got 60% faster. You used the same prompt twice. You saved it.",
      skipIf:   "your week has no repeating task. Rare, but OK — skip to issue 018 on one-off prompts.",
    },
    user: {
      headline: 'Audit your 3 most-repeated prompts. Template them today.',
      do:       'Spend 20 minutes looking back at this month\'s ChatGPT history. Find your 3 most-used prompt patterns. Write clean templates with role + context + format + failure cases.',
      before:   "Every time you sit down to write the same prompt, you half-remember the wording and get inconsistent outputs.",
      after:    "Three saved templates. Consistent output. You catch yourself reusing them within the week.",
      skipIf:   "you already have a prompt library you trust. Skip to issue 017 on evals.",
    },
    ready: {
      headline: 'Stop talking to the model. Start evaluating it.',
      do:       'Pick your most valuable workflow. Build a 10-example eval set with expected outputs. Run two models head-to-head. Log results.',
      before:   "You pick your AI tool based on hunch. Model X for writing, Model Y for analysis. Never measured.",
      after:    "You have data: \"On our eval set, Claude beats GPT-5 on tone, loses on numeric extraction.\" You make tool calls on evidence.",
      skipIf:   "your use is non-routine. Evals are wasted on one-off tasks.",
    },
  };

  const issue = ISSUES[level.id] || ISSUES.curious;
  const primaryPrompt = pack.prompts[0];
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(primaryPrompt.prompt).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const today = new Date();
  const dateLine = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <NavBar step="weekly newsletter · this week" onHome={onBack} />

      <Section>
        <Container size="sm" style={{ paddingTop: 'clamp(32px, 5vw, 60px)', paddingBottom: 'clamp(60px, 8vw, 100px)' }}>
          {/* Masthead */}
          <div style={{
            borderTop: '3px solid var(--ink)',
            borderBottom: '1px solid var(--line)',
            padding: '14px 0 16px',
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            marginBottom: 26,
          }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--ink)', textTransform: 'uppercase' }}>
                THE WEEKLY · areyou<span style={{ color: 'var(--accent)' }}>ai</span>ready.net
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase' }}>
                ISSUE 017 · {dateLine} · 3-MIN READ
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: `1px solid ${accent}`, color: accent,
              padding: '4px 8px', borderRadius: 3,
            }}>
              FOR · {level.name.toUpperCase()}
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: serifStack, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.02,
            letterSpacing: '-0.025em', margin: '8px 0 14px', color: 'var(--ink)',
            textWrap: 'balance',
          }}>
            {issue.headline}
          </h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
            — 3-min read · 1 workflow · segmented for you
          </div>

          {/* §1 do this */}
          <SectionLabel>01 · Do this this week</SectionLabel>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink)', margin: '12px 0 0' }}>
            {issue.do}
          </p>

          {/* §2 before/after */}
          <SectionLabel>02 · Before / after</SectionLabel>
          <div className="ba-grid" style={{ marginTop: 12 }}>
            <div style={{
              border: '1px solid var(--line)', borderRadius: 6, padding: '14px 16px',
              background: 'rgba(155,28,28,0.04)',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--bad)', marginBottom: 8, textTransform: 'uppercase' }}>Before</div>
              <div style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--ink-2)' }}>{issue.before}</div>
            </div>
            <div style={{
              border: '1px solid var(--line)', borderRadius: 6, padding: '14px 16px',
              background: 'rgba(45,106,79,0.05)',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ok)', marginBottom: 8, textTransform: 'uppercase' }}>After</div>
              <div style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--ink-2)' }}>{issue.after}</div>
            </div>
          </div>

          {/* §3 copy this prompt — pulled from pack */}
          <SectionLabel>03 · This week's prompt — for {pack.display}</SectionLabel>
          <div style={{
            fontFamily: serifStack, fontSize: 22, fontWeight: 400,
            letterSpacing: '-0.01em', margin: '10px 0 10px',
          }}>{primaryPrompt.title}</div>
          <div style={{
            padding: '16px 18px',
            background: 'var(--ink)', color: '#f3efe6',
            borderRadius: 8,
            fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>{primaryPrompt.prompt}</div>
          <button onClick={copy} style={{
            marginTop: 10, width: '100%',
            padding: '12px 14px', borderRadius: 6,
            border: '1px dashed var(--ink)', background: 'transparent',
            fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer', color: 'var(--ink)',
          }}>{copied ? '✓ copied' : 'copy prompt'}</button>

          {/* §4 skip if */}
          <SectionLabel>04 · When NOT to use this</SectionLabel>
          <div style={{
            marginTop: 12, padding: '14px 16px',
            background: '#fff6ec',
            border: '1px solid var(--warn)',
            borderRadius: 6,
            fontSize: 14, lineHeight: 1.45, color: 'var(--ink)',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--warn)', letterSpacing: '0.12em' }}>SKIP IT IF</span>
            {' — '}{issue.skipIf}
          </div>

          {/* §5 upgrade CTA */}
          <div style={{ marginTop: 36, padding: '22px 22px',
            border: '1.5px solid var(--ink)', borderRadius: 10,
            background: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>
              UPGRADE · OPTIONAL
            </div>
            <div style={{ fontFamily: serifStack, fontSize: 24, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.2, margin: '0 0 10px' }}>
              Want 20 more prompts, built for {pack.display}?
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.4 }}>
              The {level.name} + {job.label.toLowerCase()} pack: 20 ready prompts, 5 checklists, printable safety card. $19 once.
            </div>
            <BigButton onClick={() => {}} variant="ink">
              Grab the {level.name} pack — $19
            </BigButton>
          </div>

          <div style={{ marginTop: 26, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, fontStyle: 'italic', textAlign: 'center' }}>
            Tried the prompt? Reply — we read every one.
          </div>

          <div style={{
            marginTop: 30, paddingTop: 16, borderTop: '1px solid var(--line)',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
            color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center',
          }}>
            areyou<span style={{ color: 'var(--accent)' }}>ai</span>ready.net · you're {level.name.toLowerCase()} · unsubscribe
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      marginTop: 28,
      fontFamily: 'var(--mono)', fontSize: 11,
      letterSpacing: '0.2em', color: 'var(--accent)',
      textTransform: 'uppercase', fontWeight: 600,
      borderBottom: '1px solid var(--line)', paddingBottom: 6,
    }}>{children}</div>
  );
}

window.NewsletterScreen = NewsletterScreen;
