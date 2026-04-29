import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { Breadcrumb } from './program-detail/Breadcrumb'
import { HeroSection } from './program-detail/HeroSection'
import { ProductsSection } from './program-detail/ProductsSection'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const detail = id ? PROGRAM_DETAILS[id] : undefined

  if (!detail) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Program not found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Breadcrumb programName={detail.name} />
      <HeroSection program={detail} />
      <ProductsSection products={detail.products} programId={detail.id} />
      <Footer />
    </div>
  )
}
