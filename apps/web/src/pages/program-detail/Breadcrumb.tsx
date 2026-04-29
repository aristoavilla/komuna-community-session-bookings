import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  programName: string
}

export function Breadcrumb({ programName }: BreadcrumbProps) {
  return (
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
      <span style={{ color: 'var(--ink-1)' }}>{programName}</span>
    </div>
  )
}
