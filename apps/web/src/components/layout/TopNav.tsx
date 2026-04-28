import { NotificationBell } from '../discovery/NotificationBell'

interface TopNavProps {
  loggedIn: boolean
}

export function TopNav({ loggedIn }: TopNavProps) {
  return (
    <header
      style={{
        height: 68, borderBottom: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', padding: '0 40px', gap: 32,
        background: 'var(--paper-1)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 14, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--paper-1)', fontFamily: 'var(--font-serif, serif)', fontSize: 18, lineHeight: 1, paddingBottom: 2,
          }}
        >
          k
        </div>
        <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 22, color: 'var(--ink-1)', letterSpacing: '-0.01em' }}>
          komuna
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: 'var(--ink-2)', marginLeft: 16 }}>
        <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>Discover</span>
        <span>How it works</span>
        <span>For trainers</span>
        <span>Pricing</span>
      </nav>

      <div style={{ flex: 1 }} />

      {loggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>My bookings</span>
          <NotificationBell count={3} />
          {/* Avatar pill */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px 6px 6px', border: '1px solid var(--rule)',
              borderRadius: 999, background: 'var(--paper-2)',
            }}
          >
            <div
              style={{
                width: 26, height: 26, borderRadius: 13,
                background: 'var(--accent-soft)', color: 'var(--accent-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
              }}
            >
              MA
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-1)' }}>Maya</span>
            <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>▾</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Log in</span>
          <button
            type="button"
            style={{
              padding: '9px 18px', borderRadius: 999,
              background: 'var(--ink-1)', color: 'var(--paper-1)',
              border: 0, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Get started
          </button>
        </div>
      )}
    </header>
  )
}
