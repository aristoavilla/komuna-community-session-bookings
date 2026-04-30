import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { TopNav } from '../components/layout/TopNav'
import { BOOKINGS } from '../data/programs'
import type { VoucherClaimMock } from '../data/programs'
import { BookingCard } from './bookings/BookingCard'

type Tab = 'active' | 'past'

type BookingsPageProps = {
  bookings?: VoucherClaimMock[]
  now?: Date
}

export function BookingsPage({ bookings = BOOKINGS, now = new Date() }: BookingsPageProps) {
  const [tab, setTab] = useState<Tab>('active')
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())

  const { activeBookings, pastBookings } = useMemo(() => {
    const active: VoucherClaimMock[] = []
    const past: VoucherClaimMock[] = []

    for (const b of bookings) {
      const isCancelledLocally = cancelledIds.has(b.id)
      const isSessionPast = new Date(b.session_start_time) <= now
      const isCancelled = b.cancelled_at !== null || isCancelledLocally

      if (!isCancelled && !isSessionPast) {
        active.push(b)
      } else {
        past.push(b)
      }
    }

    return { activeBookings: active, pastBookings: past }
  }, [bookings, now, cancelledIds])

  function handleCancel(id: string) {
    setCancelledIds((prev) => new Set([...prev, id]))
  }

  function tabStyle(t: Tab): React.CSSProperties {
    return {
      padding: '8px 0',
      border: 0,
      background: 'transparent',
      color: tab === t ? 'var(--ink-1)' : 'var(--ink-3)',
      fontFamily: 'var(--font-sans, sans-serif)',
      fontSize: 14,
      fontWeight: tab === t ? 500 : 400,
      borderBottom: tab === t ? '2px solid var(--ink-1)' : '2px solid transparent',
      cursor: 'pointer',
    }
  }

  const currentList = tab === 'active' ? activeBookings : pastBookings
  const emptyText = tab === 'active' ? 'No upcoming bookings.' : 'No past bookings yet.'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-1)', color: 'var(--ink-1)' }}>
      <TopNav loggedIn={true} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 72px' }}>
        <header style={{ marginBottom: 40 }}>
          <div
            style={{
              marginBottom: 8,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            §06 · My bookings
          </div>
          <h1
            style={{
              margin: 0,
              color: 'var(--ink-1)',
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 36,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            My bookings
          </h1>
        </header>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 32,
            borderBottom: '1px solid var(--rule)',
          }}
        >
          <button type="button" style={tabStyle('active')} onClick={() => setTab('active')}>
            Active
          </button>
          <button type="button" style={tabStyle('past')} onClick={() => setTab('past')}>
            Past
          </button>
        </div>

        {/* Content */}
        {currentList.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px', color: 'var(--ink-2)', fontSize: 16 }}>{emptyText}</p>
            {tab === 'active' && (
              <Link
                to="/"
                style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none' }}
              >
                Browse programs →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentList.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                mode={tab}
                onCancel={tab === 'active' ? handleCancel : undefined}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
