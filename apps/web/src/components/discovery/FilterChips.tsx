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
