# Komuna Discovery Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Komuna member-facing discovery page as a Vite + React SPA with mock data, matching the warm editorial design pixel-perfectly.

**Architecture:** Single-page React app at `apps/web/`. Design tokens live as CSS custom properties in `globals.css` and are exposed as Tailwind color/font utilities. All interactive state (active category, active filter chips) is `useState` in `DiscoveryPage` — no router, no global store. Mock data in `src/data/programs.ts` is typed to match the future API shape.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, Vitest, @testing-library/react

---

## File Map

| File | Responsibility |
|---|---|
| `apps/web/index.html` | Google Fonts preconnect + link, `<div id="root">` |
| `apps/web/vite.config.ts` | Vite plugin + Vitest config (jsdom, globals) |
| `apps/web/tailwind.config.ts` | CSS variable color tokens + font families |
| `apps/web/postcss.config.js` | tailwindcss + autoprefixer |
| `apps/web/tsconfig.json` | TypeScript config (strict, JSX preserve) |
| `apps/web/tsconfig.node.json` | Node config for vite.config.ts |
| `apps/web/src/globals.css` | `@tailwind` directives + all CSS custom properties |
| `apps/web/src/main.tsx` | React 18 root mount |
| `apps/web/src/App.tsx` | Renders `<DiscoveryPage />` |
| `apps/web/src/lib/utils.ts` | `cn()` class-merging helper |
| `apps/web/src/data/programs.ts` | `ProgramListItem` type, `PROGRAMS` array, `CATEGORIES` array |
| `apps/web/src/components/layout/TopNav.tsx` | Logo, nav links, logged-in user pill, notification bell |
| `apps/web/src/components/layout/Footer.tsx` | Copyright + link strip |
| `apps/web/src/components/discovery/NotificationBell.tsx` | Bell icon button with count badge |
| `apps/web/src/components/discovery/HeroSearch.tsx` | Centered headline + SearchBar + quick-filter chips |
| `apps/web/src/components/discovery/SearchBar.tsx` | Icon + controlled input + kbd badge + Search button |
| `apps/web/src/components/discovery/CategorySidebar.tsx` | Category list + location filter + visibility legend |
| `apps/web/src/components/discovery/FilterChips.tsx` | Dismissible active filter pills |
| `apps/web/src/components/discovery/ProgramCard.tsx` | Striped placeholder image, visibility badge, price/rating |
| `apps/web/src/components/discovery/ProgramGrid.tsx` | 3-column grid of ProgramCards |
| `apps/web/src/pages/DiscoveryPage.tsx` | Page assembly, category + filter state |
| `apps/web/src/__tests__/ProgramCard.test.tsx` | |
| `apps/web/src/__tests__/SearchBar.test.tsx` | |
| `apps/web/src/__tests__/NotificationBell.test.tsx` | |
| `apps/web/src/__tests__/TopNav.test.tsx` | |
| `apps/web/src/__tests__/CategorySidebar.test.tsx` | |
| `apps/web/src/__tests__/FilterChips.test.tsx` | |
| `apps/web/src/__tests__/ProgramGrid.test.tsx` | |
| `apps/web/src/__tests__/DiscoveryPage.test.tsx` | |

---

### Task 1: Scaffold `apps/web`

**Files:**
- Create: `apps/web/` (entire directory)

- [ ] **Step 1: Create the Vite + React + TypeScript project**

From the repo root (`/home/aristo/dev/komuna-community-session-bookings`):

```bash
npm create vite@latest apps/web -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd apps/web
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p --ts
```

- [ ] **Step 3: Verify the scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`. Ctrl-C to stop.

- [ ] **Step 4: Commit**

```bash
cd /home/aristo/dev/komuna-community-session-bookings
git add apps/web
git commit -m "feat: scaffold apps/web (Vite + React + TS)"
```

---

### Task 2: Configure Tailwind, CSS tokens, and fonts

**Files:**
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/src/globals.css` (replace generated file)
- Modify: `apps/web/index.html`
- Modify: `apps/web/src/main.tsx` (import globals.css)

- [ ] **Step 1: Write `tailwind.config.ts`**

```ts
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
```

- [ ] **Step 2: Write `src/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --paper-1: oklch(0.985 0.008 75);
  --paper-2: oklch(0.965 0.012 75);
  --paper-3: oklch(0.94  0.014 75);

  --ink-1:   oklch(0.21  0.02  50);
  --ink-2:   oklch(0.45  0.02  50);
  --ink-3:   oklch(0.62  0.018 50);

  --rule:    oklch(0.9   0.012 75);
  --rule-2:  oklch(0.82  0.014 75);

  --accent:       oklch(0.62  0.16  38);
  --accent-soft:  oklch(0.94  0.04  38);
  --accent-soft-stripe: oklch(0.9 0.05 38);
  --accent-ink:   oklch(0.42  0.14  38);

  --ok:      oklch(0.62  0.13  150);

  --placeholder-warm:        oklch(0.92 0.03 60);
  --placeholder-warm-stripe: oklch(0.87 0.04 55);
  --placeholder-cool:        oklch(0.92 0.025 220);
  --placeholder-cool-stripe: oklch(0.87 0.035 220);
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--paper-1);
  color: var(--ink-1);
  font-family: "Inter Tight", -apple-system, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

*, *::before, *::after { box-sizing: border-box; }
```

