import { useParams, Link } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { HeroSection } from './product-detail/HeroSection'
import { SessionsSection } from './product-detail/SessionsSection'
import { PackagesSection } from './product-detail/PackagesSection'

export function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>()

  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find((p) => p.id === productId)

  if (!id || !program || !productId || !product) {
    return (
      <div
        style={{
          background: 'var(--paper-1)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Product not found.</p>
      </div>
    )
  }

  const filteredPackages = PACKAGES.filter(
    (pkg) =>
      pkg.program_id === id &&
      pkg.entries.some((e) => e.product_id === productId)
  )

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />

      <div
        style={{
          padding: '20px 64px',
          fontSize: 13,
          color: 'var(--ink-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        <Link to="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          Discover
        </Link>
        <span>→</span>
        <Link to={`/programs/${id}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          {program.name}
        </Link>
        <span>→</span>
        <span style={{ color: 'var(--ink-1)' }}>{product.name}</span>
      </div>

      <HeroSection product={product} program={program} />

      {product.type === 'session' && product.sessions && product.sessions.length > 0 && (
        <SessionsSection sessions={product.sessions} timezone={program.timezone} />
      )}

      <PackagesSection packages={filteredPackages} programId={id} />

      <Footer />
    </div>
  )
}
