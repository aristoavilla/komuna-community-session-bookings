import type { ProgramListItem } from '../../data/programs'

const VIS = {
  public:           { text: 'Open',    dot: 'var(--ok)'     },
  'need-approval':  { text: 'Apply',   dot: 'var(--accent)' },
  'invitation-only':{ text: 'Invite',  dot: 'var(--ink-2)'  },
  private:          { text: 'Private', dot: 'var(--ink-3)'  },
} as const

const TONE_STYLES: Record<ProgramListItem['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

function ImagePlaceholder({ label, tone }: { label: string; tone: ProgramListItem['imageTone'] }) {
  const t = TONE_STYLES[tone]
  return (
    <div
      style={{
        aspectRatio: '4 / 3',
        background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
        color: t.fg,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          background: t.bg,
          padding: '3px 7px',
          border: `1px solid ${t.stripe}`,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export function ProgramCard({ program: p }: { program: ProgramListItem }) {
  const vis = VIS[p.visibility]
  return (
    <div
      style={{
        background: 'var(--paper-1)',
        border: '1px solid var(--rule)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative' }}>
        <ImagePlaceholder label={p.imageLabel} tone={p.imageTone} />
        {/* Visibility badge */}
        <div
          style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--paper-1)', padding: '4px 9px',
            borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-1)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 3, background: vis.dot }} />
          {vis.text}
        </div>
        {/* Category tag */}
        {p.category && (
          <div
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'var(--paper-1)', padding: '4px 9px',
              borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-1)',
            }}
          >
            {p.category}
          </div>
        )}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 19, color: 'var(--ink-1)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            {p.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
            {p.location} · {p.memberCount} members
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--rule)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>{p.lowestPrice}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>/ session</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-2)' }}>
            {p.rating && <span>★ {p.rating}</span>}
            {p.sessionsPerWeek && <><span style={{ color: 'var(--ink-3)' }}>·</span><span>{p.sessionsPerWeek} sessions/wk</span></>}
          </div>
        </div>
      </div>
    </div>
  )
}
