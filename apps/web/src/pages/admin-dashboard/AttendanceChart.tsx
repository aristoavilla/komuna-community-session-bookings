type Product = { product_id: string; product_name: string; taken: number; capacity: number }

type AttendanceChartProps = { products: Product[] }

function fillColor(taken: number, capacity: number) {
  const ratio = taken / capacity
  if (ratio >= 0.8) return 'var(--ok)'
  if (ratio >= 0.5) return 'var(--accent)'
  return 'var(--paper-3)'
}

export function AttendanceChart({ products }: AttendanceChartProps) {
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink-1)', marginBottom: 16 }}>
        Attendance this week
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map(p => (
          <div key={p.product_id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-2)' }}>
                {p.product_name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                {p.taken}/{p.capacity}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--paper-3)', overflow: 'hidden' }}>
              <div
                data-fill
                style={{
                  height: '100%',
                  width: `${Math.min((p.taken / p.capacity) * 100, 100)}%`,
                  borderRadius: 99,
                  background: fillColor(p.taken, p.capacity),
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {[{ color: 'var(--ok)', label: '≥ 80%' }, { color: 'var(--accent)', label: '50–79%' }].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
