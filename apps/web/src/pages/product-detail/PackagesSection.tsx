import type { PackageMock } from '../../data/programs'
import { PackageCard } from './PackageCard'

interface PackagesSectionProps {
  packages: PackageMock[]
  programId: string
}

export function PackagesSection({ packages, programId }: PackagesSectionProps) {
  return (
    <section style={{ padding: '56px 64px 80px' }}>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 12,
          }}
        >
          §04 · Purchase packages
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 36,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--ink-1)',
            margin: 0,
          }}
        >
          How to buy{' '}
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>in.</em>
        </h2>
        <div
          style={{
            fontSize: 14,
            color: 'var(--ink-2)',
            marginTop: 8,
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {packages.length} packages include this product
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginTop: 32,
        }}
      >
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} programId={programId} />
        ))}
      </div>
    </section>
  )
}
