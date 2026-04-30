# ProfilePage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ProfilePage at `/profile` — an authenticated member page with a sidebar nav exposing three panels: Identity (read-only name/email), Email notification preferences (6 toggles), and Account (sign out).

**Architecture:** Single-file component `ProfilePage.tsx` with all three panels inlined. Sidebar nav drives `activeSection` state (`'identity' | 'notifications' | 'account'`). Notification toggles drive `emailPrefs` state. Props accepted for testability (`initialSection`, `initialPrefs`, `userName`, `userEmail`). No additions to `programs.ts` — all types are local.

**Tech Stack:** React 18 + TypeScript, react-router-dom v6 (`useParams` not needed — no URL params), Vitest + Testing Library, inline CSS with design-token vars.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `apps/web/src/pages/ProfilePage.tsx` | Create | Page component — sidebar nav + 3 inlined panels |
| `apps/web/src/__tests__/ProfilePage.test.tsx` | Create | 11 component tests |
| `apps/web/src/App.tsx` | Modify | Add `/profile` route + import |
| `apps/web/src/__tests__/routing.test.tsx` | Modify | Add ProfilePage routing test |
| `PAGES.md` | Modify | Mark ProfilePage `[x]` |

---

## Task 1: Create `ProfilePage.tsx` with tests

**Files:**
- Create: `apps/web/src/__tests__/ProfilePage.test.tsx`
- Create: `apps/web/src/pages/ProfilePage.tsx`

- [ ] **Step 1.1: Write the test file**

Create `apps/web/src/__tests__/ProfilePage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProfilePage } from '../pages/ProfilePage'

function renderProfile(props: React.ComponentProps<typeof ProfilePage> = {}) {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<ProfilePage {...props} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('renders page heading "My profile"', () => {
    renderProfile()
    expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument()
  })

  it('identity panel is shown by default', () => {
    renderProfile()
    expect(screen.getByText('Your details')).toBeInTheDocument()
  })

  it('clicking "Notifications" sidebar item shows notifications panel', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    expect(screen.getByText('Email preferences')).toBeInTheDocument()
  })

  it('clicking "Account" sidebar item shows account panel', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^account$/i }))
    expect(screen.getByText('Account settings')).toBeInTheDocument()
  })

  it('identity panel renders display name and email', () => {
    renderProfile({ userName: 'Maya Alinejad', userEmail: 'maya@example.com' })
    expect(screen.getByText('Maya Alinejad')).toBeInTheDocument()
    expect(screen.getByText('maya@example.com')).toBeInTheDocument()
  })

  it('identity panel shows "read-only" badge on both fields', () => {
    renderProfile()
    expect(screen.getAllByText(/read-only/i)).toHaveLength(2)
  })

  it('notifications panel renders all 6 toggle rows', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    expect(screen.getAllByRole('switch')).toHaveLength(6)
  })

  it('toggles reflect correct default on/off state (4 on, 2 off)', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    const on = screen.getAllByRole('switch').filter(t => t.getAttribute('aria-checked') === 'true')
    expect(on).toHaveLength(4)
  })

  it('clicking a toggle flips its state', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    const toggle = screen.getByRole('switch', { name: /booking confirmed/i })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('account panel renders "Sign out" button', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^account$/i }))
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('account panel shows signed-in email in meta line', async () => {
    const user = userEvent.setup()
    renderProfile({ userEmail: 'maya@example.com' })
    await user.click(screen.getByRole('button', { name: /^account$/i }))
    expect(screen.getByText(/maya@example\.com/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 1.2: Run to verify all tests fail**

```bash
cd apps/web && npx vitest run src/__tests__/ProfilePage.test.tsx
```

Expected: all 11 tests FAIL — `Cannot find module '../pages/ProfilePage'`.

- [ ] **Step 1.3: Create `ProfilePage.tsx`**

Create `apps/web/src/pages/ProfilePage.tsx`:

```tsx
import { useState } from 'react'
import { Footer } from '../components/layout/Footer'
import { TopNav } from '../components/layout/TopNav'

type NotificationEventType =
  | 'booking_confirmed'
  | 'voucher_expiring'
  | 'session_cancelled'
  | 'compensation_issued'
  | 'purchase_confirmed'
  | 'approval_decision'

