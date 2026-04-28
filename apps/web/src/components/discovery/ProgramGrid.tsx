import type { ProgramListItem } from '../../data/programs'
import { ProgramCard } from './ProgramCard'

interface ProgramGridProps {
  programs: ProgramListItem[]
}

export function ProgramGrid({ programs }: ProgramGridProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {programs.map(p => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          type="button"
          style={{
            padding: '12px 24px', background: 'transparent',
            border: '1px solid var(--rule-2)', borderRadius: 10,
            color: 'var(--ink-1)', fontSize: 14, cursor: 'pointer',
          }}
        >
          Show 242 more programs
        </button>
      </div>
    </div>
  )
}
