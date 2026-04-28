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
