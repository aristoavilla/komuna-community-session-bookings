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
