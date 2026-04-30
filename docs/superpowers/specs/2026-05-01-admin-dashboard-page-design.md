# Komuna — Admin Dashboard Page Design

_2026-05-01_

## Scope

Implement the **AdminDashboardPage** at `/programs/:id/admin`. This is the first admin-flow page and serves as the hub for all program administration. It is not the AnalyticsPage — charts here are summary-level only. Full analytics live at `/programs/:id/admin/analytics`.

## Design Direction

Same warm editorial aesthetic as all member-facing pages: cream paper tones, deep ink typography, terracotta accent. Admin pages use a wider max-width (1040px vs. 760px for member pages) to give the stat grid and side-by-side charts breathing room. Section eyebrow: `§09 · Admin dashboard`.

## Route & Props

```
/programs/:id/admin
```

```ts
type AdminDashboardPageProps = {
  data?: AdminDashboardMock
  now?: Date
}
```

Both props have defaults so the page renders with mock data and a fixed `now` in tests.

## Page Layout (top to bottom)

1. **TopNav** — existing component, `loggedIn={true}`. Program name + "Admin" shown as a mono pill in the right cluster.
2. **Page header** — eyebrow label, serif `<h1>` with program name, subtitle "Program overview · Month Year" derived from `now`.
3. **Stat cards** — 4-column grid.
4. **Monthly revenue bar chart** — full-width, with 3M / 6M / 1Y period toggle.
5. **Two-column mini charts** — Attendance rate (left) + Voucher status (right).
6. **Admin nav tile grid** — 7 tiles in a 4-column grid.
7. **Footer** — existing component.

Max-width: 1040px, `margin: 0 auto`, `padding: 48px 32px 96px`.

## Stat Cards

Four cards in a single row (`grid-template-columns: repeat(4, 1fr)`, `gap: 16px`).

### Revenue — This Month
- **Value:** `revenue_this_month` formatted as currency (e.g. `$12,480`)
- **Delta:** `↑ N%` (green `--ok`) or `↓ N%` (terracotta `--accent`) vs `revenue_last_month`
- **Sparkline:** filled-area line chart from `revenue_trend` (monthly values array), SVG inline, `--accent` stroke

### Active Members
- **Value:** `active_member_count`
- **Meta:** `+N this month` (delta = last element minus second-to-last in `member_trend`)
- **Sparkline:** filled-area line from `member_trend` (monthly values array), `--ink-2` stroke

### Sessions This Week
- **Value:** `sessions_this_week`
- **Meta:** `N products · avg N / session` where avg = `Math.round(sum of taken / sessions_this_week)` (derived from `attendance_this_week`)
- **Mini bar chart:** 7 bars Mon–Sun from `sessions_by_day`. Bars with `value > 0` use `--accent`; bars with `0` use `--paper-3` (greyed out). X-axis labels: M T W T F S S.

### Pending Approvals
- **Value:** `pending_join_requests + pending_booking_requests`
- **Meta:** `N join · N booking requests`
- **Style:** When total > 0 — terracotta accent card (`border-color: var(--accent)`, `background: var(--accent-soft)`), value and label in `--accent`. When total = 0 — neutral card, value in `--ink-1`.
- **CTA:** `Review now →` link to `/programs/:id/admin/approvals` when total > 0.

## Charts

All charts are **inline SVG** — no chart library dependency.

### Monthly Revenue Bar Chart

Positioned below stat cards, full-width, inside a bordered card (`border: 1px solid var(--rule)`, `border-radius: 10px`, `padding: 24px`).

