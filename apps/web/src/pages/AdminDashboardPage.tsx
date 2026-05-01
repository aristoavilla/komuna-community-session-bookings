import { useParams } from 'react-router-dom'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { StatCard } from './admin-dashboard/StatCard'
import { RevenueSparkline } from './admin-dashboard/RevenueSparkline'
import { SessionsBarSparkline } from './admin-dashboard/SessionsBarSparkline'
import { RevenueChart } from './admin-dashboard/RevenueChart'
import { AttendanceChart } from './admin-dashboard/AttendanceChart'
import { VoucherStatusChart } from './admin-dashboard/VoucherStatusChart'
import { AdminNavTile } from './admin-dashboard/AdminNavTile'
import { ADMIN_DASHBOARD, type AdminDashboardMock } from '../data/programs'

type AdminDashboardPageProps = {
  data?: AdminDashboardMock
  now?: Date
}

function formatCurrency(cents: number) {
  return '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function pctDelta(current: number, previous: number) {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export function AdminDashboardPage({ data = ADMIN_DASHBOARD, now = new Date() }: AdminDashboardPageProps) {
  const { id } = useParams<{ id: string }>()
  const programId = id ?? data.program_id

  const revDelta = pctDelta(data.revenue_this_month, data.revenue_last_month)
  const revDeltaStr = revDelta !== null
    ? `${revDelta >= 0 ? '↑' : '↓'} ${Math.abs(revDelta)}% vs last month`
    : ''

  const memberTrend = data.member_trend
  const memberDelta = memberTrend.length >= 2
    ? memberTrend[memberTrend.length - 1] - memberTrend[memberTrend.length - 2]
    : 0

  const totalPending = data.pending_join_requests + data.pending_booking_requests

  const avgAttendance = data.sessions_this_week > 0
    ? Math.round(
        data.attendance_this_week.reduce((s, p) => s + p.taken, 0) / data.sessions_this_week
      )
    : 0

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const NAV_TILES = [
    {
      emoji: '⏳',
      title: 'Approvals',
      subtitle: `${data.pending_join_requests} join · ${data.pending_booking_requests} booking requests`,
      href: `/programs/${programId}/admin/approvals`,
      urgent: totalPending > 0,
      badgeCount: totalPending,
    },
    {
      emoji: '👥',
      title: 'Members',
      subtitle: `${data.active_member_count} active · invite or ban`,
      href: `/programs/${programId}/admin/members`,
    },
    {
      emoji: '📦',
      title: 'Products',
      subtitle: `${data.active_product_count} active · ${data.archived_product_count} archived`,
      href: `/programs/${programId}/admin/products`,
    },
    {
      emoji: '🏷',
      title: 'Packages',
      subtitle: `${data.active_package_count} active purchase packages`,
      href: `/programs/${programId}/admin/packages`,
    },
    {
      emoji: '🎟',
      title: 'Vouchers',
      subtitle: 'Giveaway · extend · refund',
      href: `/programs/${programId}/admin/vouchers`,
    },
    {
      emoji: '📊',
      title: 'Analytics',
      subtitle: 'Revenue · attendance · utilization',
      href: `/programs/${programId}/admin/analytics`,
    },
    {
      emoji: '📋',
      title: 'Audit Log',
      subtitle: 'Append-only event history',
      href: `/programs/${programId}/admin/audit`,
    },
  ]

  return (
    <>
      <TopNav loggedIn />
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 32px 96px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-3)',
              marginBottom: 8,
            }}
          >
            §09 · Admin dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 700, color: 'var(--ink-1)', margin: 0 }}>
            {data.program_name}
          </h1>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>
            Program overview · {monthLabel}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard
            label="Revenue — This Month"
            value={formatCurrency(data.revenue_this_month)}
            meta={revDeltaStr}
            sparkline={<RevenueSparkline values={data.revenue_trend} stroke="var(--accent)" />}
          />
          <StatCard
            label="Active Members"
            value={String(data.active_member_count)}
            meta={`+${memberDelta} this month`}
            sparkline={<RevenueSparkline values={data.member_trend} stroke="var(--ink-2)" />}
          />
          <StatCard
            label="Sessions This Week"
            value={String(data.sessions_this_week)}
            meta={`${data.attendance_this_week.length} products · avg ${avgAttendance} / session`}
            sparkline={<SessionsBarSparkline values={data.sessions_by_day as [number,number,number,number,number,number,number]} />}
          />
          <StatCard
            label="Pending Approvals"
            value={String(data.pending_join_requests)}
            meta={`${data.pending_join_requests} join · ${data.pending_booking_requests} booking requests`}
            urgent={totalPending > 0}
            cta={
              totalPending > 0
                ? (
                  <button
                    onClick={() => { window.location.href = `/programs/${programId}/admin/approvals` }}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    Review now →
                  </button>
                )
                : undefined
            }
          />
        </div>

        {/* Revenue chart */}
        <div style={{ marginBottom: 32 }}>
          <RevenueChart data={data.monthly_revenue} />
        </div>

        {/* Two-col mini charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          <AttendanceChart products={data.attendance_this_week} />
          <VoucherStatusChart counts={data.voucher_status_counts} />
        </div>

        {/* Admin nav tile grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {NAV_TILES.map(tile => (
            <AdminNavTile key={tile.href} {...tile} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
