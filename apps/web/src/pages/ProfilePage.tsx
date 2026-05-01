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
        <h2 style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>
          {title}
        </h2>
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
                  aria-current={active ? 'page' : undefined}
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
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: 'var(--accent)', opacity: active ? 1 : 0 }} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Panel area */}
          <div>

            {/* Identity panel */}
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

            {/* Notifications panel */}
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
                              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
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

            {/* Account panel */}
            {activeSection === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardShell sublabel="§08.3 · Account" title="Account settings">
                  <button
                    type="button"
                    onClick={() => { /* TODO: wire to auth sign-out */ }}
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
