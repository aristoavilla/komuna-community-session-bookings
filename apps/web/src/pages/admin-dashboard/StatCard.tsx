import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  meta: string
  sparkline?: ReactNode
  urgent?: boolean
  cta?: ReactNode
}

export function StatCard({ label, value, meta, sparkline, urgent, cta }: StatCardProps) {
  return (
    <div
      style={{
        border: `1px solid ${urgent ? 'var(--accent)' : 'var(--rule)'}`,
        background: urgent ? 'var(--accent-soft)' : 'var(--paper-1)',
        borderRadius: 10,
        padding: '20px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: urgent ? 'var(--accent)' : 'var(--ink-3)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32,
          fontWeight: 600,
          lineHeight: 1,
          color: urgent ? 'var(--accent)' : 'var(--ink-1)',
        }}
      >
        {value}
      </span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-3)' }}>
        {meta}
      </span>
      {sparkline && <div style={{ marginTop: 8 }}>{sparkline}</div>}
      {cta && <div style={{ marginTop: 4 }}>{cta}</div>}
    </div>
  )
}
