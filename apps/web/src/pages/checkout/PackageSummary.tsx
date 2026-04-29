import type { PackageMock, ProgramDetailMock } from '../../data/programs'

const TONE_MAP = {
  warm: { bg: 'var(--placeholder-warm)', stripe: 'var(--placeholder-warm-stripe)' },
  cool: { bg: 'var(--placeholder-cool)', stripe: 'var(--placeholder-cool-stripe)' },
  ink: { bg: 'var(--ink-1)', stripe: 'var(--ink-2)' },
  accent: { bg: 'var(--accent-soft)', stripe: 'var(--accent-soft-stripe)' },
}

interface PackageSummaryProps {
  pkg: PackageMock
  program: ProgramDetailMock
}

export function PackageSummary({ pkg, program }: PackageSummaryProps) {
  const firstProduct = program.products.find(p => p.id === pkg.entries[0]?.product_id)
  const tone = TONE_MAP[(firstProduct?.imageTone ?? program.imageTone)]

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
          background: 'var(--accent-soft)',
          color: 'var(--accent-ink)',
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
            <div
              key={entry.id}
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
          )
        })}
      </div>
    </div>
  )
}
