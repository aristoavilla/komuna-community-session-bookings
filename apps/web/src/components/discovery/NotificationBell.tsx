interface NotificationBellProps {
  count?: number
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        aria-label="Notifications"
        type="button"
        style={{
          width: 38, height: 38, borderRadius: 999,
          border: '1px solid var(--rule)', background: 'var(--paper-1)',
          color: 'var(--ink-1)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative', padding: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {count > 0 && (
          <span
            style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 16, height: 16, padding: '0 4px',
              borderRadius: 8, background: 'var(--accent)', color: 'var(--paper-1)',
              fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: '2px solid var(--paper-1)', lineHeight: 1,
            }}
          >
            {count}
          </span>
        )}
      </button>
    </div>
  )
}
