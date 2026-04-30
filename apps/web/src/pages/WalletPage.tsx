import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { TopNav } from '../components/layout/TopNav'
import { VOUCHERS } from '../data/programs'
import type { VoucherMock } from '../data/programs'

type WalletPageProps = {
  vouchers?: VoucherMock[]
  now?: Date
}

type VoucherGroup = {
  productId: string
  productName: string
  programId: string
  programName: string
  vouchers: VoucherMock[]
  firstActiveExpiry: string | null
}

const statusStyles: Record<VoucherMock['status'], React.CSSProperties> = {
  active: {
    background: 'oklch(0.78 0.12 150 / 15%)',
    color: 'var(--ok)',
  },
  claimed: {
    background: 'var(--accent-soft)',
    color: 'var(--accent-ink)',
  },
  expired: {
    background: 'var(--paper-3)',
    color: 'var(--ink-3)',
  },
  refunded: {
    background: 'var(--paper-3)',
    color: 'var(--ink-3)',
  },
}

function isExpired(voucher: VoucherMock, now: Date) {
  return voucher.status === 'expired' || new Date(voucher.expired_at) <= now
}

function formatExpiry(expiredAt: string, now: Date) {
  const expiry = new Date(expiredAt)
  const label = expiry.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return expiry <= now ? `Expired ${label}` : `Expires ${label}`
}

function groupVouchers(vouchers: VoucherMock[], now: Date): VoucherGroup[] {
  const groups = new Map<string, VoucherMock[]>()

  for (const voucher of vouchers) {
    const group = groups.get(voucher.product_id) ?? []
    group.push(voucher)
    groups.set(voucher.product_id, group)
  }

  return Array.from(groups.entries())
    .map(([productId, group]) => {
      const sorted = [...group].sort((a, b) => a.expired_at.localeCompare(b.expired_at))
      const firstActiveVoucher = sorted.find(
        (voucher) => voucher.status === 'active' && !isExpired(voucher, now),
      )
      const firstVoucher = sorted[0]

      return {
        productId,
        productName: firstVoucher.product_name,
        programId: firstVoucher.program_id,
        programName: firstVoucher.program_name,
        vouchers: sorted,
        firstActiveExpiry: firstActiveVoucher?.expired_at ?? null,
      }
    })
    .sort((a, b) => {
      if (a.firstActiveExpiry === null && b.firstActiveExpiry === null) return 0
      if (a.firstActiveExpiry === null) return 1
      if (b.firstActiveExpiry === null) return -1
      return a.firstActiveExpiry.localeCompare(b.firstActiveExpiry)
    })
}

export function WalletPage({ vouchers = VOUCHERS, now = new Date() }: WalletPageProps) {
  const [showExpired, setShowExpired] = useState(false)

  const visibleGroups = useMemo(
    () =>
      groupVouchers(vouchers, now)
        .map((group) => ({
          ...group,
          visibleVouchers: showExpired
            ? group.vouchers
            : group.vouchers.filter((voucher) => !isExpired(voucher, now)),
        }))
        .filter((group) => group.visibleVouchers.length > 0),
    [showExpired, vouchers, now],
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-1)', color: 'var(--ink-1)' }}>
      <TopNav loggedIn={true} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 72px' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                marginBottom: 8,
                color: 'var(--ink-3)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              §05 · My wallet
            </div>
            <h1
              style={{
                margin: 0,
                color: 'var(--ink-1)',
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 36,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}
            >
              My wallet
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowExpired((current) => !current)}
            style={{
              marginTop: 4,
              padding: '4px 0',
              border: 0,
              background: 'transparent',
              color: 'var(--ink-3)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 13,
            }}
          >
            {showExpired ? 'Hide expired' : 'Show expired'}
          </button>
        </header>

        {visibleGroups.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px', color: 'var(--ink-2)', fontSize: 16 }}>
              No vouchers yet.
            </p>
            <Link
              to="/"
              style={{
                color: 'var(--accent)',
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Browse programs →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {visibleGroups.map((group) => (
              <section
                key={group.productId}
                data-testid={`product-card-${group.productId}`}
                style={{
                  padding: 24,
                  border: '1px solid var(--rule)',
                  borderRadius: 8,
                  background: 'var(--paper-1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 18,
                    marginBottom: 16,
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
                      {group.productName}
                    </h2>
                    <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                      {group.programName}
                    </div>
                  </div>

                  {group.firstActiveExpiry !== null && (
                    <Link
                      to={`/programs/${group.programId}/products/${group.productId}/sessions`}
                      style={{
                        marginTop: 4,
                        color: 'var(--accent)',
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 13,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Book →
                    </Link>
                  )}
                </div>

                <div style={{ height: 1, marginBottom: 8, background: 'var(--rule)' }} />

                {group.visibleVouchers.map((voucher, index) => {
                  const voucherExpired = isExpired(voucher, now)

                  return (
                  <div
                    key={voucher.id}
                    data-testid="voucher-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '10px 0',
                      borderBottom:
                        index < group.visibleVouchers.length - 1
                          ? '1px dashed var(--rule)'
                          : 'none',
                      opacity: voucherExpired ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        color: voucherExpired ? 'var(--ink-3)' : 'var(--ink-2)',
                        fontSize: 14,
                      }}
                    >
                      {formatExpiry(voucher.expired_at, now)}
                    </div>

                    <span
                      style={{
                        ...statusStyles[voucher.status],
                        borderRadius: 99,
                        padding: '2px 10px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 12,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {voucher.status}
                    </span>

                    <span
                      style={{
                        minWidth: 100,
                        color: 'var(--ink-3)',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        textAlign: 'right',
                        textTransform: 'uppercase',
                      }}
                    >
                      {voucher.source}
                    </span>
                  </div>
                  )
                })}
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
