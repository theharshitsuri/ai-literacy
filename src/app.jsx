// App — responsive website composition. No iPhone frame.

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e24a1a",
  "typePair": "serif",
  "tone": "warm",
  "paywall": true,
  "quizLayout": "typeform",
  "headline": "race",
  "resultHero": "identity"
}/*EDITMODE-END*/;

const SCREENS = [
  { id: 'landing',    label: 'Landing' },
  { id: 'checkout',   label: '$1 Checkout', paywallOnly: true },
  { id: 'quiz',       label: 'Quiz' },
  { id: 'job',        label: 'Job' },
  { id: 'processing', label: 'Processing' },
  { id: 'result',     label: 'Result' },
  { id: 'workplace',  label: 'Workplace' },
  { id: 'confirm',    label: 'Confirm' },
  { id: 'email',      label: 'Welcome Email' },
  { id: 'newsletter', label: 'Newsletter' },
];

// Demo answers so the Result/Email/Newsletter screens work if jumped-to directly.
const DEMO_ANSWERS = {
  q1: 'sometimes',
  q2: ['chatgpt', 'claude', 'gemini', 'perplexity'],
  q3: 'You are a professional account manager. Write a firm but warm email to a customer who is 30 days late on their invoice. Offer a clear path to pay. Under 120 words. No legal threats.',
  q4: "It's when AI confidently makes up facts, citations, or details that sound right but aren't real.",
  q5: 'source',
  q6: ['news', 'recipe', 'resume'],
  q7: 'math',
  q8: 'drafts',
  q9: '3',
  q10: "I'd love AI to help me prep for tough 1:1s at work without sounding scripted.",
};
const DEMO_JOB = 'office';

function App() {
  const [tweaks, setTweaks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ayair_tweaks') || '{}');
      return { ...TWEAK_DEFAULTS, ...saved };
    } catch { return TWEAK_DEFAULTS; }
  });
  // Start on landing unless ?screen=X in the URL forces a specific screen. (No localStorage resume — we want a fresh visitor experience.)
  const [screen, setScreen] = useState(() => {
    try {
      const u = new URL(window.location.href);
      return u.searchParams.get('screen') || 'landing';
    } catch { return 'landing'; }
  });
  const [answers, setAnswers] = useState({});
  const [jobId, setJobId] = useState(null);
  const [jobOther, setJobOther] = useState('');
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => { localStorage.setItem('ayair_tweaks', JSON.stringify(tweaks)); }, [tweaks]);
  useEffect(() => { localStorage.setItem('ayair_screen', screen); }, [screen]);
  useEffect(() => { document.documentElement.style.setProperty('--accent', tweaks.accent); }, [tweaks.accent]);

  // Scroll to top on screen change for a proper page transition feel.
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [screen]);

  // Edit-mode protocol (host tooling)
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const effectiveAnswers = Object.keys(answers).length ? answers : DEMO_ANSWERS;
  const effectiveJob = jobId || DEMO_JOB;
  const effectiveOther = jobOther;

  const startQuiz = () => setScreen(tweaks.paywall ? 'checkout' : 'quiz');
  const resetAll = () => { setAnswers({}); setJobId(null); setJobOther(''); setScreen('landing'); };

  const screenEl = (() => {
    switch (screen) {
      case 'landing':
        return <LandingScreen tweaks={tweaks} onStart={startQuiz} />;
      case 'checkout':
        return <CheckoutScreen onComplete={() => setScreen('quiz')} onBack={() => setScreen('landing')} />;
      case 'quiz':
        return <QuizScreen tweaks={tweaks} answers={answers} setAnswers={setAnswers}
                  onComplete={(a) => { setAnswers(a); setScreen('job'); }}
                  onBack={() => setScreen(tweaks.paywall ? 'checkout' : 'landing')} />;
      case 'job':
        return <JobScreen tweaks={tweaks}
                  jobId={jobId} jobOther={jobOther}
                  setJobId={setJobId} setJobOther={setJobOther}
                  onNext={() => setScreen('processing')}
                  onBack={() => setScreen('quiz')} />;
      case 'processing':
        return <ProcessingScreen tweaks={tweaks}
                  jobId={effectiveJob} jobOther={effectiveOther}
                  answers={effectiveAnswers}
                  onDone={() => setScreen('result')} />;
      case 'result':
        return <ResultScreen tweaks={tweaks}
                  answers={effectiveAnswers}
                  jobId={effectiveJob} jobOther={effectiveOther}
                  onEmail={() => setScreen('confirm')}
                  onWorkplace={() => setScreen('workplace')}
                  onBack={resetAll} />;
      case 'workplace':
        return <WorkplaceScreen tweaks={tweaks}
                  answers={effectiveAnswers}
                  jobId={effectiveJob} jobOther={effectiveOther}
                  onBack={() => setScreen('result')}
                  onBuy={() => setScreen('confirm')} />;
      case 'confirm':
        return <ConfirmScreen tweaks={tweaks}
                  onRestart={resetAll}
                  onOpenEmail={() => setScreen('email')} />;
      case 'email':
        return <EmailScreen tweaks={tweaks}
                  answers={effectiveAnswers}
                  jobId={effectiveJob} jobOther={effectiveOther}
                  onBack={() => setScreen('confirm')}
                  onOpenNewsletter={() => setScreen('newsletter')} />;
      case 'newsletter':
        return <NewsletterScreen tweaks={tweaks}
                  answers={effectiveAnswers}
                  jobId={effectiveJob} jobOther={effectiveOther}
                  onBack={() => setScreen('email')} />;
      default:
        return <LandingScreen tweaks={tweaks} onStart={startQuiz} />;
    }
  })();

  // Keyboard shortcut: press "d" to toggle the hidden dev toolbar if you need it back.
  const [devOpen, setDevOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey &&
          e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setDevOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Dev toolbar — hidden by default. Press "d" to toggle. */}
      {devOpen && (
        <div className="dev-toolbar">
          <div className="dev-toolbar-inner">
            <span className="dev-toolbar-label">PROTO</span>
            {SCREENS.map(s => {
              if (s.paywallOnly && !tweaks.paywall) return null;
              return (
                <button key={s.id} className={screen === s.id ? 'active' : ''}
                  onClick={() => setScreen(s.id)}>{s.label}</button>
              );
            })}
            <button className="tweaks-toggle" onClick={() => setTweaksOpen(!tweaksOpen)}>⚙</button>
            <button onClick={() => setDevOpen(false)}>× hide</button>
          </div>
        </div>
      )}

      {/* The actual site */}
      <div className={devOpen ? 'site site-with-dev' : 'site'}>
        {screenEl}
      </div>

      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} open={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
