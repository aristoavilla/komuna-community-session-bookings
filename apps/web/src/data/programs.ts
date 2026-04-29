// ─── ERD-aligned types ───────────────────────────────────────────────────────

export type ProgramListItem = {
  // ERD: PROGRAM table fields
  id: string
  name: string
  description: string
  visibility: 'public' | 'need-approval' | 'invitation-only' | 'private'
  timezone: string
  created_at: string            // ISO-8601

  // UI-only extras
  memberCount: number
  lowestPrice: string
  location?: string
  category?: string
  rating?: number
  sessionsPerWeek?: number
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
}

export type ProductMock = {
  // ERD: PRODUCT table fields
  id: string
  program_id: string
  name: string
  description: string
  type: 'session' | 'simple'
  status: 'active' | 'archived'
  created_at: string            // ISO-8601

  // UI-only extras
  capacity?: number             // session-type only
  sessionsPerWeek?: number      // session-type only
  lowestPrice: string
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
}

export type ProgramDetailMock = ProgramListItem & {
  longDescription: string       // UI-only: expanded copy for detail page
  products: ProductMock[]
}

// ─── Discovery list data ──────────────────────────────────────────────────────

export const PROGRAMS: ProgramListItem[] = [
  {
    id: 'p1',
    name: 'Eastside Boxing Club',
    description: 'High-intensity bag work, pad rounds, and conditioning in Brooklyn.',
    visibility: 'public',
    timezone: 'America/New_York',
    created_at: '2024-01-15T10:00:00Z',
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
    created_at: '2024-03-01T08:00:00Z',
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
    created_at: '2024-02-10T09:00:00Z',
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
    created_at: '2023-11-20T12:00:00Z',
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
    created_at: '2024-04-01T11:00:00Z',
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
    created_at: '2024-05-05T06:00:00Z',
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

// ─── Program detail data (one entry per program) ──────────────────────────────

export const PROGRAM_DETAILS: Record<string, ProgramDetailMock> = {
  p1: {
    ...PROGRAMS[0],
    longDescription:
      'Eastside Boxing Club has trained fighters and fitness enthusiasts out of Williamsburg since 2019. Coach Marcus runs tight, structured classes — heavy bag rounds, pad work with rotating trainers, and conditioning finishers. No sparring unless you ask for it. Gloves and wraps provided for your first session.',
    products: [
      {
        id: 'prod-p1-1',
        program_id: 'p1',
        name: 'Saturday Bag Work',
        description: 'Six rounds of heavy bag, two of conditioning, one of stretching. Saturdays at 8 AM.',
        type: 'session',
        status: 'active',
        created_at: '2024-01-20T10:00:00Z',
        capacity: 14,
        sessionsPerWeek: 2,
        lowestPrice: '$28',
        imageTone: 'warm',
        imageLabel: 'BAG WORK · SAT',
      },
      {
        id: 'prod-p1-2',
        program_id: 'p1',
        name: 'Friday Pad Rounds',
        description: 'Partner pad work with rotating coaches. All levels welcome. Fridays at 7 PM.',
        type: 'session',
        status: 'active',
        created_at: '2024-01-20T10:00:00Z',
        capacity: 10,
        sessionsPerWeek: 1,
        lowestPrice: '$32',
        imageTone: 'warm',
        imageLabel: 'PAD ROUNDS · FRI',
      },
      {
        id: 'prod-p1-3',
        program_id: 'p1',
        name: 'Drop-in Pass',
        description: 'Single-use pass valid for any open class. No expiry within 60 days of purchase.',
        type: 'simple',
        status: 'active',
        created_at: '2024-01-20T10:00:00Z',
        lowestPrice: '$28',
        imageTone: 'accent',
        imageLabel: 'DROP-IN · PASS',
      },
    ],
  },
  p2: {
    ...PROGRAMS[1],
    longDescription:
      'Ines brings a slow, meditative approach to vinyasa — long holds, breath-first cues, and genuine attention to alignment. Held in a light-filled studio in Mouraria. Morning sessions run Tuesday, Thursday, and Sunday. All levels welcome; props provided.',
    products: [
      {
        id: 'prod-p2-1',
        program_id: 'p2',
        name: 'Morning Vinyasa',
        description: 'A 60-minute flow focused on breath and steady movement. Tuesday, Thursday, Sunday.',
        type: 'session',
        status: 'active',
        created_at: '2024-03-05T08:00:00Z',
        capacity: 12,
        sessionsPerWeek: 3,
        lowestPrice: '€22',
        imageTone: 'cool',
        imageLabel: 'FLOW · MORNING',
      },
      {
        id: 'prod-p2-2',
        program_id: 'p2',
        name: 'Class Pass (5×)',
        description: 'Five sessions bundled. Valid for 45 days from purchase.',
        type: 'simple',
        status: 'active',
        created_at: '2024-03-05T08:00:00Z',
        lowestPrice: '€95',
        imageTone: 'cool',
        imageLabel: 'PASS · 5×',
      },
    ],
  },
  p3: {
    ...PROGRAMS[2],
    longDescription:
      'Strong Together runs a 12-week progressive overload program out of a warehouse gym in Neukölln. The community lifts together three times a week — squat, press, and pull days — with an optional conditioning add-on on Saturdays. Beginners get a form-check session in week one.',
    products: [
      {
        id: 'prod-p3-1',
        program_id: 'p3',
        name: 'Barbell Fundamentals',
        description: 'Three lifts, three days a week. Mon / Wed / Fri, 7 AM and 6 PM slots.',
        type: 'session',
        status: 'active',
        created_at: '2024-02-15T09:00:00Z',
        capacity: 18,
        sessionsPerWeek: 6,
        lowestPrice: '€34',
        imageTone: 'ink',
        imageLabel: 'LIFT · BARBELL',
      },
      {
        id: 'prod-p3-2',
        program_id: 'p3',
        name: 'Saturday Conditioning',
        description: 'Optional add-on. Kettlebell and carry circuits, 45 min.',
        type: 'session',
        status: 'active',
        created_at: '2024-02-15T09:00:00Z',
        capacity: 20,
        sessionsPerWeek: 1,
        lowestPrice: '€18',
        imageTone: 'ink',
        imageLabel: 'CONDITIONING · SAT',
      },
      {
        id: 'prod-p3-3',
        program_id: 'p3',
        name: 'Form Check Drop-in',
        description: 'One-on-one form review with a coach. Redeemable any weekday.',
        type: 'simple',
        status: 'active',
        created_at: '2024-02-15T09:00:00Z',
        lowestPrice: '€40',
        imageTone: 'accent',
        imageLabel: 'FORM CHECK',
      },
    ],
  },
  p4: {
    ...PROGRAMS[3],
    longDescription:
      'Sprint Lab is an invitation-only online HIIT program running live sessions via Zoom. Coach Priya leads 12 sessions a week across time zones — track intervals, timed circuits, and threshold work. Equipment-free options available for every session.',
    products: [
      {
        id: 'prod-p4-1',
        program_id: 'p4',
        name: 'Live HIIT Session',
        description: 'A 45-minute live session via Zoom. Join any of the 12 weekly slots.',
        type: 'session',
        status: 'active',
        created_at: '2023-11-25T12:00:00Z',
        capacity: 30,
        sessionsPerWeek: 12,
        lowestPrice: '$19',
        imageTone: 'accent',
        imageLabel: 'HIIT · LIVE',
      },
      {
        id: 'prod-p4-2',
        program_id: 'p4',
        name: 'Monthly Unlimited',
        description: 'Unlimited live sessions for 30 days. Auto-renew optional.',
        type: 'simple',
        status: 'active',
        created_at: '2023-11-25T12:00:00Z',
        lowestPrice: '$59',
        imageTone: 'accent',
        imageLabel: 'UNLIMITED · MONTH',
      },
    ],
  },
  p5: {
    ...PROGRAMS[4],
    longDescription:
      'Roundhouse runs technical Muay Thai out of a dedicated ring gym in East Austin. Classes cover stance, guard, kicks, clinch work, and pad rounds with rotating coaches. Competitive fighters train here alongside complete beginners — the gym culture makes it work.',
    products: [
      {
        id: 'prod-p5-1',
        program_id: 'p5',
        name: 'Technique Class',
        description: 'Fundamentals + pad work. Mon / Wed / Fri / Sat / Sun.',
        type: 'session',
        status: 'active',
        created_at: '2024-04-05T11:00:00Z',
        capacity: 16,
        sessionsPerWeek: 5,
        lowestPrice: '$32',
        imageTone: 'warm',
        imageLabel: 'TECHNIQUE · PADS',
      },
      {
        id: 'prod-p5-2',
        program_id: 'p5',
        name: 'Sparring (Advanced)',
        description: 'Light controlled sparring. Invite from coach required.',
        type: 'session',
        status: 'active',
        created_at: '2024-04-05T11:00:00Z',
        capacity: 8,
        sessionsPerWeek: 1,
        lowestPrice: '$20',
        imageTone: 'warm',
        imageLabel: 'SPARRING · ADV',
      },
      {
        id: 'prod-p5-3',
        program_id: 'p5',
        name: 'Gear Rental Pass',
        description: 'Borrow gloves and shin guards for a session. Redeemable at front desk.',
        type: 'simple',
        status: 'active',
        created_at: '2024-04-05T11:00:00Z',
        lowestPrice: '$5',
        imageTone: 'ink',
        imageLabel: 'GEAR · RENTAL',
      },
    ],
  },
  p6: {
    ...PROGRAMS[5],
    longDescription:
      'Sunrise Vinyasa is an intimate yoga program set in an open-air shala in Canggu. Sessions run at sunrise and dusk, capped at 12 students. The program runs year-round; accommodation is not included but the team can recommend nearby homestays.',
    products: [
      {
        id: 'prod-p6-1',
        program_id: 'p6',
        name: 'Sunrise Flow',
        description: '75-minute vinyasa at sunrise. Daily, 06:00 WITA.',
        type: 'session',
        status: 'active',
        created_at: '2024-05-10T06:00:00Z',
        capacity: 12,
        sessionsPerWeek: 4,
        lowestPrice: '$24',
        imageTone: 'cool',
        imageLabel: 'SUNRISE · FLOW',
      },
      {
        id: 'prod-p6-2',
        program_id: 'p6',
        name: 'Week Pass',
        description: '7-day unlimited access. Valid for any session during the week.',
        type: 'simple',
        status: 'active',
        created_at: '2024-05-10T06:00:00Z',
        lowestPrice: '$120',
        imageTone: 'cool',
        imageLabel: 'WEEK · PASS',
      },
    ],
  },
}