type EmailPrefs = Record<NotificationEventType, boolean>
type ActiveSection = 'identity' | 'notifications' | 'account'

interface ProfilePageProps {
  initialSection?: ActiveSection
  initialPrefs?: EmailPrefs
  userName?: string
  userEmail?: string
}

const DEFAULT_PREFS: EmailPrefs = {
  booking_confirmed: true,
  voucher_expiring: true,
  session_cancelled: true,
  compensation_issued: false,
  purchase_confirmed: true,
  approval_decision: false,
}

const EVENT_META: Record<NotificationEventType, { label: string; desc: string }> = {
  booking_confirmed:  { label: 'Booking confirmed',  desc: 'When a session booking is confirmed' },
  voucher_expiring:   { label: 'Voucher expiring',   desc: 'Reminder when a voucher expires in 1 day' },
  session_cancelled:  { label: 'Session cancelled',  desc: "When a session you've booked is cancelled" },
  compensation_issued:{ label: 'Compensation issued',desc: 'When a compensation voucher is issued to you' },
  purchase_confirmed: { label: 'Purchase confirmed', desc: 'Receipt when a package purchase goes through' },
  approval_decision:  { label: 'Approval decision',  desc: 'When a booking request is approved or denied' },
}

const EVENT_ORDER: NotificationEventType[] = [
  'booking_confirmed',
  'voucher_expiring',
  'session_cancelled',
  'compensation_issued',
  'purchase_confirmed',
  'approval_decision',
]

const SIDEBAR_ITEMS: { id: ActiveSection; label: string }[] = [
  { id: 'identity',      label: 'Identity' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'account',       label: 'Account' },
]

function CardShell({ sublabel, title, children }: { sublabel: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px 14px', background: 'var(--paper-2)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>
          {sublabel}
        </div>
        <div style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>
          {title}
        </div>
      </div>
      <div style={{ padding: 24 }}>
        {children}
      </div>
    </div>
  )
}

