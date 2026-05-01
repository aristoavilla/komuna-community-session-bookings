type Counts = { claimed: number; active: number; expired: number; refunded: number }

type VoucherStatusChartProps = { counts: Counts }

const SEGMENTS: { key: keyof Counts; color: string; label: string }[] = [
  { key: 'claimed',  color: 'var(--ok)',     label: 'Claimed'  },
  { key: 'active',   color: 'var(--ink-2)',  label: 'Active'   },
  { key: 'expired',  color: 'var(--rule)',   label: 'Expired'  },
  { key: 'refunded', color: 'var(--accent)', label: 'Refunded' },
]

export function VoucherStatusChart({ counts }: VoucherStatusChartProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink-1)', marginBottom: 16 }}>
        Voucher status
      </div>
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden' }}>
        {SEGMENTS.map(s => {
          const pct = (counts[s.key] / total) * 100
          return (
            <div
              key={s.key}
              data-segment
              style={{
                width: `${pct}%`,
                background: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pct > 6 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.key === 'expired' ? 'var(--ink-2)' : 'white' }}>
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {SEGMENTS.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-2)', flex: 1 }}>
              {s.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              {counts[s.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
