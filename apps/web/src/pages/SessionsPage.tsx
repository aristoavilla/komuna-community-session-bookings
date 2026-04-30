import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PROGRAM_DETAILS, SESSION_INSTANCES } from '../data/programs'
import type { SessionInstanceMock } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'

const PAGE_SIZE = 8
type ViewMode = 'list' | 'week' | 'month'

interface SessionsPageProps {
  sessions?: SessionInstanceMock[]
}

function formatTime(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz,
  })
}

function formatDateParts(iso: string, tz: string) {
  const d = new Date(iso)
  return {
    dow: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: tz }),
    day: d.toLocaleDateString('en-US', { day: 'numeric', timeZone: tz }),
    mon: d.toLocaleDateString('en-US', { month: 'short', timeZone: tz }),
    yr:  d.toLocaleDateString('en-US', { year: '2-digit', timeZone: tz }),
  }
}

function SessionRow({ s, isFirst, tz }: { s: SessionInstanceMock; isFirst: boolean; tz: string }) {
  const { dow, day, mon, yr } = formatDateParts(s.start_time, tz)
  const timeRange = `${formatTime(s.start_time, tz)} – ${formatTime(s.end_time, tz)}`
  const durationMin = Math.round(
    (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000,
  )
  const fillPct = Math.min((s.taken / s.capacity) * 100, 100)
  const open = s.capacity - s.taken

  return (
    <div
      data-testid="session-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 1fr auto auto',
        gap: 24,
        padding: '20px 24px',
        borderTop: isFirst ? 'none' : '1px solid var(--rule)',
        alignItems: 'center',
        opacity: s.status === 'past' ? 0.45 : 1,
        background: s.status === 'out-of-window' ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      {/* Date */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 2 }}>
          {dow}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink-1)', lineHeight: 1 }}>
          {day}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 3 }}>
          {mon} '{yr}
        </div>
      </div>

      {/* Time + coach */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-1)', fontFamily: 'var(--font-sans)' }}>
          {timeRange}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, fontFamily: 'var(--font-sans)' }}>
          with {s.coach} · {durationMin} min
        </div>
        {s.status === 'out-of-window' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 6, padding: '2px 8px', background: 'var(--accent-soft-stripe)', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent-ink)' }}>
            Outside booking window
          </div>
        )}
      </div>

      {/* Capacity */}
      {s.status !== 'out-of-window' && s.status !== 'past' ? (
        <div style={{ minWidth: 160 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span>{s.taken}/{s.capacity} taken</span>
            <span style={{ color: s.status === 'full' ? 'var(--ink-3)' : 'var(--ink-2)' }}>
              {s.status === 'full' ? 'full' : `${open} open`}
            </span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${fillPct}%`, height: '100%', background: s.status === 'full' ? 'var(--ink-3)' : 'var(--accent)', borderRadius: 2 }} />
          </div>
        </div>
      ) : (
        <div style={{ minWidth: 160 }} />
      )}

      {/* Action */}
      <div style={{ minWidth: 136 }}>
        {s.status === 'open' && (
          <button type="button" style={{ width: '100%', padding: '8px 16px', background: 'var(--ink-1)', color: 'var(--paper-1)', border: 0, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Reserve →
          </button>
        )}
        {s.status === 'full' && (
          <button type="button" style={{ width: '100%', padding: '8px 16px', background: 'transparent', color: 'var(--ink-1)', border: '1px solid var(--ink-1)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Join waitlist
          </button>
        )}
        {s.status === 'out-of-window' && (
          <button type="button" style={{ width: '100%', padding: '8px 16px', background: 'transparent', color: 'var(--accent-ink)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Request booking
          </button>
        )}
        {s.status === 'past' && (
          <span style={{ padding: '8px 16px', color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-sans)', display: 'block' }}>
            Past
          </span>
        )}
      </div>
    </div>
  )
}

export function SessionsPage({ sessions: sessionsProp }: SessionsPageProps) {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const [showPast, setShowPast] = useState(false)
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('list')

  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find((p) => p.id === productId)

  if (!id || !program || !productId || !product) {
    return (
      <div style={{ background: 'var(--paper-1)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-2)', fontSize: 16, fontFamily: 'var(--font-sans)' }}>
          Product not found.
        </p>
      </div>
    )
  }

  if (product.type === 'simple') {
    return (
      <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
        <TopNav loggedIn={true} />
        <div style={{ padding: '20px 64px', fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Discover</Link>
          <span>→</span>
          <Link to={`/programs/${id}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{program.name}</Link>
          <span>→</span>
          <Link to={`/programs/${id}/products/${productId}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{product.name}</Link>
          <span>→</span>
          <span style={{ color: 'var(--ink-1)' }}>Sessions</span>
        </div>
        <div style={{ padding: '120px 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            Simple product
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: 0 }}>
            No sessions to show.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: 'var(--ink-1)' }}>{product.name}</strong> is a simple product — redeem it directly from your wallet.
          </p>
          <Link to={`/programs/${id}/products/${productId}`} style={{ marginTop: 8, padding: '10px 20px', background: 'var(--ink-1)', color: 'var(--paper-1)', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', textDecoration: 'none' }}>
            ← Back to product
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const allSessions = sessionsProp ?? SESSION_INSTANCES[productId] ?? []
  const upcomingCount = allSessions.filter((s) => s.status !== 'past').length
  const filtered = showPast ? allSessions : allSessions.filter((s) => s.status !== 'past')
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const handleShowPastToggle = () => { setShowPast((v) => !v); setPage(0) }
  const handleViewChange = (v: ViewMode) => { setView(v); setPage(0) }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />

      {/* Breadcrumb */}
      <div style={{ padding: '20px 64px', fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)' }}>
        <Link to="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Discover</Link>
        <span>→</span>
        <Link to={`/programs/${id}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{program.name}</Link>
        <span>→</span>
        <Link to={`/programs/${id}/products/${productId}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{product.name}</Link>
        <span>→</span>
        <span style={{ color: 'var(--ink-1)' }}>Sessions</span>
      </div>

      {/* Product header */}
      <div style={{ padding: '0 64px 40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ padding: '4px 10px', background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 999, fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              Session product
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              {program.name}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 52, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: '0 0 14px' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
            {product.description}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
          <Link to={`/programs/${id}/products/${productId}`} style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', textDecoration: 'none' }}>
            ← Back to product
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            {product.capacity != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Capacity</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-1)', lineHeight: 1 }}>{product.capacity}</div>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Upcoming</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-1)', lineHeight: 1 }}>{upcomingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule section */}
      <section style={{ padding: '32px 64px 72px', background: 'var(--paper-2)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              §03 · Schedule
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1 }}>
              Full <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>schedule.</em>
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>
              Times shown in{' '}
              <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{program.timezone}</span>{' '}
              (program timezone)
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleShowPastToggle}
              style={{ padding: '7px 14px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, border: '1px solid var(--rule-2)', background: showPast ? 'var(--paper-3)' : 'transparent', color: showPast ? 'var(--ink-1)' : 'var(--ink-2)', borderRadius: 8, cursor: 'pointer' }}
            >
              {showPast ? '↑ Hide past' : '↓ Show past'}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['week', 'month', 'list'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleViewChange(v)}
                  style={{ padding: '7px 14px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, border: view === v ? '1px solid var(--ink-1)' : '1px solid var(--rule-2)', background: view === v ? 'var(--ink-1)' : 'transparent', color: view === v ? 'var(--paper-1)' : 'var(--ink-2)', borderRadius: 8, cursor: 'pointer' }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar placeholder */}
        {view !== 'list' && (
          <div style={{ background: 'var(--paper-1)', border: '1px solid var(--rule)', borderRadius: 14, padding: '80px 40px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', margin: 0 }}>
              Calendar view coming soon.{' '}
              <button
                type="button"
                onClick={() => setView('list')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 500 }}
              >
                Switch to List view →
              </button>
            </p>
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <>
            {filtered.length === 0 ? (
              <div style={{ background: 'var(--paper-1)', border: '1px solid var(--rule)', borderRadius: 14, padding: '60px 40px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', margin: 0 }}>
                  No upcoming sessions scheduled.
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--paper-1)', border: '1px solid var(--rule)', borderRadius: 14, overflow: 'hidden' }}>
                {paginated.map((s, i) => (
                  <SessionRow key={s.id} s={s} isFirst={i === 0} tz={program.timezone} />
                ))}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--rule)', fontFamily: 'var(--font-sans)' }}>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, border: '1px solid var(--rule-2)', background: 'transparent', color: currentPage === 0 ? 'var(--ink-3)' : 'var(--ink-1)', borderRadius: 8, cursor: currentPage === 0 ? 'default' : 'pointer', opacity: currentPage === 0 ? 0.45 : 1 }}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, border: '1px solid var(--rule-2)', background: 'transparent', color: currentPage >= totalPages - 1 ? 'var(--ink-3)' : 'var(--ink-1)', borderRadius: 8, cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer', opacity: currentPage >= totalPages - 1 ? 0.45 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Legend */}
            <div style={{ marginTop: 20, display: 'flex', gap: 24, fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', marginRight: 5 }} />
                Open — reserve a spot
              </span>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--ink-3)', marginRight: 5 }} />
                Full — join waitlist for manager approval
              </span>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--accent-soft-stripe)', marginRight: 5 }} />
                Out-of-window — request approval
              </span>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  )
}
