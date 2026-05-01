const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type SessionsBarSparklineProps = {
  values: number[]  // 7 values, Mon–Sun
  width?: number
  height?: number
}

export function SessionsBarSparkline({ values, width = 112, height = 36 }: SessionsBarSparklineProps) {
  const max = Math.max(...values, 1)
  const barW = Math.floor((width - 12) / 7)
  const gap = 2
  const chartH = height - 12  // reserve 12px for labels

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const barH = Math.max((v / max) * chartH, v > 0 ? 2 : 0)
        const x = i * (barW + gap)
        const y = chartH - barH
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={v > 0 ? 'var(--accent)' : 'var(--paper-3)'}
              rx={1}
            />
            <text
              x={x + barW / 2}
              y={height - 1}
              textAnchor="middle"
              fontSize={8}
              fontFamily="var(--font-mono)"
              fill="var(--ink-3)"
            >
              {DAY_LABELS[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
