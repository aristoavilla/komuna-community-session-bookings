import { useParams, Link } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { PackageSummary } from './checkout/PackageSummary'
import { OrderSummaryCard } from './checkout/OrderSummaryCard'

export function CheckoutPage() {
  const { id, packageId } = useParams<{ id: string; packageId: string }>()

  const program = id ? PROGRAM_DETAILS[id] : undefined
  const pkg = packageId
    ? PACKAGES.find((p) => p.id === packageId && p.program_id === id)
    : undefined

  if (!id || !program || !packageId || !pkg) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Package not found.</p>
      </div>
    )
  }

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
        <span style={{ color: 'var(--ink-3)' }}>{pkg.name}</span>
        <span>→</span>
        <span style={{ color: 'var(--ink-1)' }}>Checkout</span>
      </div>

      <div
        style={{
          padding: '0 64px',
          marginTop: 48,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 48,
          alignItems: 'start',
        }}
      >
        <PackageSummary pkg={pkg} program={program} />
        <OrderSummaryCard pkg={pkg} />
      </div>

      <Footer />
    </div>
  )
}
