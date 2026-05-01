import { useState } from 'react'

type Period = '3m' | '6m' | '1y'

type RevenueChartProps = {
  data: { month: string; amount: number }[]
}

const PERIOD_SLICES: Record<Period, number> = { '3m': 3, '6m': 6, '1y': 12 }

function formatK(cents: number) {
  const dollars = cents / 100
  if (dollars >= 1000) return `$${Math.round(dollars / 1000)}k`
  return `$${Math.round(dollars)}`
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>('6m')
  const slice = data.slice(-PERIOD_SLICES[period])
  const maxAmount = Math.max(...slice.map(d => d.amount), 1)
  const yMax = Math.ceil(maxAmount / 500000) * 500000  // nearest $5k in cents

  const viewW = 720
  const viewH = 160
  const leftPad = 44
  const chartW = viewW - leftPad - 8
  const chartH = viewH - 24  // bottom 24px for x-axis labels
  const barW = Math.floor(chartW / slice.length) - 4

  const gridLines = [0, 1, 2, 3].map(i => yMax * (i / 3))

  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 10,
        padding: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink-1)' }}>
            Monthly revenue
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
            Total purchases · service fees excluded
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['3m', '6m', '1y'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${period === p ? 'var(--accent)' : 'var(--rule)'}`,
                background: period === p ? 'var(--accent-soft)' : 'transparent',
                color: period === p ? 'var(--accent)' : 'var(--ink-3)',
                cursor: 'pointer',
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${viewW} ${viewH}`} style={{ width: '100%', display: 'block' }}>
        {/* Y-axis gridlines */}
        {gridLines.map((v, i) => {
          const y = chartH - (v / yMax) * chartH
          return (
            <g key={i}>
              <line x1={leftPad} y1={y} x2={viewW - 8} y2={y} stroke="var(--rule)" strokeWidth={1} />
              <text x={leftPad - 4} y={y + 4} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-3)">
                {formatK(v)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {slice.map((d, i) => {
          const totalBarSlotW = chartW / slice.length
          const x = leftPad + i * totalBarSlotW + (totalBarSlotW - barW) / 2
          const barH = (d.amount / yMax) * chartH
          const y = chartH - barH
          const opacity = Math.max(0.2, 1 - (slice.length - 1 - i) * 0.15)

          return (
            <g key={d.month}>
              <rect
                data-bar
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="var(--accent)"
                opacity={opacity}
                rx={3}
              />
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill="var(--ink-2)"
              >
                {formatK(d.amount)}
              </text>
              <text
                x={x + barW / 2}
                y={viewH - 4}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill="var(--ink-3)"
              >
                {d.month}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
