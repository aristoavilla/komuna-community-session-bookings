import type { SessionInstanceMock } from '../../data/programs'

interface SessionRowProps {
  session: SessionInstanceMock
  isFirst: boolean
}

function SessionRow({ session: s, isFirst }: SessionRowProps) {
  const start = new Date(s.start_time)
  const end = new Date(s.end_time)

  const dayOfWeek = start.toLocaleDateString('en-US', { weekday: 'short' })
  const dayOfMonth = start.getDate()

  const timeRange = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`

  const durationMs = end.getTime() - start.getTime()
  const durationMin = Math.round(durationMs / 60000)

  const open = s.capacity - s.taken
  const fillPct = Math.min((s.taken / s.capacity) * 100, 100)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr auto auto',
        gap: 24,
        padding: '20px 24px',
        borderTop: isFirst ? 'none' : '1px solid var(--rule)',
        alignItems: 'center',
        opacity: s.status === 'past' ? 0.45 : 1,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 2,
          }}
        >
          {dayOfWeek}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 32,
            color: 'var(--ink-1)',
            lineHeight: 1,
          }}
        >
          {dayOfMonth}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--ink-1)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {timeRange}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--ink-2)',
            marginTop: 4,
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          with {s.coach} · {durationMin} min
        </div>
      </div>

      <div style={{ minWidth: 160 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 6,
          }}
        >
          {s.taken}/{s.capacity} TAKEN
          {' '}
          <span style={{ color: s.status === 'full' ? 'var(--ink-3)' : 'var(--ink-2)' }}>
            {s.status === 'full' ? 'WAITLIST' : `${open} OPEN`}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 4,
            background: 'var(--paper-3)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${fillPct}%`,
              height: '100%',
              background: s.status === 'full' ? 'var(--ink-3)' : 'var(--accent)',
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      <div style={{ minWidth: 110 }}>
        {s.status === 'open' && (
          <button
            type="button"
            style={{
              padding: '8px 14px',
              background: 'var(--ink-1)',
              color: 'var(--paper-1)',
              border: 0,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Reserve →
          </button>
        )}
        {s.status === 'full' && (
          <button
            type="button"
            style={{
              padding: '8px 14px',
              background: 'transparent',
              color: 'var(--ink-1)',
              border: '1px solid var(--ink-1)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Join waitlist
          </button>
        )}
        {s.status === 'past' && (
          <button
            type="button"
            style={{
              padding: '8px 14px',
              background: 'transparent',
              color: 'var(--ink-3)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'default',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Past
          </button>
        )}
      </div>
    </div>
  )
}

interface SessionsSectionProps {
  sessions: SessionInstanceMock[]
  timezone: string
}

export function SessionsSection({ sessions, timezone }: SessionsSectionProps) {
  if (sessions.length === 0) return null

  return (
    <section
      style={{
        padding: '32px 64px 72px',
        background: 'var(--paper-2)',
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
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
          §03 · Schedule
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--ink-1)',
            margin: 0,
          }}
        >
          Upcoming{' '}
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>instances.</em>
        </h2>
        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-2)',
            marginTop: 10,
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          Times shown in {timezone} (program timezone)
        </div>
      </div>

      <div
        style={{
          background: 'var(--paper-1)',
          border: '1px solid var(--rule)',
          borderRadius: 14,
          overflow: 'hidden',
          marginTop: 32,
        }}
      >
        {sessions.map((session, i) => (
          <SessionRow key={session.id} session={session} isFirst={i === 0} />
        ))}
      </div>
    </section>
  )
}
