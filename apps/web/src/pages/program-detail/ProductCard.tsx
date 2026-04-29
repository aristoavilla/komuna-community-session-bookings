import { Link } from 'react-router-dom'
import type { ProductMock } from '../../data/programs'

const TONE_STYLES: Record<ProductMock['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

interface ProductCardProps {
  product: ProductMock
  programId: string
}

export function ProductCard({ product: p, programId }: ProductCardProps) {
  const t = TONE_STYLES[p.imageTone]
  const href = `/programs/${programId}/products/${p.id}`

  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper-1)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            aspectRatio: '16 / 9',
            background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
            color: t.fg,
            display: 'flex',
            alignItems: 'flex-end',
            padding: 14,
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
            top: 12,
            right: 12,
            padding: '4px 9px',
            background: 'var(--ink-1)',
            color: 'var(--paper-1)',
            borderRadius: 6,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {p.type}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 19,
              color: 'var(--ink-1)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            {p.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--ink-2)',
              marginTop: 6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {p.description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--rule)',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>
              {p.lowestPrice}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {p.type === 'session' ? '/ session' : '/ pass'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {p.type === 'session' && p.sessionsPerWeek
              ? `${p.sessionsPerWeek} sessions/wk`
              : 'Redeemable'}
          </span>
        </div>

        <Link
          to={href}
          style={{
            fontSize: 13,
            color: 'var(--accent)',
            textDecoration: 'none',
            marginTop: 4,
          }}
        >
          {p.type === 'session' ? '→ View sessions' : '→ View details'}
        </Link>
      </div>
    </div>
  )
}
