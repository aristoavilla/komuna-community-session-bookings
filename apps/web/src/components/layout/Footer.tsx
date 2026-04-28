export function Footer() {
  return (
    <footer
      style={{
        padding: '32px 64px', borderTop: '1px solid var(--rule)',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--ink-3)',
      }}
    >
      <span>© Komuna · Brooklyn → everywhere</span>
      <span style={{ display: 'flex', gap: 20 }}>
        <span>Trainers</span>
        <span>Studios</span>
        <span>Help</span>
        <span>Terms</span>
      </span>
    </footer>
  )
}
