import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'paper-1': 'var(--paper-1)',
        'paper-2': 'var(--paper-2)',
        'paper-3': 'var(--paper-3)',
        'ink-1':   'var(--ink-1)',
        'ink-2':   'var(--ink-2)',
        'ink-3':   'var(--ink-3)',
        rule:      'var(--rule)',
        'rule-2':  'var(--rule-2)',
        accent:    'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        ok:        'var(--ok)',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', '"Times New Roman"', 'serif'],
        sans:  ['"Inter Tight"', '-apple-system', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

