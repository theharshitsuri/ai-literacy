import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:    'var(--paper)',
        'paper-2':'var(--paper-2)',
        'paper-3':'var(--paper-3)',
        ink:      'var(--ink)',
        'ink-2':  'var(--ink-2)',
        muted:    'var(--muted)',
        line:     'var(--line)',
        accent:   'var(--accent)',
        'accent-2':'var(--accent-2)',
        ok:       'var(--ok)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
    },
  },
  plugins: [],
};

export default config;
