import { Link } from 'react-router-dom'

type AdminNavTileProps = {
  emoji: string
  title: string
  subtitle: string
  href: string
  badgeCount?: number
  urgent?: boolean
}

export function AdminNavTile({ emoji, title, subtitle, href, badgeCount, urgent }: AdminNavTileProps) {
  return (
    <Link
      to={href}
      style={{
        display: 'block',
        border: `1px solid ${urgent ? 'var(--accent)' : 'var(--rule)'}`,
        borderColor: urgent ? 'var(--accent)' : 'var(--rule)',
        background: urgent ? 'var(--accent-soft)' : 'transparent',
        borderRadius: 10,
        padding: 20,
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            color: urgent ? 'var(--accent)' : 'var(--ink-1)',
            fontWeight: 600,
          }}
        >
          {title}
        </span>
        {urgent && badgeCount !== undefined && badgeCount > 0 && (
          <span
            style={{
              background: 'var(--accent)',
              color: 'white',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              borderRadius: 999,
              padding: '1px 7px',
              lineHeight: 1.6,
            }}
          >
            {badgeCount}
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>
        {subtitle}
      </div>
      <span
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: urgent ? 'var(--accent)' : 'var(--ink-3)',
          fontSize: 14,
        }}
      >
        →
      </span>
    </Link>
  )
}
