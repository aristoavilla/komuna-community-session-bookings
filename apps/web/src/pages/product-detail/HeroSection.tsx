import type { ProductMock, ProgramDetailMock } from '../../data/programs'

const TONE_STYLES: Record<ProductMock['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

function StatCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 32,
          letterSpacing: '-0.02em',
          color: 'var(--ink-1)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6 }}>{sub}</div>
    </div>
  )
}

interface HeroSectionProps {
  product: ProductMock
  program: ProgramDetailMock
}

export function HeroSection({ product: p, program }: HeroSectionProps) {
  const t = TONE_STYLES[p.imageTone]

  const words = p.name.split(' ')
  const lastWord = words.pop()!
  const restOfName = words.join(' ')

  return (
    <section
      style={{
        padding: '0 64px 56px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.05fr',
        gap: 56,
        alignItems: 'stretch',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            aspectRatio: '4 / 5',
            background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
            color: t.fg,
            display: 'flex',
            alignItems: 'flex-end',
            padding: 14,
            borderRadius: 4,
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
            {p.imageLabel}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--paper-1)',
            border: '1px solid var(--rule)',
            padding: '6px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--ink-1)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              color: 'var(--ink-3)',
              letterSpacing: '0.06em',
            }}
          >
            §02
          </span>
          <span>{p.type === 'session' ? 'Session product' : 'Simple product'}</span>
        </div>

        {p.type === 'session' && p.capacity != null && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              padding: '6px 12px',
              background: 'var(--ink-1)',
              color: 'var(--paper-1)',
              borderRadius: 12,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            CAP · {p.capacity} PEOPLE
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 8 }}>
        <div>
          {program.category && (
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  padding: '5px 11px',
                  borderRadius: 999,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-ink)',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontWeight: 500,
                }}
              >
                {program.category}
              </span>
            </div>
          )}

          <h1
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 76,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--ink-1)',
              margin: 0,
            }}
          >
            {restOfName && <>{restOfName}<br /></>}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{lastWord}</em>
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--ink-2)',
              marginTop: 24,
              maxWidth: 540,
            }}
          >
            {p.description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            padding: '28px 0',
            borderTop: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
            marginTop: 36,
          }}
        >
          {p.type === 'session' ? (
            <>
              <StatCell label="Per session" value={p.lowestPrice} sub="per session" />
              <StatCell label="Capacity" value={String(p.capacity ?? '—')} sub="people" />
              <StatCell label="Sessions / wk" value={String(p.sessionsPerWeek ?? '—')} sub="per week" />
              <StatCell label="Voucher valid" value={String(p.validityDays ?? '—')} sub="days" />
            </>
          ) : (
            <>
              <StatCell label="Price" value={p.lowestPrice} sub="" />
              <StatCell label="Voucher valid" value={String(p.validityDays ?? '—')} sub="days" />
            </>
          )}
        </div>

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          {p.type === 'session' ? (
            <>
              <button
                type="button"
                style={{
                  padding: '14px 24px',
                  background: 'var(--accent)',
                  color: 'var(--paper-1)',
                  border: 0,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans, sans-serif)',
                }}
              >
                Reserve a session →
              </button>
              <button
                type="button"
                style={{
                  padding: '14px 24px',
                  background: 'transparent',
                  color: 'var(--ink-1)',
                  border: '1px solid var(--ink-1)',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans, sans-serif)',
                }}
              >
                Buy a package →
              </button>
            </>
          ) : (
            <button
              type="button"
              style={{
                padding: '14px 24px',
                background: 'var(--accent)',
                color: 'var(--paper-1)',
                border: 0,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans, sans-serif)',
              }}
            >
              Get this product →
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
