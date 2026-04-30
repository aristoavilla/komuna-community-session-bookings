type CancelConfirmStripProps = {
  productName: string
  onConfirm: () => void
  onDismiss: () => void
}

export function CancelConfirmStrip({ productName, onConfirm, onDismiss }: CancelConfirmStripProps) {
  return (
    <div
      data-testid="cancel-confirm-strip"
      style={{
        marginTop: 16,
        padding: 16,
        borderTop: '1px solid var(--rule)',
        background: 'var(--paper-3)',
        borderRadius: '0 0 6px 6px',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          color: 'var(--ink-2)',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Cancel your booking for <strong>{productName}</strong>? A compensation voucher will be
        issued automatically.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: 'var(--paper-1)',
            border: 0,
            fontSize: 13,
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Confirm cancel
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: 'transparent',
            color: 'var(--ink-2)',
            border: '1px solid var(--rule)',
            fontSize: 13,
            fontFamily: 'var(--font-sans, sans-serif)',
            cursor: 'pointer',
          }}
        >
          Keep booking
        </button>
      </div>
    </div>
  )
}