export function ProfilePage({
  initialSection = 'identity',
  initialPrefs = DEFAULT_PREFS,
  userName = 'Maya Alinejad',
  userEmail = 'maya@example.com',
}: ProfilePageProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>(initialSection)
  const [emailPrefs, setEmailPrefs] = useState<EmailPrefs>({ ...initialPrefs })

  function togglePref(event: NotificationEventType) {
    setEmailPrefs(prev => ({ ...prev, [event]: !prev[event] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-1)', color: 'var(--ink-1)' }}>
      <TopNav loggedIn={true} />

      <main style={{ padding: '48px 56px 72px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
            §08 · My profile
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', fontSize: 36, letterSpacing: '-0.02em', color: 'var(--ink-1)', lineHeight: 1.05 }}>
            My <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>profile.</em>
          </h1>
        </div>

        {/* Settings layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 40, alignItems: 'start' }}>

          {/* Sidebar */}
          <nav style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SIDEBAR_ITEMS.map(item => {
              const active = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8,
                    border: 0, background: active ? 'var(--paper-2)' : 'transparent',
                    color: active ? 'var(--ink-1)' : 'var(--ink-2)',
                    fontFamily: 'var(--font-sans, sans-serif)', fontSize: 14,
                    fontWeight: active ? 500 : 400,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: 'var(--accent)', opacity: active ? 1 : 0 }} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Panel area */}
          <div>

            {/* ── Identity panel ── */}
            {activeSection === 'identity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardShell sublabel="§08.1 · Identity" title="Your details">
                  {[
                    { label: 'Display name', value: userName },
                    { label: 'Email',        value: userEmail },
                  ].map((field, i, arr) => (
                    <div key={field.label} style={{ marginBottom: i < arr.length - 1 ? 20 : 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>
                        {field.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 8 }}>
                        <span style={{ fontSize: 15, color: 'var(--ink-1)' }}>{field.value}</span>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', background: 'var(--paper-3)', padding: '2px 8px', borderRadius: 99 }}>
                          read-only
                        </span>
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6, margin: '16px 0 0' }}>
                    Your name and email are managed by your authentication provider and cannot be changed here.
                  </p>
                </CardShell>
              </div>
            )}

            {/* ── Notifications panel ── */}
            {activeSection === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardShell sublabel="§08.2 · Notifications" title="Email preferences">
                  <div style={{ margin: '0 -24px', padding: '0 24px' }}>
                    {EVENT_ORDER.map((eventType, i) => {
                      const { label, desc } = EVENT_META[eventType]
                      const on = emailPrefs[eventType]
                      return (
                        <div
                          key={eventType}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
                            borderBottom: i < EVENT_ORDER.length - 1 ? '1px solid var(--rule)' : 'none',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, color: 'var(--ink-1)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{desc}</div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={label}
                            onClick={() => togglePref(eventType)}
                            style={{
                              width: 40, height: 22, borderRadius: 99, position: 'relative',
                              flexShrink: 0, cursor: 'pointer', padding: 0,
                              border: on ? 'none' : '1px solid var(--rule-2)',
                              background: on ? 'var(--accent)' : 'var(--paper-3)',
                            }}
                          >
                            <span style={{
                              position: 'absolute', top: on ? 3 : 2,
                              left: on ? 21 : 3,
                              width: 16, height: 16, borderRadius: '50%',
                              background: 'white',
                              boxShadow: '0 1px 3px oklch(0.3 0.02 50 / 20%)',
                            }} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </CardShell>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
                  In-app push notifications are always on. Email notifications can be toggled per event type above. Changes are saved automatically.
                </p>
              </div>
            )}

            {/* ── Account panel ── */}
            {activeSection === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardShell sublabel="§08.3 · Account" title="Account settings">
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '10px 20px', borderRadius: 8,
                      border: '1px solid var(--rule-2)',
                      background: 'var(--paper-1)', color: 'var(--ink-1)',
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </button>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, paddingTop: 16, borderTop: '1px solid var(--rule)', marginTop: 16 }}>
                    Signed in as{' '}
                    <strong style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{userEmail}</strong>
                    {' '}via NeonAuth.
                  </div>
                </CardShell>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 1.4: Run to verify all 11 tests pass**

```bash
cd apps/web && npx vitest run src/__tests__/ProfilePage.test.tsx
```

Expected: all 11 tests PASS.

- [ ] **Step 1.5: Run the full test suite to verify no regressions**

```bash
cd apps/web && npm test
```

Expected: all existing tests still pass.

- [ ] **Step 1.6: Commit**

```bash
git add apps/web/src/pages/ProfilePage.tsx apps/web/src/__tests__/ProfilePage.test.tsx
git commit -m "feat: add ProfilePage with identity, notification prefs, and account panels"
```

---

## Task 2: Wire routing and mark PAGES.md done

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/__tests__/routing.test.tsx`
- Modify: `PAGES.md` (project root)

- [ ] **Step 2.1: Write the failing routing test**

In `apps/web/src/__tests__/routing.test.tsx`, add inside the `describe('routing', ...)` block (after the last existing `it(...)` call):

```tsx
  it('renders ProfilePage at /profile', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument()
  })
```

- [ ] **Step 2.2: Run to verify it fails**

```bash
cd apps/web && npx vitest run src/__tests__/routing.test.tsx
```

Expected: FAIL — route not found, heading not in document.

- [ ] **Step 2.3: Wire the route in `App.tsx`**

In `apps/web/src/App.tsx`, add the import after the `NotificationsPage` import line:

```tsx
import { ProfilePage } from './pages/ProfilePage'
```

Add the route after the `/notifications` route inside `<Routes>`:

```tsx
<Route path="/profile" element={<ProfilePage />} />
```

- [ ] **Step 2.4: Run the routing test to verify it passes**

```bash
cd apps/web && npx vitest run src/__tests__/routing.test.tsx
```

Expected: all routing tests pass including the new one.

- [ ] **Step 2.5: Run the full test suite**

```bash
cd apps/web && npm test
```

Expected: all tests pass.

- [ ] **Step 2.6: Mark ProfilePage done in `PAGES.md`**

In `PAGES.md` at the project root, change:

```markdown
- [ ] **ProfilePage** — `/profile` — Display name, email (read-only from auth provider). Email notification toggles per event type (on/off). Account settings.
```

to:

```markdown
- [x] **ProfilePage** — `/profile` — Display name, email (read-only from auth provider). Email notification toggles per event type (on/off). Account settings.
```

- [ ] **Step 2.7: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/__tests__/routing.test.tsx PAGES.md
git commit -m "feat: wire ProfilePage route and mark done in PAGES.md"
```
