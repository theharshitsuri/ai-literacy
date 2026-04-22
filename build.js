// Build: cat sources → src/bundle.jsx, then inline into index-standalone.html
// with OPENAI_API_KEY from .env injected as window.OPENAI_API_KEY.
// Run: node build.js

const fs = require('fs');
const path = require('path');

const SOURCES = [
  'src/data.jsx',
  'src/primitives.jsx',
  'src/screens/landing.jsx',
  'src/screens/checkout.jsx',
  'src/screens/quiz.jsx',
  'src/screens/job.jsx',
  'src/screens/processing.jsx',
  'src/screens/result.jsx',
  'src/screens/workplace.jsx',
  'src/screens/confirm.jsx',
  'src/screens/desktop.jsx',
  'src/screens/email.jsx',
  'src/screens/newsletter.jsx',
  'src/tweaks.jsx',
  'src/app.jsx',
];

// --- parse .env ---
const env = {};
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
}
const key = env.OPENAI_API_KEY || '';
const model = env.OPENAI_MODEL || 'gpt-4o-mini';

// --- concat bundle ---
const bundle = SOURCES.map(f => fs.readFileSync(f, 'utf8')).join('\n');
fs.writeFileSync('src/bundle.jsx', bundle);
console.log('bundle:', bundle.length, 'bytes');

// --- build standalone with injected config ---
const injection = `// Injected at build time from .env\nwindow.OPENAI_API_KEY = ${JSON.stringify(key)};\nwindow.OPENAI_MODEL = ${JSON.stringify(model)};\n\n`;
const index = fs.readFileSync('index.html', 'utf8');
const out = index.replace(
  /<script type="text\/babel" src="src\/bundle\.jsx"><\/script>/,
  '<script type="text/babel">\n' + injection + bundle + '\n</script>'
);
if (out === index) {
  console.error('FAIL: bundle script tag not found in index.html');
  process.exit(1);
}
fs.writeFileSync('index-standalone.html', out);
console.log('standalone:', out.length, 'bytes', key ? '(key injected)' : '(no key — heuristic fallback)');