- [ ] **Step 3: Add Google Fonts to `index.html`**

Replace the `<head>` content (keep the existing `<meta charset>` and `<meta name="viewport">`, add fonts):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Komuna — Discover programs</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Import globals.css in `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Verify fonts and token colors load**

```bash
npm run dev
```

Open `http://localhost:5173`. The page background should be a warm cream (not pure white). Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add apps/web/tailwind.config.ts apps/web/src/globals.css apps/web/index.html apps/web/src/main.tsx
git commit -m "feat: configure Tailwind design tokens and Google Fonts"
```

---

### Task 3: Configure Vitest

**Files:**
- Modify: `apps/web/vite.config.ts`
- Create: `apps/web/src/test/setup.ts`

- [ ] **Step 1: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    css: true,
  },
})
```

- [ ] **Step 2: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to `package.json`**

Ensure `package.json` has:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Verify Vitest runs (no tests yet, should exit cleanly)**

```bash
npm test
```

Expected output: `No test files found` or exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/vite.config.ts apps/web/src/test/setup.ts apps/web/package.json
git commit -m "feat: configure Vitest + Testing Library"
```

---

### Task 4: Mock data

**Files:**
- Create: `apps/web/src/data/programs.ts`
- Create: `apps/web/src/__tests__/programs.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/programs.test.ts
import { describe, it, expect } from 'vitest'
import { PROGRAMS, CATEGORIES } from '../data/programs'

