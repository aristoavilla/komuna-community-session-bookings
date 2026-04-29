import { Link } from 'react-router-dom'
import type { PackageMock } from '../../data/programs'

interface PackageCardProps {
  pkg: PackageMock
  programId: string
}

export function PackageCard({ pkg, programId }: PackageCardProps) {
  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 14,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--paper-1)',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 22,
            color: 'var(--ink-1)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          {pkg.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 36,
              color: 'var(--ink-1)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {pkg.price}
          </span>
          <span
            style={{
              fontSize: 13,
              color: 'var(--ink-2)',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            / package
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pkg.entries.map((entry) => {
          const quantityDisplay = entry.quantity >= 999 ? '∞' : String(entry.quantity)
          return (
            <div key={entry.id}>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--ink-1)',
                  fontFamily: 'var(--font-sans, sans-serif)',
                }}
              >
                {entry.product_name} · ×{quantityDisplay}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--font-mono, monospace)',
                  marginTop: 2,
                }}
              >
                {entry.validity_rule}
              </div>
            </div>
          )
        })}
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed var(--rule)', margin: 0 }} />

      <Link
        to={`/programs/${programId}/packages/${pkg.id}/checkout`}
        style={{
          fontSize: 13,
          color: 'var(--accent)',
          textDecoration: 'none',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        Buy this package →
      </Link>
    </div>
  )
}
