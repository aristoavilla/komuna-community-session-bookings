import { useState } from 'react'
import type { PackageMock } from '../../data/programs'
import { parsePriceAmount, SERVICE_FEE_CONFIG } from '../../data/programs'

interface OrderSummaryCardProps {
  pkg: PackageMock
  onPay?: () => Promise<'success' | 'failure'>
}

type PaymentState = 'idle' | 'paying' | 'success' | 'failure'

const defaultOnPay = (): Promise<'success' | 'failure'> =>
  new Promise((resolve) => setTimeout(() => resolve('success'), 1500))

export function OrderSummaryCard({ pkg, onPay }: OrderSummaryCardProps) {
  const [state, setState] = useState<PaymentState>('idle')

  // Fee computation
  const amount = parsePriceAmount(pkg.price)
  const fee = Math.max(amount * SERVICE_FEE_CONFIG.percentage, SERVICE_FEE_CONFIG.minimum)
  const total = amount + fee

  // Extract currency symbol from pkg.price
  const currencyMatch = pkg.price.match(/[^\d.]/);
  const symbol = currencyMatch ? currencyMatch[0] : ''

  const formatPrice = (value: number) => `${symbol}${value.toFixed(2)}`

  const handlePay = async () => {
    setState('paying')
    const payFn = onPay ?? defaultOnPay
    const result = await payFn()
    setState(result === 'success' ? 'success' : 'failure')
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 24,
        border: '1px solid var(--rule)',
        borderRadius: 14,
        padding: 28,
        background: 'var(--paper-1)',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {state === 'idle' && (
        <>
          {/* Section label */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 24,
            }}
          >
            §02 · Order summary
          </div>

          {/* Fee table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>
              Package price
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-1)', fontFamily: 'var(--font-sans)' }}>
              {pkg.price}
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px dashed var(--rule)', margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>
              Service fee (5% · min $3)
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-1)', fontFamily: 'var(--font-sans)' }}>
              {formatPrice(fee)}
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px dashed var(--rule)', margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div
              style={{
                fontSize: 14,
                color: 'var(--ink-1)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <strong>Total</strong>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 28,
                letterSpacing: '-0.02em',
                color: 'var(--ink-1)',
              }}
            >
              {formatPrice(total)}
            </div>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'var(--accent)',
              color: 'var(--paper-1)',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontFamily: 'var(--font-sans, sans-serif)',
              marginTop: 20,
            }}
          >
            Pay with Xendit →
          </button>

          {/* Trust note */}
          <div
            style={{
              fontSize: 12,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans, sans-serif)',
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            Secure payment via Xendit. Vouchers issued immediately on confirmation.
          </div>
        </>
      )}

      {state === 'paying' && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div
            className="spinner"
            style={{
              width: 28,
              height: 28,
              border: '3px solid var(--rule)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 13,
              color: 'var(--ink-2)',
            }}
          >
            Processing payment…
          </div>
        </div>
      )}

      {state === 'success' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Icon + headline */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: 'var(--ok)', marginBottom: 8 }}>✓</div>
            <div
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 24,
                color: 'var(--ink-1)',
              }}
            >
              Payment confirmed.
            </div>
          </div>

          {/* Vouchers issued list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pkg.entries.map((entry) => {
              const qty = entry.quantity >= 999 ? '∞' : String(entry.quantity)
              return (
                <div
                  key={entry.id}
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-2)',
                    fontFamily: 'var(--font-sans, sans-serif)',
                  }}
                >
                  {qty}× {entry.product_name} — valid {entry.validity_rule}
                </div>
              )
            })}
          </div>

          {/* Links */}
          <a
            href="/wallet"
            style={{
              fontSize: 14,
              color: 'var(--accent)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Go to my wallet →
          </a>
          <a
            href={`/programs/${pkg.program_id}`}
            style={{
              fontSize: 13,
              color: 'var(--ink-3)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Back to program →
          </a>
        </div>
      )}

      {state === 'failure' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 32, color: 'var(--accent)', marginBottom: 8 }}>✕</div>
            <div
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 24,
                color: 'var(--ink-1)',
                marginBottom: 8,
              }}
            >
              Payment failed.
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--ink-3)',
                fontFamily: 'var(--font-sans, sans-serif)',
              }}
            >
              No charges were made. Please try again.
            </div>
          </div>
          <button
            onClick={() => setState('idle')}
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'var(--accent)',
              color: 'var(--paper-1)',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
