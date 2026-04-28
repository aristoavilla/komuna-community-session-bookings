# Komuna — Discovery Page Design

_2026-04-28_

## Scope

Implement the member-facing **Discovery page** from the Komuna design handoff (`Komuna Discovery.html`). This is the first frontend surface — no other screens (product detail, analytics, notifications) are in scope for this pass.

## Design Direction

**Direction A — Safe editorial.** Warm paper-toned aesthetic: cream backgrounds, deep ink text, terracotta accent (`oklch(0.62 0.16 38)`). Typography: DM Serif Display (headlines), Inter Tight (body/UI), JetBrains Mono (labels/tags/mono details). Closest reference: ClassPass meets an editorial magazine.

**Hero layout: Search-first.** Centered layout — monospace eyebrow label, large serif headline, description paragraph, full-width search bar, quick-filter chips ("Boxing near me", "Morning yoga", "Open today", "1:1 coaching", "Online HIIT"). No illustration, no featured program card.

## Project Scaffold

A standalone **Vite + React SPA** at `apps/web/`. The Komuna backend (Hono + Cloudflare Workers) is a separate future concern — this frontend will eventually call it but starts with static mock data.

```
apps/web/
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  src/
    main.tsx
    App.tsx
    globals.css
    components/
      layout/
        TopNav.tsx
        Footer.tsx
      discovery/
        HeroSearch.tsx
        SearchBar.tsx
        CategorySidebar.tsx
        FilterChips.tsx
        ProgramCard.tsx
        ProgramGrid.tsx
      ui/              ← shadcn primitives (Button, Input only)
    data/
      programs.ts      ← mock program data
    lib/
      utils.ts
    pages/
      DiscoveryPage.tsx
```

## Styling

**CSS custom properties** defined in `globals.css`, referenced as Tailwind design tokens:

| Variable | Value | Usage |
|---|---|---|
| `--paper-1` | `oklch(0.985 0.008 75)` | Page background |
| `--paper-2` | `oklch(0.965 0.012 75)` | Hero background |
| `--paper-3` | `oklch(0.94 0.014 75)` | Tile / hover background |
| `--ink-1` | `oklch(0.21 0.02 50)` | Primary text |
| `--ink-2` | `oklch(0.45 0.02 50)` | Secondary text |
| `--ink-3` | `oklch(0.62 0.018 50)` | Tertiary / placeholder text |
| `--rule` | `oklch(0.9 0.012 75)` | Light borders |
| `--rule-2` | `oklch(0.82 0.014 75)` | Medium borders |
| `--accent` | `oklch(0.62 0.16 38)` | Terracotta accent |
| `--accent-soft` | `oklch(0.94 0.04 38)` | Accent tint background |
| `--ok` | `oklch(0.62 0.13 150)` | Green status dot (Open) |

`tailwind.config.ts` extends `colors` to expose these as utilities (`bg-paper-1`, `text-ink-2`, `border-rule`, etc.).

**shadcn/ui** is used for `Button` and `Input` primitives only, overridden via CSS variables. All other components (nav, card, sidebar) are custom-built to match the design exactly.

**Fonts** loaded via Google Fonts in `index.html`:
- `DM Serif Display` (ital 0;1)
- `Inter Tight` (wght 400;500;600;700)
- `JetBrains Mono` (wght 400;500)

## Component Specifications

### TopNav
- Height: 68px, `bg-paper-1`, bottom border `var(--rule)`
- Left: `k` logo circle (accent bg, serif) + "komuna" serif wordmark
- Center: nav links — Discover (active/bold), How it works, For trainers, Pricing
- Right (logged-in): "My bookings" text link + `NotificationBell` (count badge: 3) + avatar pill (initials + name + chevron)
- Right (logged-out): "Log in" link + "Get started" filled button
- Hardcoded to logged-in state for this mock

### NotificationBell
- 38px circle button, border `var(--rule)`
- Bell SVG icon, terracotta badge with count when `count > 0`
- No dropdown in this scope