- **Header row:** "Monthly revenue" (serif, 22px) + "Total purchases · service fees excluded" subtitle on left; 3M / 6M / 1Y period tabs on right.
- **Period toggle:** UI-only state (`useState<'3m' | '6m' | '1y'>`), slices `monthly_revenue` array to the last 3, 6, or 12 entries. When fewer entries exist than the selected period (e.g. 1Y but only 6 months of data), all available entries are shown. No API call.
- **Bars:** One bar per month. Current month at full `--accent` opacity; older months at progressively lower opacity (step down 15% per bar going back, min 20%). Bar width fills column evenly with gap.
- **Value labels:** Above each bar in `--font-mono`, 10px, `--ink-2`.
- **Y-axis:** 4 gridlines. Max label = `Math.ceil(maxAmount / 5000) * 5000` (rounds up to nearest $5k). Labels formatted as `$Nk`. Gridlines use `--rule`.
- **X-axis:** Month abbreviation labels in `--font-mono`, `--ink-3`.
- **ViewBox:** `720 × 160` with left offset of 44px for Y labels.

### Attendance Rate (left of two-col)

One horizontal progress bar per product in `attendance_this_week`.

- Bar height: 6px, `border-radius: 99px`, track color `--paper-3`.
- Fill color: `--ok` (green) when `taken / capacity ≥ 0.8`; `--accent` (terracotta) when `0.5–0.79`; `--paper-3` (grey fill on grey track, indistinguishable = effectively empty) when `< 0.5`.
- Right-aligned `taken/capacity` ratio in `--font-mono` 11px.
- Legend: two swatches below ("≥ 80%" green, "50–79%" terracotta).

### Voucher Status Stacked Bar (right of two-col)

Single horizontal stacked bar (28px tall, `border-radius: 6px`, no gap between segments) then a legend list below.

- **Segments (left to right):** claimed (`--ok`) · active (`--ink-2`) · expired (`--rule-2`, light grey) · refunded (`--accent`).
- Widths are percentage of total voucher count.
- Each segment shows its percentage as white text (or dark for the grey segment) in `--font-mono`.
- **Legend rows:** four rows, each with a 10×10 swatch, status label, and raw count in `--font-mono`.

Both mini charts share the same bordered card shell as the revenue chart.

## Admin Nav Tile Grid

`grid-template-columns: repeat(4, 1fr)`, `gap: 12px`. Seven tiles; last row has 3 tiles + one empty cell (no placeholder needed — CSS grid handles it).

Each tile is a `<Link>` (React Router) styled as a card (`border: 1px solid var(--rule)`, `border-radius: 10px`, `padding: 20px`). Hover: `background: var(--paper-3)`, `border-color: var(--rule-2)`.

| Tile | Emoji | Subtitle text | Route |
|---|---|---|---|
| Approvals | ⏳ | `N join · N booking requests` | `/programs/:id/admin/approvals` |
| Members | 👥 | `N active · invite or ban` | `/programs/:id/admin/members` |
| Products | 📦 | `N active · N archived` | `/programs/:id/admin/products` |
| Packages | 🏷 | `N active purchase packages` | `/programs/:id/admin/packages` |
| Vouchers | 🎟 | `Giveaway · extend · refund` | `/programs/:id/admin/vouchers` |
| Analytics | 📊 | `Revenue · attendance · utilization` | `/programs/:id/admin/analytics` |
| Audit Log | 📋 | `Append-only event history` | `/programs/:id/admin/audit` |

**Approvals tile urgent state** (when `pending_join_requests + pending_booking_requests > 0`):
- `border-color: var(--accent)`, `background: var(--accent-soft)`
- Title and arrow in `--accent`
- Badge: filled terracotta pill (`--accent` bg, white text) with total count, displayed inline after "Approvals"

**Arrow glyph:** `→` positioned `absolute`, top-right of tile, `--ink-3` normally, `--accent` on urgent tile.

## Component Breakdown

```
pages/
  AdminDashboardPage.tsx
  admin-dashboard/
    StatCard.tsx              — label, value, meta, optional sparkline slot (render prop)
    RevenueSparkline.tsx      — filled-area SVG line for revenue/member trend
    SessionsBarSparkline.tsx  — 7-bar Mon–Sun SVG mini chart
    RevenueChart.tsx          — full monthly bar chart with period toggle
    AttendanceChart.tsx       — horizontal progress bars per product
    VoucherStatusChart.tsx    — stacked bar + legend
    AdminNavTile.tsx          — nav tile with emoji, title, subtitle, optional badge, urgent state
```

