// Render every screen to make sure nothing throws at runtime.
const fs = require('fs');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');

const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});
const win = dom.window;

// Inject React / ReactDOM into the JSDOM window
const React = require('react');
const ReactDOM = require('react-dom');
const ReactDOMServer = require('react-dom/server');
win.React = React;
win.ReactDOM = { createRoot: () => ({ render: () => {} }) };
win.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const files = [
  'src/data.jsx', 'src/primitives.jsx',
  'src/screens/landing.jsx', 'src/screens/checkout.jsx',
  'src/screens/quiz.jsx', 'src/screens/job.jsx',
  'src/screens/processing.jsx', 'src/screens/result.jsx',
  'src/screens/workplace.jsx',
  'src/screens/confirm.jsx', 'src/screens/desktop.jsx',
  'src/screens/email.jsx', 'src/screens/newsletter.jsx',
  'src/tweaks.jsx', 'src/app.jsx',
];

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const { code } = babel.transformSync(src, {
    presets: [["@babel/preset-react", { runtime: "classic" }]],
    filename: f, configFile: false, babelrc: false,
  });
  try {
    // Run in the JSDOM window's global scope so `function Foo()` becomes a window global.
    win.eval(code);
    console.log('LOAD ✓', f);
  } catch (e) {
    console.log('LOAD ✗', f, '—', e.message);
    process.exit(1);
  }
}

// Put the JSDOM window's React into this process so renderToString uses matching elements.
// Easier: use the window's own React if present, else ours.
const R = win.React;

const noop = () => {};
const demoAnswers = {
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
const tweaks = { accent: '#e24a1a', typePair: 'serif', tone: 'warm', paywall: true, quizLayout: 'typeform', headline: 'race', resultHero: 'identity' };
const score = win.scoreAnswers(demoAnswers);
const level = win.levelFor(score);

const cases = [
  ['LandingScreen',    () => R.createElement(win.LandingScreen,    { tweaks, onStart: noop })],
  ['CheckoutScreen',   () => R.createElement(win.CheckoutScreen,   { onComplete: noop, onBack: noop })],
  ['QuizScreen',       () => R.createElement(win.QuizScreen,       { tweaks, answers: {}, setAnswers: noop, onComplete: noop, onBack: noop })],
  ['JobScreen',        () => R.createElement(win.JobScreen,        { tweaks, jobId: null, jobOther: '', setJobId: noop, setJobOther: noop, onNext: noop, onBack: noop })],
  ['ProcessingScreen', () => R.createElement(win.ProcessingScreen, { tweaks, jobId: 'office', jobOther: '', score, level, onDone: noop })],
  ['ResultScreen',     () => R.createElement(win.ResultScreen,     { tweaks, answers: demoAnswers, jobId: 'office', jobOther: '', onEmail: noop, onBack: noop, onWorkplace: noop })],
  ['WorkplaceScreen',  () => R.createElement(win.WorkplaceScreen,  { tweaks, answers: demoAnswers, jobId: 'office', jobOther: '', onBack: noop, onBuy: noop })],
  ['ConfirmScreen',    () => R.createElement(win.ConfirmScreen,    { tweaks, onRestart: noop, onOpenEmail: noop })],
  ['EmailScreen',      () => R.createElement(win.EmailScreen,      { tweaks, answers: demoAnswers, jobId: 'office', jobOther: '', onBack: noop, onOpenNewsletter: noop })],
  ['NewsletterScreen', () => R.createElement(win.NewsletterScreen, { tweaks, answers: demoAnswers, jobId: 'office', jobOther: '', onBack: noop })],
  ['TweaksPanel',      () => R.createElement(win.TweaksPanel,      { tweaks, setTweaks: noop, open: true, onClose: noop })],
];

let fail = 0;
for (const [name, make] of cases) {
  try {
    // Use the JSDOM window's React to build the element tree,
    // then render with a matching ReactDOMServer.
    // Since JSDOM's R and our React are the same module instance (we assigned win.React = React),
    // renderToString works transparently.
    const html = ReactDOMServer.renderToString(make());
    console.log('RENDER ✓', name, '—', html.length, 'chars');
  } catch (e) {
    console.log('RENDER ✗', name, '—', e.message);
    fail++;
  }
}

process.exit(fail ? 1 : 0);
