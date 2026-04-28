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
