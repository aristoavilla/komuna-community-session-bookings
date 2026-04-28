import { useState } from 'react'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { HeroSearch } from '../components/discovery/HeroSearch'
import { SearchBar } from '../components/discovery/SearchBar'
import { CategorySidebar } from '../components/discovery/CategorySidebar'
import { FilterChips } from '../components/discovery/FilterChips'
import { ProgramGrid } from '../components/discovery/ProgramGrid'
import { PROGRAMS } from '../data/programs'

const DEFAULT_CHIPS = ['Open today', 'Within 5mi', 'Under $30', '★ 4.8+']

export function DiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeChips, setActiveChips] = useState(DEFAULT_CHIPS)
  const [searchValue, setSearchValue] = useState('')

  const filteredPrograms = activeCategory === 'all'
    ? PROGRAMS
    : PROGRAMS.filter(p => p.category === activeCategory)

  function removeChip(chip: string) {
    setActiveChips(prev => prev.filter(c => c !== chip))
  }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <HeroSearch searchValue={searchValue} onSearchChange={setSearchValue} />

      {/* Available programs */}
      <section style={{ padding: '56px 64px 80px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--ink-3)', marginBottom: 10,
              }}
            >
              §02 · Discover
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, serif)', fontSize: 36,
                letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: 0,
              }}
            >
              Available programs
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8, maxWidth: 480 }}>
              248 programs from independent coaches and studios. Filter by what you actually want to do this week.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--ink-2)' }}>
            <span>Sort:</span>
            <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>Closest first ▾</span>
          </div>
        </div>

        {/* Sidebar + grid */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <CategorySidebar activeId={activeCategory} onSelect={setActiveCategory} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SearchBar value={searchValue} onChange={setSearchValue} />
            <FilterChips chips={activeChips} onRemove={removeChip} />
            <ProgramGrid programs={filteredPrograms} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
