type RevenueSparklineProps = {
  values: number[]
  stroke: string
  width?: number
  height?: number
}

export function RevenueSparkline({ values, stroke, width = 80, height = 28 }: RevenueSparklineProps) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / (values.length - 1)

  const pts = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const fillPath = `${linePath} L${pts[pts.length - 1].x},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={fillPath} fill={stroke} fillOpacity={0.15} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  )
}