describe('mock programs', () => {
  it('has exactly 6 programs', () => {
    expect(PROGRAMS).toHaveLength(6)
  })

  it('every program has required fields', () => {
    for (const p of PROGRAMS) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(['public', 'need-approval', 'invitation-only', 'private']).toContain(p.visibility)
      expect(p.memberCount).toBeGreaterThan(0)
      expect(p.lowestPrice).toBeTruthy()
      expect(['warm', 'cool', 'ink', 'accent']).toContain(p.imageTone)
    }
  })

  it('has 9 categories including "all"', () => {
    expect(CATEGORIES).toHaveLength(9)
    expect(CATEGORIES[0].id).toBe('all')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../data/programs'`

- [ ] **Step 3: Write `src/data/programs.ts`**

```ts
export type ProgramListItem = {
  id: string
  name: string
  description: string
  visibility: 'public' | 'need-approval' | 'invitation-only' | 'private'
  timezone: string
  memberCount: number
  lowestPrice: string
  // Not yet in DB schema — to be added to PROGRAM table
  location?: string
  category?: string
  rating?: number
  sessionsPerWeek?: number
  // UI-only: removed once real images exist
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
}

export const PROGRAMS: ProgramListItem[] = [
  {
    id: 'p1',
    name: 'Eastside Boxing Club',
    description: 'High-intensity bag work, pad rounds, and conditioning in Brooklyn.',
    visibility: 'public',
    timezone: 'America/New_York',
    memberCount: 412,
    lowestPrice: '$28',
    location: 'Brooklyn, NY',
    category: 'Boxing',
    rating: 4.9,
    sessionsPerWeek: 6,
    imageTone: 'warm',
    imageLabel: 'BAG WORK · COACH',
  },
  {
    id: 'p2',
    name: 'Slow Flow with Ines',
    description: 'Gentle vinyasa and yin yoga for all levels, morning sessions.',
    visibility: 'need-approval',
    timezone: 'Europe/Lisbon',
    memberCount: 86,
    lowestPrice: '€22',
    location: 'Lisbon',
    category: 'Yoga',
    rating: 5.0,
    sessionsPerWeek: 3,
    imageTone: 'cool',
    imageLabel: 'MAT · MORNING LIGHT',
  },
  {
    id: 'p3',
    name: 'Strong Together',
    description: 'Barbell strength program built around progressive overload and community.',
    visibility: 'public',
    timezone: 'Europe/Berlin',
    memberCount: 240,
    lowestPrice: '€34',
    location: 'Berlin',
    category: 'Strength',
    rating: 4.8,
    sessionsPerWeek: 8,
    imageTone: 'ink',
    imageLabel: 'BARBELL · LIFT',
  },
  {
    id: 'p4',
    name: 'Sprint Lab',
    description: 'Online HIIT program with track intervals and timed circuits.',
    visibility: 'invitation-only',
    timezone: 'America/New_York',
    memberCount: 1124,
    lowestPrice: '$19',
    location: 'Online',
    category: 'HIIT',
    rating: 4.7,
    sessionsPerWeek: 12,
    imageTone: 'accent',
    imageLabel: 'TRACK · INTERVAL',
  },
  {
    id: 'p5',
    name: 'Roundhouse Muay Thai',
    description: 'Technical Muay Thai with pad work, clinch, and conditioning rounds.',
    visibility: 'public',
    timezone: 'America/Chicago',
    memberCount: 178,
    lowestPrice: '$32',
    location: 'Austin, TX',
    category: 'Boxing',
    rating: 4.9,
    sessionsPerWeek: 5,
    imageTone: 'warm',
    imageLabel: 'RING · PADWORK',
  },
  {
    id: 'p6',
    name: 'Sunrise Vinyasa',
    description: 'Open-air yoga retreat in Bali. Flow at sunrise, meditate at dusk.',
    visibility: 'need-approval',
    timezone: 'Asia/Makassar',
    memberCount: 64,
    lowestPrice: '$24',
    location: 'Bali',
    category: 'Yoga',
    rating: 5.0,
    sessionsPerWeek: 4,
    imageTone: 'cool',
    imageLabel: 'RETREAT · OUTDOOR',
  },
]

export const CATEGORIES = [
  { id: 'all',          label: 'All programs',   count: 248 },
  { id: 'Boxing',       label: 'Boxing',          count: 34  },
  { id: 'Yoga',         label: 'Yoga & mobility', count: 71  },
  { id: 'Strength',     label: 'Strength',        count: 52  },
  { id: 'HIIT',         label: 'HIIT & cardio',   count: 28  },
  { id: 'Running',      label: 'Running',          count: 19  },
  { id: 'Pilates',      label: 'Pilates',          count: 22  },
  { id: 'Martial arts', label: 'Martial arts',     count: 14  },
  { id: 'Online only',  label: 'Online only',      count: 88  },
] as const
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/data/programs.ts apps/web/src/__tests__/programs.test.ts
git commit -m "feat: add mock program data and type"
```

---

### Task 5: `lib/utils.ts`

**Files:**
- Create: `apps/web/src/lib/utils.ts`

- [ ] **Step 1: Write `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/utils.ts apps/web/package.json apps/web/package-lock.json
git commit -m "feat: add cn() class-merging utility"
```

---

### Task 6: `ProgramCard` component

**Files:**
- Create: `apps/web/src/components/discovery/ProgramCard.tsx`
- Create: `apps/web/src/__tests__/ProgramCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/ProgramCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramCard } from '../components/discovery/ProgramCard'
import type { ProgramListItem } from '../data/programs'

const base: ProgramListItem = {
  id: 'p1',
  name: 'Eastside Boxing Club',
  description: 'High-intensity bag work.',
  visibility: 'public',
  timezone: 'America/New_York',
  memberCount: 412,
  lowestPrice: '$28',
  location: 'Brooklyn, NY',
  category: 'Boxing',
  rating: 4.9,
  sessionsPerWeek: 6,
  imageTone: 'warm',
  imageLabel: 'BAG WORK · COACH',
}

describe('ProgramCard', () => {
  it('renders the program name', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })

  it('renders Open badge for public visibility', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders Apply badge for need-approval visibility', () => {
    render(<ProgramCard program={{ ...base, visibility: 'need-approval' }} />)
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('renders the price', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('$28')).toBeInTheDocument()
  })

  it('renders the category tag', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('Boxing')).toBeInTheDocument()
  })

  it('renders location and member count', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText(/Brooklyn, NY/)).toBeInTheDocument()
    expect(screen.getByText(/412 members/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProgramCard
```

Expected: FAIL — `Cannot find module '../components/discovery/ProgramCard'`

- [ ] **Step 3: Write `src/components/discovery/ProgramCard.tsx`**

```tsx
import type { ProgramListItem } from '../../data/programs'

const VIS = {
  public:           { text: 'Open',    dot: 'var(--ok)'     },
  'need-approval':  { text: 'Apply',   dot: 'var(--accent)' },
  'invitation-only':{ text: 'Invite',  dot: 'var(--ink-2)'  },
  private:          { text: 'Private', dot: 'var(--ink-3)'  },
} as const

const TONE_STYLES: Record<ProgramListItem['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

function ImagePlaceholder({ label, tone }: { label: string; tone: ProgramListItem['imageTone'] }) {
  const t = TONE_STYLES[tone]
  return (
    <div
      style={{
        aspectRatio: '4 / 3',
        background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
        color: t.fg,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          background: t.bg,
          padding: '3px 7px',
          border: `1px solid ${t.stripe}`,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export function ProgramCard({ program: p }: { program: ProgramListItem }) {
  const vis = VIS[p.visibility]
  return (
    <div
      style={{
        background: 'var(--paper-1)',
        border: '1px solid var(--rule)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative' }}>
        <ImagePlaceholder label={p.imageLabel} tone={p.imageTone} />
        {/* Visibility badge */}
        <div
          style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--paper-1)', padding: '4px 9px',
            borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-1)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 3, background: vis.dot }} />
          {vis.text}
        </div>
        {/* Category tag */}
        {p.category && (
          <div
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'var(--paper-1)', padding: '4px 9px',
              borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-1)',
            }}
          >
            {p.category}
          </div>
        )}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 19, color: 'var(--ink-1)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            {p.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
            {p.location} · {p.memberCount} members
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--rule)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>{p.lowestPrice}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>/ session</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-2)' }}>
            {p.rating && <span>★ {p.rating}</span>}
            {p.sessionsPerWeek && <><span style={{ color: 'var(--ink-3)' }}>·</span><span>{p.sessionsPerWeek} sessions/wk</span></>}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProgramCard
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/ProgramCard.tsx apps/web/src/__tests__/ProgramCard.test.tsx
git commit -m "feat: add ProgramCard component"
```

---

### Task 7: `SearchBar` component

**Files:**
- Create: `apps/web/src/components/discovery/SearchBar.tsx`
- Create: `apps/web/src/__tests__/SearchBar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../components/discovery/SearchBar'

describe('SearchBar', () => {
  it('renders the placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText(/search programs/i)).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText(/search programs/i), 'boxing')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders the Search button', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- SearchBar
```

Expected: FAIL — `Cannot find module '../components/discovery/SearchBar'`

- [ ] **Step 3: Write `src/components/discovery/SearchBar.tsx`**

```tsx
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px 12px 18px',
        border: '1px solid var(--rule-2)', borderRadius: 12,
        background: 'var(--paper-1)', flex: 1,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="5" stroke="var(--ink-2)" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search programs, trainers, or styles…"
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: 'var(--ink-1)', fontFamily: 'inherit',
        }}
      />
      <span
        style={{
          padding: '4px 8px', background: 'var(--paper-3)', borderRadius: 5,
          fontSize: 11, color: 'var(--ink-2)', fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        ⌘ K
      </span>
      <button
        type="button"
        style={{
          padding: '8px 16px', background: 'var(--accent)', color: 'var(--paper-1)',
          border: 0, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Search
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- SearchBar
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/SearchBar.tsx apps/web/src/__tests__/SearchBar.test.tsx
git commit -m "feat: add SearchBar component"
```

---

### Task 8: `NotificationBell` component

**Files:**
- Create: `apps/web/src/components/discovery/NotificationBell.tsx`
- Create: `apps/web/src/__tests__/NotificationBell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/NotificationBell.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationBell } from '../components/discovery/NotificationBell'

describe('NotificationBell', () => {
  it('renders the bell button', () => {
    render(<NotificationBell count={0} />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows count badge when count > 0', () => {
    render(<NotificationBell count={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show badge when count is 0', () => {
    render(<NotificationBell count={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- NotificationBell
```

Expected: FAIL — `Cannot find module '../components/discovery/NotificationBell'`

- [ ] **Step 3: Write `src/components/discovery/NotificationBell.tsx`**

```tsx
interface NotificationBellProps {
  count?: number
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        aria-label="Notifications"
        type="button"
        style={{
          width: 38, height: 38, borderRadius: 999,
          border: '1px solid var(--rule)', background: 'var(--paper-1)',
          color: 'var(--ink-1)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative', padding: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {count > 0 && (
          <span
            style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 16, height: 16, padding: '0 4px',
              borderRadius: 8, background: 'var(--accent)', color: 'var(--paper-1)',
              fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: '2px solid var(--paper-1)', lineHeight: 1,
            }}
          >
            {count}
          </span>
        )}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- NotificationBell
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/NotificationBell.tsx apps/web/src/__tests__/NotificationBell.test.tsx
git commit -m "feat: add NotificationBell component"
```

---

### Task 9: `TopNav` component

**Files:**
- Create: `apps/web/src/components/layout/TopNav.tsx`
- Create: `apps/web/src/__tests__/TopNav.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/TopNav.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopNav } from '../components/layout/TopNav'

describe('TopNav', () => {
  it('renders the komuna wordmark', () => {
    render(<TopNav loggedIn={false} />)
    expect(screen.getByText('komuna')).toBeInTheDocument()
  })

  it('shows My bookings and notification bell when logged in', () => {
    render(<TopNav loggedIn={true} />)
    expect(screen.getByText('My bookings')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows Get started button when logged out', () => {
    render(<TopNav loggedIn={false} />)
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.queryByText('My bookings')).not.toBeInTheDocument()
  })

  it('shows Discover as the active nav link', () => {
    render(<TopNav loggedIn={false} />)
    expect(screen.getByText('Discover')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- TopNav
```

Expected: FAIL — `Cannot find module '../components/layout/TopNav'`

- [ ] **Step 3: Write `src/components/layout/TopNav.tsx`**

```tsx
import { NotificationBell } from '../discovery/NotificationBell'

interface TopNavProps {
  loggedIn: boolean
}

export function TopNav({ loggedIn }: TopNavProps) {
  return (
    <header
      style={{
        height: 68, borderBottom: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', padding: '0 40px', gap: 32,
        background: 'var(--paper-1)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 14, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--paper-1)', fontFamily: 'var(--font-serif, serif)', fontSize: 18, lineHeight: 1, paddingBottom: 2,
          }}
        >
          k
        </div>
        <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 22, color: 'var(--ink-1)', letterSpacing: '-0.01em' }}>
          komuna
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: 'var(--ink-2)', marginLeft: 16 }}>
        <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>Discover</span>
        <span>How it works</span>
        <span>For trainers</span>
        <span>Pricing</span>
      </nav>

      <div style={{ flex: 1 }} />

      {loggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>My bookings</span>
          <NotificationBell count={3} />
          {/* Avatar pill */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px 6px 6px', border: '1px solid var(--rule)',
              borderRadius: 999, background: 'var(--paper-2)',
            }}
          >
            <div
              style={{
                width: 26, height: 26, borderRadius: 13,
                background: 'var(--accent-soft)', color: 'var(--accent-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
              }}
            >
              MA
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-1)' }}>Maya</span>
            <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>▾</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Log in</span>
          <button
            type="button"
            style={{
              padding: '9px 18px', borderRadius: 999,
              background: 'var(--ink-1)', color: 'var(--paper-1)',
              border: 0, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Get started
          </button>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- TopNav
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/layout/TopNav.tsx apps/web/src/__tests__/TopNav.test.tsx
git commit -m "feat: add TopNav component"
```

---

### Task 10: `CategorySidebar` component

**Files:**
- Create: `apps/web/src/components/discovery/CategorySidebar.tsx`
- Create: `apps/web/src/__tests__/CategorySidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/CategorySidebar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategorySidebar } from '../components/discovery/CategorySidebar'
import { CATEGORIES } from '../data/programs'

describe('CategorySidebar', () => {
  it('renders all 9 categories', () => {
    render(<CategorySidebar activeId="all" onSelect={() => {}} />)
    for (const cat of CATEGORIES) {
      expect(screen.getByText(cat.label)).toBeInTheDocument()
    }
  })

  it('calls onSelect with category id when clicked', async () => {
    const onSelect = vi.fn()
    render(<CategorySidebar activeId="all" onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Boxing'))
    expect(onSelect).toHaveBeenCalledWith('Boxing')
  })

  it('highlights the active category', () => {
    render(<CategorySidebar activeId="Boxing" onSelect={() => {}} />)
    const boxing = screen.getByText('Boxing').closest('li')
    expect(boxing).toHaveStyle({ fontWeight: '500' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- CategorySidebar
```

Expected: FAIL — `Cannot find module '../components/discovery/CategorySidebar'`

- [ ] **Step 3: Write `src/components/discovery/CategorySidebar.tsx`**

```tsx
import { CATEGORIES } from '../../data/programs'

interface CategorySidebarProps {
  activeId: string
  onSelect: (id: string) => void
}

export function CategorySidebar({ activeId, onSelect }: CategorySidebarProps) {
  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      {/* Browse by category */}
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 14 }}>
        Browse by category
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {CATEGORIES.map(c => (
          <li
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
              background: c.id === activeId ? 'var(--paper-3)' : 'transparent',
              color: c.id === activeId ? 'var(--ink-1)' : 'var(--ink-2)',
              fontSize: 14,
              fontWeight: c.id === activeId ? 500 : 400,
            }}
          >
            <span>{c.label}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{c.count}</span>
          </li>
        ))}
      </ul>

      <div style={{ height: 1, background: 'var(--rule)', margin: '20px 0' }} />

      {/* Location */}
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 14 }}>
        Location
      </div>
      <div style={{ padding: '10px 12px', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 13, color: 'var(--ink-1)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Brooklyn, NY</span>
        <span style={{ color: 'var(--ink-3)' }}>5mi ▾</span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Within 1 mile', 'Within 5 miles', 'Within 25 miles', 'Online only'].map((l, i) => (
          <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', cursor: 'default' }}>
            <span
              style={{
                width: 14, height: 14, borderRadius: 3, border: '1px solid var(--rule-2)',
                background: i === 1 ? 'var(--ink-1)' : 'var(--paper-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {i === 1 && <span style={{ color: 'var(--paper-1)', fontSize: 10 }}>✓</span>}
            </span>
            {l}
          </label>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--rule)', margin: '20px 0' }} />

      {/* Visibility legend */}
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 14 }}>
        Visibility
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Open to anyone',  dot: 'var(--ok)'     },
          { label: 'Needs approval',  dot: 'var(--accent)' },
          { label: 'Invitation only', dot: 'var(--ink-2)'  },
        ].map(v => (
          <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: v.dot, flexShrink: 0 }} />
            {v.label}
          </div>
        ))}
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- CategorySidebar
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/CategorySidebar.tsx apps/web/src/__tests__/CategorySidebar.test.tsx
git commit -m "feat: add CategorySidebar component"
```

---

### Task 11: `FilterChips` component

**Files:**
- Create: `apps/web/src/components/discovery/FilterChips.tsx`
- Create: `apps/web/src/__tests__/FilterChips.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/FilterChips.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterChips } from '../components/discovery/FilterChips'

const chips = ['Open today', 'Within 5mi', 'Under $30']

describe('FilterChips', () => {
  it('renders all chips', () => {
    render(<FilterChips chips={chips} onRemove={() => {}} />)
    for (const chip of chips) {
      expect(screen.getByText(new RegExp(chip))).toBeInTheDocument()
    }
  })

  it('calls onRemove with chip label when × is clicked', async () => {
    const onRemove = vi.fn()
    render(<FilterChips chips={chips} onRemove={onRemove} />)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await userEvent.click(removeButtons[0])
    expect(onRemove).toHaveBeenCalledWith('Open today')
  })

  it('renders nothing when chips array is empty', () => {
    const { container } = render(<FilterChips chips={[]} onRemove={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- FilterChips
```

Expected: FAIL — `Cannot find module '../components/discovery/FilterChips'`

- [ ] **Step 3: Write `src/components/discovery/FilterChips.tsx`**

```tsx
interface FilterChipsProps {
  chips: string[]
  onRemove: (chip: string) => void
}

export function FilterChips({ chips, onRemove }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {chips.map(chip => (
        <span
          key={chip}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', border: '1px solid var(--rule)',
            borderRadius: 999, fontSize: 12, color: 'var(--ink-1)',
            background: 'var(--paper-2)',
          }}
        >
          {chip}
          <button
            type="button"
            aria-label={`Remove ${chip}`}
            onClick={() => onRemove(chip)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-3)', fontSize: 12, padding: '0 0 0 2px', lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- FilterChips
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/FilterChips.tsx apps/web/src/__tests__/FilterChips.test.tsx
git commit -m "feat: add FilterChips component"
```

---

### Task 12: `ProgramGrid` component

**Files:**
- Create: `apps/web/src/components/discovery/ProgramGrid.tsx`
- Create: `apps/web/src/__tests__/ProgramGrid.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/ProgramGrid.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramGrid } from '../components/discovery/ProgramGrid'
import { PROGRAMS } from '../data/programs'

describe('ProgramGrid', () => {
  it('renders all programs', () => {
    render(<ProgramGrid programs={PROGRAMS} />)
    for (const p of PROGRAMS) {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    }
  })

  it('renders only the provided subset', () => {
    const subset = PROGRAMS.filter(p => p.category === 'Boxing')
    render(<ProgramGrid programs={subset} />)
    expect(screen.getAllByText(/Open|Apply|Invite/)).toHaveLength(subset.length)
    expect(screen.queryByText('Slow Flow with Ines')).not.toBeInTheDocument()
  })

  it('shows the show-more button', () => {
    render(<ProgramGrid programs={PROGRAMS} />)
    expect(screen.getByRole('button', { name: /show .* more/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProgramGrid
```

Expected: FAIL — `Cannot find module '../components/discovery/ProgramGrid'`

- [ ] **Step 3: Write `src/components/discovery/ProgramGrid.tsx`**

```tsx
import type { ProgramListItem } from '../../data/programs'
import { ProgramCard } from './ProgramCard'

interface ProgramGridProps {
  programs: ProgramListItem[]
}

export function ProgramGrid({ programs }: ProgramGridProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {programs.map(p => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          type="button"
          style={{
            padding: '12px 24px', background: 'transparent',
            border: '1px solid var(--rule-2)', borderRadius: 10,
            color: 'var(--ink-1)', fontSize: 14, cursor: 'pointer',
          }}
        >
          Show 242 more programs
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProgramGrid
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/ProgramGrid.tsx apps/web/src/__tests__/ProgramGrid.test.tsx
git commit -m "feat: add ProgramGrid component"
```

---

### Task 13: `HeroSearch` component

**Files:**
- Create: `apps/web/src/components/discovery/HeroSearch.tsx`
- Create: `apps/web/src/__tests__/HeroSearch.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/HeroSearch.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSearch } from '../components/discovery/HeroSearch'

describe('HeroSearch', () => {
  it('renders the headline', () => {
    render(<HeroSearch searchValue="" onSearchChange={() => {}} />)
    expect(screen.getByText(/book your meeting/i)).toBeInTheDocument()
    expect(screen.getByText(/trainer\./i)).toBeInTheDocument()
  })

  it('renders the search bar', () => {
    render(<HeroSearch searchValue="" onSearchChange={() => {}} />)
    expect(screen.getByPlaceholderText(/search programs/i)).toBeInTheDocument()
  })

  it('renders the quick-filter chips', () => {
    render(<HeroSearch searchValue="" onSearchChange={() => {}} />)
    expect(screen.getByText('Boxing near me')).toBeInTheDocument()
    expect(screen.getByText('Morning yoga')).toBeInTheDocument()
    expect(screen.getByText('Open today')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- HeroSearch
```

Expected: FAIL — `Cannot find module '../components/discovery/HeroSearch'`

- [ ] **Step 3: Write `src/components/discovery/HeroSearch.tsx`**

```tsx
import { SearchBar } from './SearchBar'

const QUICK_FILTERS = ['Boxing near me', 'Morning yoga', 'Online HIIT', '1:1 coaching', 'Open today']

interface HeroSearchProps {
  searchValue: string
  onSearchChange: (value: string) => void
}

export function HeroSearch({ searchValue, onSearchChange }: HeroSearchProps) {
  return (
    <section
      style={{
        padding: '80px 64px 60px', borderBottom: '1px solid var(--rule)',
        background: 'var(--paper-2)', textAlign: 'center',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 20,
        }}
      >
        — A home for session-based practice —
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: 'var(--font-serif, serif)', fontSize: 72, lineHeight: 1,
          letterSpacing: '-0.03em', color: 'var(--ink-1)',
          margin: '0 auto', maxWidth: 900, textWrap: 'pretty',
        }}
      >
        Book your meeting
        <br />
        with your{' '}
        <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>trainer.</em>
      </h1>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-sans, sans-serif)', fontSize: 17, lineHeight: 1.55,
          color: 'var(--ink-2)', maxWidth: 580, margin: '20px auto 0',
        }}
      >
        Komuna is where independent coaches and studios run their session-based practice.
        Browse open programs near you, redeem packages, and never miss a round.
      </p>

      {/* Search bar */}
      <div style={{ maxWidth: 720, margin: '32px auto 0', display: 'flex' }}>
        <SearchBar value={searchValue} onChange={onSearchChange} />
      </div>

      {/* Quick-filter chips */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
        {QUICK_FILTERS.map(t => (
          <span
            key={t}
            style={{
              padding: '7px 14px', border: '1px solid var(--rule)',
              borderRadius: 999, fontSize: 12, color: 'var(--ink-2)',
              background: 'var(--paper-1)',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- HeroSearch
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/discovery/HeroSearch.tsx apps/web/src/__tests__/HeroSearch.test.tsx
git commit -m "feat: add HeroSearch component"
```

---

### Task 14: `Footer` component

**Files:**
- Create: `apps/web/src/components/layout/Footer.tsx`

No test needed — pure presentational, no logic.

- [ ] **Step 1: Write `src/components/layout/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer
      style={{
        padding: '32px 64px', borderTop: '1px solid var(--rule)',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--ink-3)',
      }}
    >
      <span>© Komuna · Brooklyn → everywhere</span>
      <span style={{ display: 'flex', gap: 20 }}>
        <span>Trainers</span>
        <span>Studios</span>
        <span>Help</span>
        <span>Terms</span>
      </span>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/layout/Footer.tsx
git commit -m "feat: add Footer component"
```

---

### Task 15: `DiscoveryPage` — assemble with state

**Files:**
- Create: `apps/web/src/pages/DiscoveryPage.tsx`
- Create: `apps/web/src/__tests__/DiscoveryPage.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/DiscoveryPage.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiscoveryPage } from '../pages/DiscoveryPage'

describe('DiscoveryPage', () => {
  it('renders all 6 programs on initial load', () => {
    render(<DiscoveryPage />)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
    expect(screen.getByText('Slow Flow with Ines')).toBeInTheDocument()
    expect(screen.getByText('Strong Together')).toBeInTheDocument()
    expect(screen.getByText('Sprint Lab')).toBeInTheDocument()
    expect(screen.getByText('Roundhouse Muay Thai')).toBeInTheDocument()
    expect(screen.getByText('Sunrise Vinyasa')).toBeInTheDocument()
  })

  it('filters to boxing programs when Boxing category is selected', async () => {
    render(<DiscoveryPage />)
    await userEvent.click(screen.getByText('Boxing'))
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
    expect(screen.getByText('Roundhouse Muay Thai')).toBeInTheDocument()
    expect(screen.queryByText('Slow Flow with Ines')).not.toBeInTheDocument()
    expect(screen.queryByText('Sprint Lab')).not.toBeInTheDocument()
  })

  it('shows all programs again when All programs is selected', async () => {
    render(<DiscoveryPage />)
    await userEvent.click(screen.getByText('Boxing'))
    await userEvent.click(screen.getByText('All programs'))
    expect(screen.getByText('Slow Flow with Ines')).toBeInTheDocument()
  })

  it('removes a filter chip when × is clicked', async () => {
    render(<DiscoveryPage />)
    const removeBtn = screen.getAllByRole('button', { name: /remove/i })[0]
    await userEvent.click(removeBtn)
    // chip is gone; programs grid is unaffected (chips are decorative)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- DiscoveryPage
```

Expected: FAIL — `Cannot find module '../pages/DiscoveryPage'`

- [ ] **Step 3: Write `src/pages/DiscoveryPage.tsx`**

```tsx
import { useState } from 'react'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { HeroSearch } from '../components/discovery/HeroSearch'
import { SearchBar } from '../components/discovery/SearchBar'
import { CategorySidebar } from '../components/discovery/CategorySidebar'
import { FilterChips } from '../components/discovery/FilterChips'
import { ProgramGrid } from '../components/discovery/ProgramGrid'
import { PROGRAMS } from '../data/programs'

const DEFAULT_CHIPS = ['Open today', 'Within 5mi', 'Under $30', '★ 4.8+']

export function DiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeChips, setActiveChips] = useState(DEFAULT_CHIPS)
  const [searchValue, setSearchValue] = useState('')

  const filteredPrograms = activeCategory === 'all'
    ? PROGRAMS
    : PROGRAMS.filter(p => p.category === activeCategory)

  function removeChip(chip: string) {
    setActiveChips(prev => prev.filter(c => c !== chip))
  }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <HeroSearch searchValue={searchValue} onSearchChange={setSearchValue} />

      {/* Available programs */}
      <section style={{ padding: '56px 64px 80px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--ink-3)', marginBottom: 10,
              }}
            >
              §02 · Discover
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, serif)', fontSize: 36,
                letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: 0,
              }}
            >
              Available programs
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8, maxWidth: 480 }}>
              248 programs from independent coaches and studios. Filter by what you actually want to do this week.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--ink-2)' }}>
            <span>Sort:</span>
            <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>Closest first ▾</span>
          </div>
        </div>

        {/* Sidebar + grid */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <CategorySidebar activeId={activeCategory} onSelect={setActiveCategory} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SearchBar value={searchValue} onChange={setSearchValue} />
            <FilterChips chips={activeChips} onRemove={removeChip} />
            <ProgramGrid programs={filteredPrograms} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- DiscoveryPage
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/DiscoveryPage.tsx apps/web/src/__tests__/DiscoveryPage.test.tsx
git commit -m "feat: add DiscoveryPage with category filter state"
```

---

### Task 16: `App.tsx` and final smoke test

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Write `src/App.tsx`**

```tsx
import { DiscoveryPage } from './pages/DiscoveryPage'

export default function App() {
  return <DiscoveryPage />
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: All tests pass. Output should show something like:

```
✓ src/__tests__/programs.test.ts (3)
✓ src/__tests__/ProgramCard.test.tsx (6)
✓ src/__tests__/SearchBar.test.tsx (3)
✓ src/__tests__/NotificationBell.test.tsx (3)
✓ src/__tests__/TopNav.test.tsx (4)
✓ src/__tests__/CategorySidebar.test.tsx (3)
✓ src/__tests__/FilterChips.test.tsx (3)
✓ src/__tests__/ProgramGrid.test.tsx (3)
✓ src/__tests__/HeroSearch.test.tsx (3)
✓ src/__tests__/DiscoveryPage.test.tsx (4)

Test Files  10 passed
Tests       35 passed
```

- [ ] **Step 3: Start the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Warm cream background (not white)
- TopNav with "komuna" serif wordmark, notification bell, avatar pill
- Hero section centered with large serif headline and "trainer." in terracotta
- Search bar with ⌘ K badge
- Quick-filter chips below search
- "Available programs" heading + category sidebar + 3-column card grid
- All 6 program cards with striped placeholder images, visibility badges, category tags, prices
- Category sidebar filters cards when clicked
- Filter chips dismiss when × clicked
- Footer strip at bottom

- [ ] **Step 4: Final commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: wire App.tsx, discovery page complete"
```
