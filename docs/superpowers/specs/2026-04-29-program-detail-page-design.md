# ProgramDetailPage — Design Spec

_Date: 2026-04-29_

## Overview

Implement `ProgramDetailPage` at `/programs/:id` as the second page in the member-facing flow (after the already-complete DiscoveryPage). Also wire client-side routing and fix missing fonts as part of the same unit of work.

---

## Infrastructure

### Routing
- Install `react-router-dom` as a production dependency in `apps/web`
- Wrap `<App>` in `<BrowserRouter>` in `main.tsx`
- Define routes in `App.tsx`:
  - `/` → `<DiscoveryPage />`
  - `/programs/:id` → `<ProgramDetailPage />`
- `ProgramCard` navigates to `/programs/:id` on click (use `<Link>` or `useNavigate`)

### Fonts
- Add a `<link>` to `index.html` for Google Fonts: `DM Serif Display` (regular + italic) and `JetBrains Mono` (400, 500)
- Inter Tight already loads from the system stack but should also be included explicitly in the same Google Fonts request
- CSS variables `--font-serif`, `--font-mono`, `--font-sans` are already defined in `globals.css` — no changes needed there

---

## Mock Data

Add to `apps/web/src/data/programs.ts`:

### `ProductItem` type
```ts
type ProductItem = {
  id: string
  name: string
  description: string
  type: 'session' | 'simple'
  sessionsPerWeek?: number   // session-type only
  lowestPrice: string
  imageTone: ProgramListItem['imageTone']
  imageLabel: string
}
```

### `ProgramDetail` type
```ts
type ProgramDetail = ProgramListItem & {
  longDescription: string
  products: ProductItem[]
}
```

### `PROGRAM_DETAILS` map
A `Record<string, ProgramDetail>` keyed by program id (`p1`–`p6`). Each program gets 2–3 products — at least one `session` type and one `simple` type per program. Example for `p1` (Eastside Boxing Club):
- Saturday Bag Work (session, 2/wk, $28)
- Friday Pad Rounds (session, 1/wk, $32)
- Drop-in Pass (simple, $28)

---

## ProgramDetailPage Component

File: `apps/web/src/pages/ProgramDetailPage.tsx`

### Structure
```
<div> (paper-1 bg, min-height 100vh)
  <TopNav loggedIn={true} />
  <Breadcrumb />
  <HeroSection program={detail} />
  <ProductsSection products={detail.products} programId={id} />
  <Footer />
</div>
```

### Breadcrumb
- `padding: 20px 64px`
- Font: 13px Inter Tight, `var(--ink-3)`
- Content: `Discover → {program.name}` — "Discover" is a `<Link to="/">` in accent color on hover, plain ink-3 at rest

### HeroSection
Two-column grid (`1fr 1fr`, gap 56px, `padding: 0 64px 56px`):

**Left column:**
- `Placeholder` component, ratio `4/5`, tone matching `program.imageTone`
- Visibility badge (absolute, top-left): pill with colored dot + label — same mapping as `ProgramCard` (`public`→`Open·green`, `need-approval`→`Apply·accent`, `invitation-only`→`Invite·ink-2`)
- Location + timezone chip (absolute, bottom-right): dark mono chip (`var(--ink-1)` bg, `var(--paper-1)` text) — `{location} · {timezone}`

**Right column (flex column, justify space-between):**

Top block:
- Category pill: accent-soft bg, accent-ink text, 12px
- Program name: `<h1>` DM Serif Display, ~72px, `-0.03em` tracking, line-height 0.95. Last word italicized in accent color (e.g. *"Eastside Boxing*\n*Club."* with "Club." italic)
- Description (`longDescription`): 16px Inter Tight, `var(--ink-2)`, max-width 540, line-height 1.6

Stats strip (border-top + border-bottom, `var(--rule)`):
- 4 stat cells (flex, gap 24, padding 28px 0): Members · Sessions/wk · From · Timezone
- Each cell: mono 10px uppercase label (`var(--ink-3)`) + serif 32px value (`var(--ink-1)`) + 12px sub-label (`var(--ink-2)`)

Join CTA block (margin-top 28):
- `public` → filled button: accent bg, `var(--paper-1)` text, "Join program →", border-radius 10, padding 16px 28px
- `need-approval` → outline button: transparent bg, `var(--ink-1)` border + text, "Request to join" + 13px helper text below: "Admin reviews all requests"
- `invitation-only` → disabled ghost: `var(--paper-3)` bg, `var(--ink-3)` text, "Invitation only" + helper text: "Contact the admin to request access"
- `private` → not reachable via discovery; show nothing (fallback 404)

### ProductsSection
`padding: 56px 64px 80px`

Header:
- Mono eyebrow: `§02 · Products`, 11px, 0.1em tracking, uppercase, `var(--ink-3)`
- `<h2>` DM Serif Display 36px: "What's offered"
- Sub: 14px, `var(--ink-2)`: `{n} products available`

3-column product grid (`repeat(3, 1fr)`, gap 24):

**ProductCard** (per product):
- Border `var(--rule)`, border-radius 14, overflow hidden
- `Placeholder` at `16/9` ratio, matching `imageTone`
- Type badge (absolute, top-right): dark mono chip — `SESSION` or `SIMPLE` in JetBrains Mono 10px, dark bg
- Body (padding 16, flex column, gap 10):
  - Product name: 19px DM Serif Display, `var(--ink-1)`
  - Description: 13px, `var(--ink-2)`, 2-line clamp
  - Footer (border-top, flex space-between):
    - Price: serif 20px `{lowestPrice}` + 12px `/ session`
    - Stat: `{sessionsPerWeek} sessions/wk` for session-type; `Redeemable` for simple
  - Link: `→ View sessions` (session) or `→ View details` (simple), 13px, accent color — navigates to `/programs/:id/products/:productId` (stub route, not yet implemented)

---

## Tests

File: `apps/web/src/__tests__/ProgramDetailPage.test.tsx`

Scenarios to cover:
1. Renders program name and description for a known id
2. Renders all products for that program
3. Shows "Join program →" button for a `public` program
4. Shows "Request to join" button for a `need-approval` program
5. Shows "Invitation only" (disabled) for `invitation-only` program
6. Clicking a product card navigates to the correct product URL (mock `useNavigate` or check `<Link href>`)

Use `MemoryRouter` from react-router-dom to wrap the component in tests.

---

## Routing / Navigation wiring

After this page is done, `PAGES.md` item `ProgramDetailPage` is marked `[x]`. The `/programs/:id/products/:productId` route is left as a stub (no page yet) — the next task (`ProductDetailPage`) will implement it.

---

## Out of scope for this task
- Real auth state (loggedIn is hardcoded `true` for now)
- Actual join/request API calls (buttons are UI-only stubs)
- ProductDetailPage implementation
- Any admin or manager flows
