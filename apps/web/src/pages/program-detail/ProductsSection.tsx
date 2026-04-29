import type { ProductMock } from '../../data/programs'
import { ProductCard } from './ProductCard'

interface ProductsSectionProps {
  products: ProductMock[]
  programId: string
}

export function ProductsSection({ products, programId }: ProductsSectionProps) {
  return (
    <section style={{ padding: '56px 64px 80px', borderTop: '1px solid var(--rule)' }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 10,
          }}
        >
          §02 · Products
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 36,
            letterSpacing: '-0.02em',
            color: 'var(--ink-1)',
            margin: 0,
          }}
        >
          What's offered
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {products.map(p => (
          <ProductCard key={p.id} product={p} programId={programId} />
        ))}
      </div>
    </section>
  )
}