### HeroSearch
- `bg-paper-2`, border-bottom, centered text layout
- Eyebrow: `font-mono`, 11px, uppercase, `text-ink-3`, letter-spacing 0.1em
- Headline: `font-serif`, 72px, line-height 1, letter-spacing -0.03em, max-width 900px
- "trainer." in accent color, italic
- Description: `font-sans`, 17px, line-height 1.55, `text-ink-2`, max-width 580px
- Search bar: full-width (max 720px), centered, `SearchBar` component
- Chips: "Boxing near me", "Morning yoga", "Online HIIT", "1:1 coaching", "Open today" — pill badges, `border-rule`, `bg-paper-1`

### SearchBar
- Flex row: search icon + placeholder text + `⌘ K` kbd badge + Search button
- Border `var(--rule-2)`, border-radius 12px, `bg-paper-1`
- Search button: accent background, 13px, font-weight 500

### CategorySidebar
- Width: 220px, flex-shrink 0
- Three sections separated by `var(--rule)` dividers:
  1. **Browse by category** — list of 9 categories with counts, active item gets `bg-paper-3`
  2. **Location** — text input showing "Brooklyn, NY · 5mi ▾" + 4 checkboxes ("Within 1 mile" etc.)
  3. **Visibility legend** — colored dots for Open / Needs approval / Invitation only
- Section labels: `font-mono`, 11px, uppercase, `text-ink-3`

### ProgramCard
- `bg-paper-1`, border `var(--rule)`, border-radius 14px
- Image area: striped placeholder (`repeating-linear-gradient`), tone controlled by `imageTone` prop
  - Overlaid: visibility badge (top-left pill) + category tag (top-right pill)
- Body: program name (`font-serif`, 19px) + location · members count
- Footer (border-top `var(--rule)`): price (`font-serif`, 20px) + rating star + sessions/week

### FilterChips
- Active filter pills: "Open today ×", "Within 5mi ×", "Under $30 ×", "★ 4.8+ ×", "+2 more"
- `bg-paper-2`, border `var(--rule)`, border-radius 999px, 12px font
- Clicking × removes the chip from `activeFilters` state

### ProgramGrid
- 3-column CSS grid, gap 20px
- Renders `ProgramCard` for each filtered program
- "Show 242 more programs" button below — no-op in mock

## Mock Data

Located at `src/data/programs.ts`. Typed to match the shape the real API will return:

```ts
type ProgramListItem = {
  id: string
  name: string
  description: string
  visibility: 'public' | 'need-approval' | 'invitation-only' | 'private'
  timezone: string
  // Aggregated — would come from JOINs in the real API
  memberCount: number
  lowestPrice: string
  // Not yet in DB schema — to be added to PROGRAM table
  location?: string
  category?: string
  rating?: number
  sessionsPerWeek?: number
  // UI-only — removed once real images are used
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
}
```

6 programs from the design: Eastside Boxing Club, Slow Flow with Ines, Strong Together, Sprint Lab, Roundhouse Muay Thai, Sunrise Vinyasa.

**Schema gap noted:** `category`, `rating`, and `location` are shown in the design but are absent from the current `PROGRAM` table. They will need to be added when the backend is built.

## Interactions

| Interaction | Behaviour |
|---|---|
| Category sidebar click | Highlights selected category; filters `ProgramGrid` to cards matching `category` field |
| Filter chip × click | Removes chip from `activeFilters` state (UI only — chips don't map to data fields, so card list is unaffected) |
| Search bar input | Controlled input; no real filtering in mock. Hero and programs-section bars are independent instances. |
| Location filter | UI only; no effect on cards |
| "Show more" button | No-op |
| Notification bell | Renders with badge count; no dropdown |
| Program card click | No-op (product detail not in scope) |

## Page Assembly (`DiscoveryPage.tsx`)

```
<TopNav />
<HeroSearch />
<section "Available programs">
  <header>  heading + sort control  </header>
  <div flex>
    <CategorySidebar active={activeCategory} onSelect={setActiveCategory} />
    <div flex-col>
      <SearchBar />
      <FilterChips chips={activeFilters} onRemove={removeFilter} />
      <ProgramGrid programs={filteredPrograms} />
      <ShowMoreButton />
    </div>
  </div>
</section>
<Footer />
```

## Out of Scope

- Product detail page, analytics dashboards, notifications dropdown
- Real search / filtering against a backend
- Location-based filtering
- Authentication / login flow
- Mobile responsive layout (design is 1440px desktop)
- `category`, `rating`, `location` DB fields (tracked as schema gaps above)
