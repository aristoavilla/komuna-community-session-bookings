import { useState } from 'react'
import type { VoucherClaimMock } from '../../data/programs'
import { CancelConfirmStrip } from './CancelConfirmStrip'

type BookingCardProps = {
  booking: VoucherClaimMock
  mode: 'active' | 'past'
  onCancel?: (id: string) => void
}

const statusBadgeStyles: Record<'completed' | 'cancelled', React.CSSProperties> = {
  completed: {
    background: 'oklch(0.78 0.12 150 / 15%)',
    color: 'var(--ok)',
  },
  cancelled: {
    background: 'var(--paper-3)',
    color: 'var(--ink-3)',
  },
}

function formatDateTime(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const date = s.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const startTime = s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const endTime = e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${startTime}–${endTime}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function BookingCard({ booking, mode, onCancel }: BookingCardProps) {
  const [confirming, setConfirming] = useState(false)

  const isCancelled = booking.cancelled_at !== null
  const statusBadge: 'completed' | 'cancelled' | null =
    mode === 'past' ? (isCancelled ? 'cancelled' : 'completed') : null

  return (
    <section
      data-testid={`booking-card-${booking.id}`}
      style={{
        padding: 24,
        border: '1px solid var(--rule)',
        borderRadius: 8,
        background: 'var(--paper-1)',
        opacity: mode === 'past' && isCancelled ? 0.7 : 1,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 4px',
              color: 'var(--ink-1)',
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {booking.product_name}
          </h2>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{booking.program_name}</div>
        </div>

        {statusBadge && (
          <span
            data-testid="status-badge"
            style={{
              ...statusBadgeStyles[statusBadge],
              borderRadius: 99,
              padding: '2px 10px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 12,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {statusBadge}
          </span>
        )}

        {mode === 'active' && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            style={{
              padding: '4px 12px',
              border: '1px solid var(--rule)',
              borderRadius: 999,
              background: 'transparent',
              color: 'var(--ink-2)',
              fontSize: 13,
              fontFamily: 'var(--font-sans, sans-serif)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, margin: '16px 0 12px', background: 'var(--rule)' }} />

      {/* Session details row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ color: 'var(--ink-1)', fontSize: 14 }}>
          {formatDateTime(booking.session_start_time, booking.session_end_time)}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 4 }}>{booking.coach}</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
            {booking.session_taken} / {booking.session_capacity} booked
          </div>
        </div>
      </div>

      {/* Custom field answers */}
      {booking.custom_field_answers.length > 0 && (
        <div
          data-testid="custom-field-answers"
          style={{
            marginTop: 12,
            padding: 12,
            background: 'var(--paper-2)',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {booking.custom_field_answers.map((answer) => (
            <div key={answer.id} style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--ink-3)' }}>{answer.field_name}: </span>
              <span style={{ color: 'var(--ink-1)' }}>{answer.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Compensation voucher reference */}
      {booking.compensation_voucher_expires_at && (
        <div
          data-testid="compensation-ref"
          style={{
            marginTop: 10,
            color: 'var(--ink-3)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12,
            letterSpacing: '0.04em',
          }}
        >
          Compensation voucher: expires {formatDate(booking.compensation_voucher_expires_at)}
        </div>
      )}

      {/* Inline cancel confirmation */}
      {confirming && (
        <CancelConfirmStrip
          productName={booking.product_name}
          onConfirm={() => {
            setConfirming(false)
            onCancel?.(booking.id)
          }}
          onDismiss={() => setConfirming(false)}
        />
      )}
    </section>
  )
}
