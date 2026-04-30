# SessionsPage Design Spec

**Date:** 2026-04-30
**Route:** `/programs/:id/products/:productId/sessions`
**Status:** Approved

---

## Overview

The SessionsPage shows the full upcoming schedule for a session-type product. Members can reserve open spots, join the waitlist on full sessions, or request a booking for sessions outside the configured booking window. Simple-type products render a gate instead of a schedule.

---

## Architecture

Single page component `SessionsPage` at `src/pages/SessionsPage.tsx`. All helper functions (row renderer, view toggle, pagination) live in the same file — no separate component files needed. Wired into routing at `/programs/:id/products/:productId/sessions` in `App.tsx`.

---

## Mock Data

### `SessionInstanceMock` type update

Extend the existing `status` union in `src/data/programs.ts`:

```ts
status: 'open' | 'full' | 'out-of-window' | 'past'
```

All other fields remain unchanged:

```ts
export type SessionInstanceMock = {
  // ERD: SESSION fields
  id: string
  product_id: string
  start_time: string      // ISO-8601
  end_time: string        // ISO-8601
  status: 'open' | 'full' | 'out-of-window' | 'past'
  is_active: boolean
  created_at: string      // ISO-8601

  // UI-only extras
  coach: string
  taken: number
  capacity: number        // copied from product for display
}
```

### `SESSION_INSTANCES` dataset

Add a top-level export to `src/data/programs.ts`:

```ts
export const SESSION_INSTANCES: Record<string, SessionInstanceMock[]> = { ... }
```

Keyed by `product_id`. 10–12 rows across 2–3 session-type products, covering all four status variants. Rows sorted by `start_time` ascending, spanning the next ~3 months from today (2026-04-30).

Sample coverage:

| product | status | count |
|---|---|---|
| Saturday Bag Work (p1-prod1) | open | 4 |
| Saturday Bag Work (p1-prod1) | full | 1 |
| Saturday Bag Work (p1-prod1) | out-of-window | 3 |
| Saturday Bag Work (p1-prod1) | past | 2 |
| Morning Vinyasa (p2-prod1) | open | 2 |
| Morning Vinyasa (p2-prod1) | out-of-window | 2 |

Product IDs used as keys must match the actual IDs in `PROGRAM_DETAILS` in `programs.ts`. The existing `sessions` arrays on each `ProductMock` are untouched — they are used by ProductDetailPage for the 3-session preview. `SESSION_INSTANCES` is a separate export used only by SessionsPage.

---

## Page Layout

```
TopNav (loggedIn=true)
│
├─ Breadcrumb  Discover → {programName} → {productName} → Sessions
│
├─ Product header row  (padding: 0 64px 40px)
│   ├─ left: session badge + program mono label / serif product title (52px) / description
│   └─ right: "← Back to product" link + Capacity stat + Upcoming stat (count of sessions with status !== 'past')
│
├─ Schedule section  (paper-2 bg, border-top + border-bottom 1px solid rule)
│   ├─ Section header row
│   │   ├─ left: "§03 · Schedule" mono label / "Full schedule." serif (44px, italic accent word)
│   │   │        / timezone note ("Times shown in {tz} (program timezone)")
│   │   └─ right: "Show past" / "Hide past" toggle + List/Week/Month view toggle
│   │
│   ├─ Session list card  (paper-1 bg, border 1px rule, border-radius 14px, overflow hidden)
│   │   ├─ Session rows
│   │   └─ Pagination bar (hidden when totalPages ≤ 1)
│   │
│   └─ Legend strip
│
└─ Footer
```

**SimpleProductGate:** when `product.type === 'simple'`, render a full-page centered state (same nav/footer wrapper) with a mono label "Simple product", serif heading "No sessions to show.", a short explanation ("This is a simple product — redeem it directly from your wallet."), and a "← Back to product" button.

**Empty state:** when `SESSION_INSTANCES[productId]` is empty or undefined, show "No upcoming sessions scheduled." centered inside the list card.

---

## Session Row

4-column grid: `72px 1fr auto auto` — date / time+coach / capacity / action. Aligned center, `padding: 20px 24px`. Rows separated by `border-top: 1px solid var(--rule)` (first row has no top border).