`StatCard` accepts a `sparkline` render-prop slot so each of the four cards can pass a different SVG component without `StatCard` knowing chart internals.

## Mock Data

Add to `apps/web/src/data/programs.ts`:

```ts
export type AdminDashboardMock = {
  // ERD: PROGRAM fields
  program_id: string
  program_name: string

  // Stat card data
  revenue_this_month: number          // cents
  revenue_last_month: number          // cents
  revenue_trend: number[]             // monthly values, cents, oldest → newest
  active_member_count: number
  member_trend: number[]              // monthly values, counts, oldest → newest
  sessions_this_week: number
  sessions_by_day: number[]           // 7 values, Mon–Sun
  pending_join_requests: number
  pending_booking_requests: number

  // Revenue chart
  monthly_revenue: { month: string; amount: number }[]  // up to 12 months, cents

  // Attendance chart
  attendance_this_week: {
    product_id: string
    product_name: string
    taken: number
    capacity: number
  }[]

  // Voucher status chart — ERD: VOUCHER.status values
  voucher_status_counts: {
    claimed: number
    active: number
    expired: number
    refunded: number
  }

  // Nav tile subtitles
  active_product_count: number
  archived_product_count: number
  active_package_count: number
}

export const ADMIN_DASHBOARD: AdminDashboardMock = {
  program_id: 'p1',
  program_name: 'Eastside Boxing Club',
  revenue_this_month: 1248000,
  revenue_last_month: 1050000,
  revenue_trend: [420000, 520000, 610000, 650000, 720000, 800000, 880000, 1050000, 1248000],
  active_member_count: 84,
  member_trend: [52, 58, 63, 67, 71, 75, 78, 81, 84],
  sessions_this_week: 9,
  sessions_by_day: [0, 2, 2, 3, 0, 1, 1],
  pending_join_requests: 4,
  pending_booking_requests: 2,
  monthly_revenue: [
    { month: 'Dec', amount: 520000 },
    { month: 'Jan', amount: 650000 },
    { month: 'Feb', amount: 800000 },
    { month: 'Mar', amount: 880000 },
    { month: 'Apr', amount: 1050000 },
    { month: 'May', amount: 1248000 },
  ],
  attendance_this_week: [
    { product_id: 'prod-1', product_name: 'Boxing Fundamentals', taken: 14, capacity: 16 },
    { product_id: 'prod-2', product_name: 'Advanced Sparring',   taken: 8,  capacity: 12 },
    { product_id: 'prod-3', product_name: 'Bag Work Circuit',    taken: 10, capacity: 10 },
  ],
  voucher_status_counts: { claimed: 384, active: 224, expired: 112, refunded: 80 },
  active_product_count: 5,
  archived_product_count: 1,
  active_package_count: 3,
}
```

## Test Scenarios

File: `apps/web/src/__tests__/AdminDashboardPage.test.tsx`

1. **Renders page header** — eyebrow `§09 · Admin dashboard`, program name `<h1>` present.
2. **Revenue card shows this-month value and delta** — formatted currency and `↑ N%` visible.
3. **Members card shows count and trend meta** — count and `+N this month` visible.
4. **Sessions card renders 7-bar sparkline** — 7 `<rect>` elements present in SVG.
5. **Pending approvals card — urgent state** — when `pending > 0`, card has accent styling and "Review now" link present.
6. **Pending approvals card — zero state** — when both request counts are 0, no "Review now" link, no accent styling.
7. **Revenue chart renders correct bar count** — default 6M period shows 6 bars.
8. **Period toggle switches bar count** — clicking "3M" shows 3 bars; "1Y" shows all `monthly_revenue` entries.
9. **Attendance chart shows one bar per product** — 3 products → 3 progress bars with correct `width` percentages.
10. **Voucher status segments sum to 100%** — stacked bar segment widths add up correctly.
11. **Approvals nav tile shows badge and urgent style** — badge with count `6`, accent border present.
12. **All 7 nav tiles render with correct `href`** — each `<a>` points to the correct admin sub-route.
