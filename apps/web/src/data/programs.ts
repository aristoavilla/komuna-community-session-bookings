export type ProgramListItem = {
  id: string
  name: string
  description: string
  visibility: 'public' | 'need-approval' | 'invitation-only' | 'private'
  timezone: string
  memberCount: number
  lowestPrice: string
  // Not yet in DB schema — to be added to PROGRAM table
  location?: string
  category?: string
  rating?: number
  sessionsPerWeek?: number
  // UI-only: removed once real images exist
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
}

export const PROGRAMS: ProgramListItem[] = [
  {
    id: 'p1',
    name: 'Eastside Boxing Club',
    description: 'High-intensity bag work, pad rounds, and conditioning in Brooklyn.',
    visibility: 'public',
    timezone: 'America/New_York',
    memberCount: 412,
    lowestPrice: '$28',
    location: 'Brooklyn, NY',
    category: 'Boxing',
    rating: 4.9,
    sessionsPerWeek: 6,
    imageTone: 'warm',
    imageLabel: 'BAG WORK · COACH',
  },
  {
    id: 'p2',
    name: 'Slow Flow with Ines',
    description: 'Gentle vinyasa and yin yoga for all levels, morning sessions.',
    visibility: 'need-approval',
    timezone: 'Europe/Lisbon',
    memberCount: 86,
    lowestPrice: '€22',
    location: 'Lisbon',
    category: 'Yoga',
    rating: 5.0,
    sessionsPerWeek: 3,
    imageTone: 'cool',
    imageLabel: 'MAT · MORNING LIGHT',
  },
  {
    id: 'p3',
    name: 'Strong Together',
    description: 'Barbell strength program built around progressive overload and community.',
    visibility: 'public',
    timezone: 'Europe/Berlin',
    memberCount: 240,
    lowestPrice: '€34',
    location: 'Berlin',
    category: 'Strength',
    rating: 4.8,
    sessionsPerWeek: 8,
    imageTone: 'ink',
    imageLabel: 'BARBELL · LIFT',
  },
  {
    id: 'p4',
    name: 'Sprint Lab',
    description: 'Online HIIT program with track intervals and timed circuits.',
    visibility: 'invitation-only',
    timezone: 'America/New_York',
    memberCount: 1124,
    lowestPrice: '$19',
    location: 'Online',
    category: 'HIIT',
    rating: 4.7,
    sessionsPerWeek: 12,
    imageTone: 'accent',
    imageLabel: 'TRACK · INTERVAL',
  },
  {
    id: 'p5',
    name: 'Roundhouse Muay Thai',
    description: 'Technical Muay Thai with pad work, clinch, and conditioning rounds.',
    visibility: 'public',
    timezone: 'America/Chicago',
    memberCount: 178,
    lowestPrice: '$32',
    location: 'Austin, TX',
    category: 'Boxing',
    rating: 4.9,
    sessionsPerWeek: 5,
    imageTone: 'warm',
    imageLabel: 'RING · PADWORK',
  },
  {
    id: 'p6',
    name: 'Sunrise Vinyasa',
    description: 'Open-air yoga retreat in Bali. Flow at sunrise, meditate at dusk.',
    visibility: 'need-approval',
    timezone: 'Asia/Makassar',
    memberCount: 64,
    lowestPrice: '$24',
    location: 'Bali',
    category: 'Yoga',
    rating: 5.0,
    sessionsPerWeek: 4,
    imageTone: 'cool',
    imageLabel: 'RETREAT · OUTDOOR',
  },
]

export const CATEGORIES = [
  { id: 'all',          label: 'All programs',   count: 248 },
  { id: 'Boxing',       label: 'Boxing',          count: 34  },
  { id: 'Yoga',         label: 'Yoga & mobility', count: 71  },
  { id: 'Strength',     label: 'Strength',        count: 52  },
  { id: 'HIIT',         label: 'HIIT & cardio',   count: 28  },
  { id: 'Running',      label: 'Running',          count: 19  },
  { id: 'Pilates',      label: 'Pilates',          count: 22  },
  { id: 'Martial arts', label: 'Martial arts',     count: 14  },
  { id: 'Online only',  label: 'Online only',      count: 88  },
] as const