### Column 1 — Date
- Mono day-of-week abbreviation (10px, uppercase, ink-3)
- Serif date number (32px, ink-1, line-height 1)
- Mono "MMM 'YY" (10px, uppercase, ink-3)
- All times formatted in the program's timezone (`program.timezone`)

### Column 2 — Time + Coach
- Time range: `"10:00 AM – 11:00 AM"` — 15px, weight 500, ink-1
- Sub-line: `"with {coach} · {duration} min"` — 12px, ink-2
- Out-of-window rows additionally show an `"OUTSIDE BOOKING WINDOW"` tag (mono, 11px, uppercase, accent-soft-stripe bg, accent-ink color, border-radius 4px, padding 2px 8px)

### Column 3 — Capacity (min-width 160px)
- Header: `"{taken}/{capacity} taken"` left + `"{open} open"` right — mono, 10px, uppercase, ink-3
- For full sessions: right label shows `"full"` in ink-3
- Fill bar: 4px height, paper-3 track, border-radius 2px
  - Open: accent color fill
  - Full: ink-3 fill
- Hidden entirely for `out-of-window` and `past` rows

### Column 4 — Action (min-width 136px)

| status | element |
|---|---|
| `open` | `"Reserve →"` button — dark fill (ink-1 bg, paper-1 text) |
| `full` | `"Join waitlist"` button — outline (transparent bg, ink-1 border+text) |
| `out-of-window` | `"Request booking"` button — terracotta outline (accent border, accent-ink text) |
| `past` | Plain text `"Past"` — ink-3, 13px |

### Row-level treatments
- `out-of-window`: `background: var(--accent-soft)` tint on entire row
- `past`: `opacity: 0.45`; hidden by default (shown only when `showPast` is true)

---

## Controls

### Show Past toggle
- Boolean state `showPast`, default `false`
- Button text: `"↓ Show past"` / `"↑ Hide past"`
- On toggle: flip state, reset `page` to 0
- Style: 13px, font-sans, weight 500, border 1px rule-2, border-radius 8px

### View toggle
- State `view: 'list' | 'week' | 'month'`, default `'list'`
- Three adjacent buttons — active state: ink-1 bg, paper-1 text, ink-1 border
- On change: set view, reset `page` to 0
- Week and Month views render a centered placeholder card: `"Calendar view coming soon."` with a "Switch to List view →" inline link

### Pagination
- Page size: 8 rows
- `totalPages = Math.max(1, Math.ceil(filtered.length / 8))`
- Bar: `"← Previous"` / `"Page {n+1} of {total}"` mono label / `"Next →"`
- Previous disabled (opacity 0.45, cursor default) when `page === 0`
- Next disabled when `page >= totalPages - 1`
- Entire bar hidden when `totalPages <= 1`

---

## Legend

Below the session list card, a flex row with three items (12px, ink-3, font-sans):

- `■` accent dot — "Open — reserve a spot"
- `■` ink-3 dot — "Full — join waitlist for manager approval"
- `■` accent-soft-stripe dot — "Outside booking window — request approval"

---

## Routing

Add to `App.tsx`:
```tsx
<Route path="/programs/:id/products/:productId/sessions" element={<SessionsPage />} />
```

Add import for `SessionsPage`.

---

## Tests

File: `src/__tests__/SessionsPage.test.tsx`

| # | description |
|---|---|
| 1 | renders page heading with product name |
| 2 | renders SimpleProductGate for simple-type products |
| 3 | renders one row per upcoming session instance |
| 4 | hides past rows by default |
| 5 | reveals past rows after toggling "Show past" |
| 6 | renders "Reserve →" button for open sessions |
| 7 | renders "Join waitlist" button for full sessions |
| 8 | renders "Request booking" button for out-of-window sessions |
| 9 | out-of-window rows show "OUTSIDE BOOKING WINDOW" tag |
| 10 | renders empty state when no sessions exist for product |
| 11 | pagination hidden when total rows ≤ 8 |
| 12 | Next button advances to second page |

---

## Out of Scope

- Real auth gate (page assumes `loggedIn=true`)
- Functional reserve/waitlist/request flows (buttons are static)
- Week and Month calendar views (placeholder only)
- Custom field prompts at booking time
- Walk-in alias (manager-only feature)
