import type { PackageMock, ProgramListItem } from '../../data/programs'

interface PackageSummaryProps {
  pkg: PackageMock
  program: ProgramListItem
}

export function PackageSummary({ pkg, program }: PackageSummaryProps) {
  // Tone-based color mappings
  const toneMap = {
    warm: { bg: '#f5ede8', stripe: '#e8d8cf' },
    cool: { bg: '#e8eff5', stripe: '#d0dde8' },
    ink: { bg: '#e8e8ec', stripe: '#d4d4da' },
    accent: { bg: '#f5ece8', stripe: '#e8d8cf' },
  }
  const tone = toneMap[program.imageTone]

  // Split package name to italicize last word
  const words = pkg.name.split(' ')
  const lastWord = words.pop()
  const firstWords = words.join(' ')

  return (
    <div>
      {/* Section label */}
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 24,
        }}
      >
        §01 · Package
      </div>

      {/* Image placeholder */}
      <div
        style={{
          aspectRatio: '16/9',
          borderRadius: 12,
          marginBottom: 20,
          background: `repeating-linear-gradient(135deg, ${tone.bg}, ${tone.bg} 8px, ${tone.stripe} 8px, ${tone.stripe} 16px)`,
        }}
      />

      {/* Program badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: 999,
          background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
          color: 'var(--accent)',
          fontSize: 11,
          fontFamily: 'var(--font-sans, sans-serif)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {program.name}
      </div>

      {/* Package name with last word italicized */}
      <div
        style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 56,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          color: 'var(--ink-1)',
          marginBottom: 32,
        }}
      >
        {firstWords && <span>{firstWords} </span>}
        {lastWord && (
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{lastWord}</em>
        )}
      </div>

      {/* Entry list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {pkg.entries.map((entry) => {
          const quantityDisplay = entry.quantity >= 999 ? '∞' : String(entry.quantity)
          return (
            <div key={entry.id}>
              <div
                style={{
                  borderTop: '1px solid var(--rule)',
                  paddingTop: 14,
                  paddingBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontFamily: 'var(--font-sans, sans-serif)',
                    color: 'var(--ink-1)',
                  }}
                >
                  {entry.product_name} ×{quantityDisplay}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--ink-3)',
                    marginTop: 4,
                  }}
                >
                  {entry.validity_rule}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
