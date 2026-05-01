// ─── ERD-aligned types ───────────────────────────────────────────────────────

export type PackageEntryMock = {
  // ERD: PACKAGE_ENTRY fields
  id: string
  package_id: string
  product_id: string
  quantity: number
  validity_rule: string   // display string, e.g. "60 days from purchase"

  // UI-only
  product_name: string
}

export type PackageMock = {
  // ERD: PURCHASE_PACKAGE fields
  id: string
  program_id: string
  name: string
  price: string           // display string, e.g. "$240"
  status: 'active' | 'archived'
  created_at: string      // ISO-8601

  // UI-only
  entries: PackageEntryMock[]
}

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
  capacity: number   // copied from product for display; avoids prop drilling
}

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
  sessions?: SessionInstanceMock[]   // session-type only; 3–5 entries
  validityDays?: number              // display in hero stats strip, e.g. 60
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p1-1-1',
            product_id: 'prod-p1-1',
            start_time: '2026-04-27T13:00:00Z',
            end_time: '2026-04-27T14:30:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Marcus',
            taken: 14,
            capacity: 14,
          },
          {
            id: 'sess-p1-1-2',
            product_id: 'prod-p1-1',
            start_time: '2026-04-30T13:00:00Z',
            end_time: '2026-04-30T14:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Marcus',
            taken: 8,
            capacity: 14,
          },
          {
            id: 'sess-p1-1-3',
            product_id: 'prod-p1-1',
            start_time: '2026-05-02T13:00:00Z',
            end_time: '2026-05-02T14:30:00Z',
            status: 'full',
            is_active: true,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Marcus',
            taken: 14,
            capacity: 14,
          },
          {
            id: 'sess-p1-1-4',
            product_id: 'prod-p1-1',
            start_time: '2026-05-07T13:00:00Z',
            end_time: '2026-05-07T14:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Marcus',
            taken: 3,
            capacity: 14,
          },
          {
            id: 'sess-p1-1-5',
            product_id: 'prod-p1-1',
            start_time: '2026-05-09T13:00:00Z',
            end_time: '2026-05-09T14:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Marcus',
            taken: 6,
            capacity: 14,
          },
        ],
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p1-2-1',
            product_id: 'prod-p1-2',
            start_time: '2026-04-25T00:00:00Z',
            end_time: '2026-04-25T01:30:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Ray',
            taken: 10,
            capacity: 10,
          },
          {
            id: 'sess-p1-2-2',
            product_id: 'prod-p1-2',
            start_time: '2026-05-02T00:00:00Z',
            end_time: '2026-05-02T01:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Ray',
            taken: 5,
            capacity: 10,
          },
          {
            id: 'sess-p1-2-3',
            product_id: 'prod-p1-2',
            start_time: '2026-05-09T00:00:00Z',
            end_time: '2026-05-09T01:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T10:00:00Z',
            coach: 'Coach Ray',
            taken: 2,
            capacity: 10,
          },
        ],
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
        validityDays: 45,
        sessions: [
          {
            id: 'sess-p2-1-1',
            product_id: 'prod-p2-1',
            start_time: '2026-04-27T08:00:00Z',
            end_time: '2026-04-27T09:00:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T08:00:00Z',
            coach: 'Ines',
            taken: 12,
            capacity: 12,
          },
          {
            id: 'sess-p2-1-2',
            product_id: 'prod-p2-1',
            start_time: '2026-04-30T08:00:00Z',
            end_time: '2026-04-30T09:00:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T08:00:00Z',
            coach: 'Ines',
            taken: 7,
            capacity: 12,
          },
          {
            id: 'sess-p2-1-3',
            product_id: 'prod-p2-1',
            start_time: '2026-05-03T08:00:00Z',
            end_time: '2026-05-03T09:00:00Z',
            status: 'full',
            is_active: true,
            created_at: '2026-04-01T08:00:00Z',
            coach: 'Ines',
            taken: 12,
            capacity: 12,
          },
          {
            id: 'sess-p2-1-4',
            product_id: 'prod-p2-1',
            start_time: '2026-05-05T08:00:00Z',
            end_time: '2026-05-05T09:00:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T08:00:00Z',
            coach: 'Ines',
            taken: 4,
            capacity: 12,
          },
        ],
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p3-1-1',
            product_id: 'prod-p3-1',
            start_time: '2026-04-27T17:00:00Z',
            end_time: '2026-04-27T18:30:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Stefan',
            taken: 18,
            capacity: 18,
          },
          {
            id: 'sess-p3-1-2',
            product_id: 'prod-p3-1',
            start_time: '2026-04-29T17:00:00Z',
            end_time: '2026-04-29T18:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Stefan',
            taken: 11,
            capacity: 18,
          },
          {
            id: 'sess-p3-1-3',
            product_id: 'prod-p3-1',
            start_time: '2026-05-04T05:00:00Z',
            end_time: '2026-05-04T06:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Lisa',
            taken: 6,
            capacity: 18,
          },
          {
            id: 'sess-p3-1-4',
            product_id: 'prod-p3-1',
            start_time: '2026-05-06T17:00:00Z',
            end_time: '2026-05-06T18:30:00Z',
            status: 'full',
            is_active: true,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Stefan',
            taken: 18,
            capacity: 18,
          },
        ],
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p3-2-1',
            product_id: 'prod-p3-2',
            start_time: '2026-04-25T08:00:00Z',
            end_time: '2026-04-25T08:45:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Lisa',
            taken: 17,
            capacity: 20,
          },
          {
            id: 'sess-p3-2-2',
            product_id: 'prod-p3-2',
            start_time: '2026-05-02T08:00:00Z',
            end_time: '2026-05-02T08:45:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Lisa',
            taken: 9,
            capacity: 20,
          },
          {
            id: 'sess-p3-2-3',
            product_id: 'prod-p3-2',
            start_time: '2026-05-09T08:00:00Z',
            end_time: '2026-05-09T08:45:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T09:00:00Z',
            coach: 'Coach Lisa',
            taken: 4,
            capacity: 20,
          },
        ],
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
        validityDays: 30,
        sessions: [
          {
            id: 'sess-p4-1-1',
            product_id: 'prod-p4-1',
            start_time: '2026-04-27T14:00:00Z',
            end_time: '2026-04-27T14:45:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T12:00:00Z',
            coach: 'Coach Priya',
            taken: 28,
            capacity: 30,
          },
          {
            id: 'sess-p4-1-2',
            product_id: 'prod-p4-1',
            start_time: '2026-04-30T14:00:00Z',
            end_time: '2026-04-30T14:45:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T12:00:00Z',
            coach: 'Coach Priya',
            taken: 14,
            capacity: 30,
          },
          {
            id: 'sess-p4-1-3',
            product_id: 'prod-p4-1',
            start_time: '2026-05-01T06:00:00Z',
            end_time: '2026-05-01T06:45:00Z',
            status: 'full',
            is_active: true,
            created_at: '2026-04-01T12:00:00Z',
            coach: 'Coach Priya',
            taken: 30,
            capacity: 30,
          },
          {
            id: 'sess-p4-1-4',
            product_id: 'prod-p4-1',
            start_time: '2026-05-04T14:00:00Z',
            end_time: '2026-05-04T14:45:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T12:00:00Z',
            coach: 'Coach Priya',
            taken: 19,
            capacity: 30,
          },
        ],
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p5-1-1',
            product_id: 'prod-p5-1',
            start_time: '2026-04-27T17:00:00Z',
            end_time: '2026-04-27T18:30:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 16,
            capacity: 16,
          },
          {
            id: 'sess-p5-1-2',
            product_id: 'prod-p5-1',
            start_time: '2026-04-29T17:00:00Z',
            end_time: '2026-04-29T18:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 9,
            capacity: 16,
          },
          {
            id: 'sess-p5-1-3',
            product_id: 'prod-p5-1',
            start_time: '2026-05-01T17:00:00Z',
            end_time: '2026-05-01T18:30:00Z',
            status: 'full',
            is_active: true,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 16,
            capacity: 16,
          },
          {
            id: 'sess-p5-1-4',
            product_id: 'prod-p5-1',
            start_time: '2026-05-04T17:00:00Z',
            end_time: '2026-05-04T18:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 5,
            capacity: 16,
          },
        ],
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p5-2-1',
            product_id: 'prod-p5-2',
            start_time: '2026-04-26T17:00:00Z',
            end_time: '2026-04-26T18:30:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 8,
            capacity: 8,
          },
          {
            id: 'sess-p5-2-2',
            product_id: 'prod-p5-2',
            start_time: '2026-05-03T17:00:00Z',
            end_time: '2026-05-03T18:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 4,
            capacity: 8,
          },
          {
            id: 'sess-p5-2-3',
            product_id: 'prod-p5-2',
            start_time: '2026-05-10T17:00:00Z',
            end_time: '2026-05-10T18:30:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T11:00:00Z',
            coach: 'Coach Dani',
            taken: 1,
            capacity: 8,
          },
        ],
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
        validityDays: 60,
        sessions: [
          {
            id: 'sess-p6-1-1',
            product_id: 'prod-p6-1',
            start_time: '2026-04-27T22:00:00Z',
            end_time: '2026-04-27T23:15:00Z',
            status: 'past',
            is_active: false,
            created_at: '2026-04-01T06:00:00Z',
            coach: 'Made Ayu',
            taken: 12,
            capacity: 12,
          },
          {
            id: 'sess-p6-1-2',
            product_id: 'prod-p6-1',
            start_time: '2026-04-29T22:00:00Z',
            end_time: '2026-04-29T23:15:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T06:00:00Z',
            coach: 'Made Ayu',
            taken: 8,
            capacity: 12,
          },
          {
            id: 'sess-p6-1-3',
            product_id: 'prod-p6-1',
            start_time: '2026-05-01T22:00:00Z',
            end_time: '2026-05-01T23:15:00Z',
            status: 'full',
            is_active: true,
            created_at: '2026-04-01T06:00:00Z',
            coach: 'Made Ayu',
            taken: 12,
            capacity: 12,
          },
          {
            id: 'sess-p6-1-4',
            product_id: 'prod-p6-1',
            start_time: '2026-05-04T22:00:00Z',
            end_time: '2026-05-04T23:15:00Z',
            status: 'open',
            is_active: true,
            created_at: '2026-04-01T06:00:00Z',
            coach: 'Made Ayu',
            taken: 5,
            capacity: 12,
          },
        ],
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

// ─── Purchase packages mock data ──────────────────────────────────────────────

const UNLIMITED_QUANTITY = 999 // sentinel for "unlimited"; rendered as "∞" in UI

export const PACKAGES: PackageMock[] = [
  // ── p1: Eastside Boxing Club ─────────────────────────────────────────────
  {
    id: 'pkg-p1-1',
    program_id: 'p1',
    name: '10-Class Pass',
    price: '$240',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    entries: [
      {
        id: 'entry-p1-1-1',
        package_id: 'pkg-p1-1',
        product_id: 'prod-p1-1',
        quantity: 10,
        validity_rule: '60 days from purchase',
        product_name: 'Saturday Bag Work',
      },
      {
        id: 'entry-p1-1-2',
        package_id: 'pkg-p1-1',
        product_id: 'prod-p1-2',
        quantity: 5,
        validity_rule: '60 days from purchase',
        product_name: 'Friday Pad Rounds',
      },
    ],
  },
  {
    id: 'pkg-p1-2',
    program_id: 'p1',
    name: 'Drop-In Single',
    price: '$28',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    entries: [
      {
        id: 'entry-p1-2-1',
        package_id: 'pkg-p1-2',
        product_id: 'prod-p1-1',
        quantity: 1,
        validity_rule: '60 days from purchase',
        product_name: 'Saturday Bag Work',
      },
    ],
  },
  {
    id: 'pkg-p1-3',
    program_id: 'p1',
    name: 'Monthly Unlimited',
    price: '$99',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    entries: [
      {
        id: 'entry-p1-3-1',
        package_id: 'pkg-p1-3',
        product_id: 'prod-p1-1',
        quantity: UNLIMITED_QUANTITY,
        validity_rule: '30 days from purchase',
        product_name: 'Saturday Bag Work',
      },
      {
        id: 'entry-p1-3-2',
        package_id: 'pkg-p1-3',
        product_id: 'prod-p1-2',
        quantity: UNLIMITED_QUANTITY,
        validity_rule: '30 days from purchase',
        product_name: 'Friday Pad Rounds',
      },
    ],
  },

  // ── p2: Slow Flow with Ines ───────────────────────────────────────────────
  {
    id: 'pkg-p2-1',
    program_id: 'p2',
    name: '5-Class Pass',
    price: '€95',
    status: 'active',
    created_at: '2024-03-05T08:00:00Z',
    entries: [
      {
        id: 'entry-p2-1-1',
        package_id: 'pkg-p2-1',
        product_id: 'prod-p2-1',
        quantity: 5,
        validity_rule: '45 days from purchase',
        product_name: 'Morning Vinyasa',
      },
    ],
  },
  {
    id: 'pkg-p2-2',
    program_id: 'p2',
    name: 'Single Drop-In',
    price: '€22',
    status: 'active',
    created_at: '2024-03-05T08:00:00Z',
    entries: [
      {
        id: 'entry-p2-2-1',
        package_id: 'pkg-p2-2',
        product_id: 'prod-p2-1',
        quantity: 1,
        validity_rule: '30 days from purchase',
        product_name: 'Morning Vinyasa',
      },
    ],
  },
  {
    id: 'pkg-p2-3',
    program_id: 'p2',
    name: 'Monthly Unlimited',
    price: '€75',
    status: 'active',
    created_at: '2024-03-05T08:00:00Z',
    entries: [
      {
        id: 'entry-p2-3-1',
        package_id: 'pkg-p2-3',
        product_id: 'prod-p2-1',
        quantity: UNLIMITED_QUANTITY,
        validity_rule: '30 days from purchase',
        product_name: 'Morning Vinyasa',
      },
    ],
  },

  // ── p3: Strong Together ───────────────────────────────────────────────────
  {
    id: 'pkg-p3-1',
    program_id: 'p3',
    name: '12-Week Program',
    price: '€299',
    status: 'active',
    created_at: '2024-02-15T09:00:00Z',
    entries: [
      {
        id: 'entry-p3-1-1',
        package_id: 'pkg-p3-1',
        product_id: 'prod-p3-1',
        quantity: 36,
        validity_rule: '84 days from purchase',
        product_name: 'Barbell Fundamentals',
      },
      {
        id: 'entry-p3-1-2',
        package_id: 'pkg-p3-1',
        product_id: 'prod-p3-2',
        quantity: 12,
        validity_rule: '84 days from purchase',
        product_name: 'Saturday Conditioning',
      },
    ],
  },
  {
    id: 'pkg-p3-2',
    program_id: 'p3',
    name: 'Drop-In Session',
    price: '€34',
    status: 'active',
    created_at: '2024-02-15T09:00:00Z',
    entries: [
      {
        id: 'entry-p3-2-1',
        package_id: 'pkg-p3-2',
        product_id: 'prod-p3-1',
        quantity: 1,
        validity_rule: '60 days from purchase',
        product_name: 'Barbell Fundamentals',
      },
    ],
  },
  {
    id: 'pkg-p3-3',
    program_id: 'p3',
    name: 'Conditioning Add-On (4×)',
    price: '€64',
    status: 'active',
    created_at: '2024-02-15T09:00:00Z',
    entries: [
      {
        id: 'entry-p3-3-1',
        package_id: 'pkg-p3-3',
        product_id: 'prod-p3-2',
        quantity: 4,
        validity_rule: '60 days from purchase',
        product_name: 'Saturday Conditioning',
      },
    ],
  },

  // ── p4: Sprint Lab ────────────────────────────────────────────────────────
  {
    id: 'pkg-p4-1',
    program_id: 'p4',
    name: 'Monthly Unlimited',
    price: '$59',
    status: 'active',
    created_at: '2023-11-25T12:00:00Z',
    entries: [
      {
        id: 'entry-p4-1-1',
        package_id: 'pkg-p4-1',
        product_id: 'prod-p4-1',
        quantity: UNLIMITED_QUANTITY,
        validity_rule: '30 days from purchase',
        product_name: 'Live HIIT Session',
      },
    ],
  },
  {
    id: 'pkg-p4-2',
    program_id: 'p4',
    name: '10-Session Pack',
    price: '$175',
    status: 'active',
    created_at: '2023-11-25T12:00:00Z',
    entries: [
      {
        id: 'entry-p4-2-1',
        package_id: 'pkg-p4-2',
        product_id: 'prod-p4-1',
        quantity: 10,
        validity_rule: '60 days from purchase',
        product_name: 'Live HIIT Session',
      },
    ],
  },
  {
    id: 'pkg-p4-3',
    program_id: 'p4',
    name: 'Single Session',
    price: '$19',
    status: 'active',
    created_at: '2023-11-25T12:00:00Z',
    entries: [
      {
        id: 'entry-p4-3-1',
        package_id: 'pkg-p4-3',
        product_id: 'prod-p4-1',
        quantity: 1,
        validity_rule: '30 days from purchase',
        product_name: 'Live HIIT Session',
      },
    ],
  },

  // ── p5: Roundhouse Muay Thai ──────────────────────────────────────────────
  {
    id: 'pkg-p5-1',
    program_id: 'p5',
    name: '10-Class Pass',
    price: '$295',
    status: 'active',
    created_at: '2024-04-05T11:00:00Z',
    entries: [
      {
        id: 'entry-p5-1-1',
        package_id: 'pkg-p5-1',
        product_id: 'prod-p5-1',
        quantity: 10,
        validity_rule: '60 days from purchase',
        product_name: 'Technique Class',
      },
    ],
  },
  {
    id: 'pkg-p5-2',
    program_id: 'p5',
    name: 'Monthly Unlimited',
    price: '$119',
    status: 'active',
    created_at: '2024-04-05T11:00:00Z',
    entries: [
      {
        id: 'entry-p5-2-1',
        package_id: 'pkg-p5-2',
        product_id: 'prod-p5-1',
        quantity: UNLIMITED_QUANTITY,
        validity_rule: '30 days from purchase',
        product_name: 'Technique Class',
      },
      {
        id: 'entry-p5-2-2',
        package_id: 'pkg-p5-2',
        product_id: 'prod-p5-2',
        quantity: 4,
        validity_rule: '30 days from purchase',
        product_name: 'Sparring (Advanced)',
      },
    ],
  },
  {
    id: 'pkg-p5-3',
    program_id: 'p5',
    name: 'Drop-In + Gear Rental',
    price: '$37',
    status: 'active',
    created_at: '2024-04-05T11:00:00Z',
    entries: [
      {
        id: 'entry-p5-3-1',
        package_id: 'pkg-p5-3',
        product_id: 'prod-p5-1',
        quantity: 1,
        validity_rule: '60 days from purchase',
        product_name: 'Technique Class',
      },
      {
        id: 'entry-p5-3-2',
        package_id: 'pkg-p5-3',
        product_id: 'prod-p5-3',
        quantity: 1,
        validity_rule: '60 days from purchase',
        product_name: 'Gear Rental Pass',
      },
    ],
  },

  // ── p6: Sunrise Vinyasa ───────────────────────────────────────────────────
  {
    id: 'pkg-p6-1',
    program_id: 'p6',
    name: 'Week Pass',
    price: '$120',
    status: 'active',
    created_at: '2024-05-10T06:00:00Z',
    entries: [
      {
        id: 'entry-p6-1-1',
        package_id: 'pkg-p6-1',
        product_id: 'prod-p6-1',
        quantity: UNLIMITED_QUANTITY,
        validity_rule: '7 days from purchase',
        product_name: 'Sunrise Flow',
      },
    ],
  },
  {
    id: 'pkg-p6-2',
    program_id: 'p6',
    name: '5-Session Pack',
    price: '$110',
    status: 'active',
    created_at: '2024-05-10T06:00:00Z',
    entries: [
      {
        id: 'entry-p6-2-1',
        package_id: 'pkg-p6-2',
        product_id: 'prod-p6-1',
        quantity: 5,
        validity_rule: '60 days from purchase',
        product_name: 'Sunrise Flow',
      },
    ],
  },
  {
    id: 'pkg-p6-3',
    program_id: 'p6',
    name: 'Single Session',
    price: '$24',
    status: 'active',
    created_at: '2024-05-10T06:00:00Z',
    entries: [
      {
        id: 'entry-p6-3-1',
        package_id: 'pkg-p6-3',
        product_id: 'prod-p6-1',
        quantity: 1,
        validity_rule: '60 days from purchase',
        product_name: 'Sunrise Flow',
      },
    ],
  },
]

// ─── Checkout & purchase flow mocks ──────────────────────────────────────────

export const SERVICE_FEE_CONFIG = {
  percentage: 0.05,   // 5%
  minimum: 3.00,      // $3.00 minimum
}

export function parsePriceAmount(price: string): number {
  const match = price.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

// mirrors ERD PURCHASE table
export type CheckoutPurchaseMock = {
  id: string
  program_member_id: string
  created_at: string        // ISO-8601
  total_amount: string      // display string
  status: 'paid' | 'failed'
}

// mirrors ERD VOUCHER table fields relevant to issuance
export type IssuedVoucherMock = {
  id: string
  product_id: string
  product_name: string      // UI-only
  source: 'purchase'
  status: 'active'
  expired_at: string        // ISO-8601
  quantity: number          // UI-only: how many issued
  validity_rule: string     // UI-only: display string
}

// ─── Wallet mock data ────────────────────────────────────────────────────────

export type VoucherMock = {
  // ERD: VOUCHER fields
  id: string
  program_member_id: string
  product_id: string
  purchase_id: string | null    // null for compensation / giveaway
  issued_by: string | null      // null for purchase-issued vouchers
  source: 'purchase' | 'compensation' | 'giveaway'
  status: 'active' | 'claimed' | 'expired' | 'refunded'
  expired_at: string            // ISO-8601

  // UI-only
  product_name: string
  program_id: string
  program_name: string
}

// Covers all 4 statuses and all 3 sources across 3 products.
// Saturday Bag Work (p1): active x3, claimed x1, expired x2
// Morning Vinyasa (p2): active x1 purchase, active x1 compensation
// Barbell Fundamentals (p3): refunded x1 giveaway
export const VOUCHERS: VoucherMock[] = [
  {
    id: 'v1',
    program_member_id: 'pm-1',
    product_id: 'prod-p1-1',
    purchase_id: 'pur-1',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-06-03T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v2',
    program_member_id: 'pm-1',
    product_id: 'prod-p1-1',
    purchase_id: 'pur-1',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-06-05T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v3',
    program_member_id: 'pm-1',
    product_id: 'prod-p1-1',
    purchase_id: 'pur-1',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-06-15T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v4',
    program_member_id: 'pm-1',
    product_id: 'prod-p1-1',
    purchase_id: 'pur-1',
    issued_by: null,
    source: 'purchase',
    status: 'claimed',
    expired_at: '2026-06-07T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v5',
    program_member_id: 'pm-1',
    product_id: 'prod-p1-1',
    purchase_id: 'pur-2',
    issued_by: null,
    source: 'purchase',
    status: 'expired',
    expired_at: '2026-03-01T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v6',
    program_member_id: 'pm-1',
    product_id: 'prod-p1-1',
    purchase_id: 'pur-2',
    issued_by: null,
    source: 'purchase',
    status: 'expired',
    expired_at: '2026-03-15T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v8',
    program_member_id: 'pm-1',
    product_id: 'prod-p2-1',
    purchase_id: 'pur-3',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-05-20T00:00:00Z',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
  },
  {
    id: 'v9',
    program_member_id: 'pm-1',
    product_id: 'prod-p2-1',
    purchase_id: null,
    issued_by: 'admin-1',
    source: 'compensation',
    status: 'active',
    expired_at: '2026-05-25T00:00:00Z',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
  },
  {
    id: 'v10',
    program_member_id: 'pm-1',
    product_id: 'prod-p3-1',
    purchase_id: null,
    issued_by: 'admin-2',
    source: 'giveaway',
    status: 'refunded',
    expired_at: '2026-07-01T00:00:00Z',
    product_name: 'Barbell Fundamentals',
    program_id: 'p3',
    program_name: 'Strong Together',
  },
]

// ─── Session instances (full schedule, keyed by product_id) ───────────────────
// Used by SessionsPage. Covers all four status values.
// Sorted by start_time ascending. TODAY = 2026-04-30T00:00:00Z.
// Booking window = 14 days → OOW after 2026-05-14.

export const SESSION_INSTANCES: Record<string, SessionInstanceMock[]> = {
  'prod-p1-1': [
    // Past
    {
      id: 'si-p1-1-past-1',
      product_id: 'prod-p1-1',
      start_time: '2026-04-23T13:00:00Z',
      end_time:   '2026-04-23T14:30:00Z',
      status: 'past',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 14,
      capacity: 14,
    },
    {
      id: 'si-p1-1-past-2',
      product_id: 'prod-p1-1',
      start_time: '2026-04-28T13:00:00Z',
      end_time:   '2026-04-28T14:30:00Z',
      status: 'past',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 10,
      capacity: 14,
    },
    // Open (within booking window)
    {
      id: 'si-p1-1-1',
      product_id: 'prod-p1-1',
      start_time: '2026-05-02T13:00:00Z',
      end_time:   '2026-05-02T14:30:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 5,
      capacity: 14,
    },
    // Full (within booking window)
    {
      id: 'si-p1-1-2',
      product_id: 'prod-p1-1',
      start_time: '2026-05-05T13:00:00Z',
      end_time:   '2026-05-05T14:30:00Z',
      status: 'full',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 14,
      capacity: 14,
    },
    // Open (within booking window)
    {
      id: 'si-p1-1-3',
      product_id: 'prod-p1-1',
      start_time: '2026-05-09T13:00:00Z',
      end_time:   '2026-05-09T14:30:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 11,
      capacity: 14,
    },
    // Open (within booking window)
    {
      id: 'si-p1-1-4',
      product_id: 'prod-p1-1',
      start_time: '2026-05-12T13:00:00Z',
      end_time:   '2026-05-12T14:30:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 3,
      capacity: 14,
    },
    // Out-of-window (beyond 14-day booking window)
    {
      id: 'si-p1-1-5',
      product_id: 'prod-p1-1',
      start_time: '2026-05-16T13:00:00Z',
      end_time:   '2026-05-16T14:30:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 0,
      capacity: 14,
    },
    {
      id: 'si-p1-1-6',
      product_id: 'prod-p1-1',
      start_time: '2026-05-19T13:00:00Z',
      end_time:   '2026-05-19T14:30:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 0,
      capacity: 14,
    },
    {
      id: 'si-p1-1-7',
      product_id: 'prod-p1-1',
      start_time: '2026-05-23T13:00:00Z',
      end_time:   '2026-05-23T14:30:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 0,
      capacity: 14,
    },
  ],
  'prod-p2-1': [
    {
      id: 'si-p2-1-1',
      product_id: 'prod-p2-1',
      start_time: '2026-05-05T07:00:00Z',
      end_time:   '2026-05-05T08:00:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 4,
      capacity: 12,
    },
    {
      id: 'si-p2-1-2',
      product_id: 'prod-p2-1',
      start_time: '2026-05-07T07:00:00Z',
      end_time:   '2026-05-07T08:00:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 9,
      capacity: 12,
    },
    {
      id: 'si-p2-1-3',
      product_id: 'prod-p2-1',
      start_time: '2026-05-12T07:00:00Z',
      end_time:   '2026-05-12T08:00:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 2,
      capacity: 12,
    },
    {
      id: 'si-p2-1-4',
      product_id: 'prod-p2-1',
      start_time: '2026-05-17T07:00:00Z',
      end_time:   '2026-05-17T08:00:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 0,
      capacity: 12,
    },
    {
      id: 'si-p2-1-5',
      product_id: 'prod-p2-1',
      start_time: '2026-05-19T07:00:00Z',
      end_time:   '2026-05-19T08:00:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 0,
      capacity: 12,
    },
  ],
}

// ─── Bookings mock data ──────────────────────────────────────────────────────

export type CustomFieldAnswerMock = {
  // ERD: CUSTOM_FIELD_ANSWER fields
  id: string
  claim_id: string
  value: string

  // UI-only
  field_name: string
  field_required: boolean
}

export type VoucherClaimMock = {
  // ERD: VOUCHER_CLAIM fields
  id: string
  voucher_id: string
  session_id: string
  claimed_at: string            // ISO-8601
  alias: string | null
  attendance_status: 'pending' | 'attended' | 'no-show'
  grievance_status: 'none' | 'pending' | 'resolved'
  cancelled_at: string | null   // ISO-8601

  // UI-only
  product_id: string
  product_name: string
  program_id: string
  program_name: string
  session_start_time: string    // ISO-8601
  session_end_time: string      // ISO-8601
  coach: string
  session_capacity: number
  session_taken: number
  custom_field_answers: CustomFieldAnswerMock[]
  compensation_voucher_expires_at: string | null
}

// TODAY = 2026-04-30. Sessions dated after 2026-04-30 are upcoming (active).
export const BOOKINGS: VoucherClaimMock[] = [
  // Active 1 — Saturday Bag Work, future session, no custom fields
  {
    id: 'bc-1',
    voucher_id: 'v1',
    session_id: 'si-p1-1-1',
    claimed_at: '2026-04-28T10:00:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p1-1',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
    session_start_time: '2026-05-02T13:00:00Z',
    session_end_time: '2026-05-02T14:30:00Z',
    coach: 'Coach Marcus',
    session_capacity: 14,
    session_taken: 5,
    custom_field_answers: [],
    compensation_voucher_expires_at: null,
  },
  // Active 2 — Morning Vinyasa, future session, with a custom field answer
  {
    id: 'bc-2',
    voucher_id: 'v8',
    session_id: 'si-p2-1-1',
    claimed_at: '2026-04-29T08:30:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    session_start_time: '2026-05-05T07:00:00Z',
    session_end_time: '2026-05-05T08:00:00Z',
    coach: 'Ines',
    session_capacity: 12,
    session_taken: 4,
    custom_field_answers: [
      {
        id: 'cfa-1',
        claim_id: 'bc-2',
        value: 'No injuries',
        field_name: 'Any injuries we should know about?',
        field_required: false,
      },
    ],
    compensation_voucher_expires_at: null,
  },
  // Active 3 — Barbell Fundamentals, future session, no custom fields
  {
    id: 'bc-3',
    voucher_id: 'v3',
    session_id: 'si-p3-1-2',
    claimed_at: '2026-04-28T15:00:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p3-1',
    product_name: 'Barbell Fundamentals',
    program_id: 'p3',
    program_name: 'Strong Together',
    session_start_time: '2026-05-07T17:00:00Z',
    session_end_time: '2026-05-07T18:30:00Z',
    coach: 'Coach Stefan',
    session_capacity: 18,
    session_taken: 11,
    custom_field_answers: [],
    compensation_voucher_expires_at: null,
  },
  // Past — completed (attended, session already passed)
  {
    id: 'bc-4',
    voucher_id: 'v4',
    session_id: 'si-p1-1-past-1',
    claimed_at: '2026-04-20T10:00:00Z',
    alias: null,
    attendance_status: 'attended',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p1-1',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
    session_start_time: '2026-04-23T13:00:00Z',
    session_end_time: '2026-04-23T14:30:00Z',
    coach: 'Coach Marcus',
    session_capacity: 14,
    session_taken: 14,
    custom_field_answers: [],
    compensation_voucher_expires_at: null,
  },
  // Past — cancelled, with compensation voucher
  {
    id: 'bc-5',
    voucher_id: 'v9',
    session_id: 'si-p2-1-past',
    claimed_at: '2026-04-15T08:00:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: '2026-04-17T10:00:00Z',
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    session_start_time: '2026-04-20T07:00:00Z',
    session_end_time: '2026-04-20T08:00:00Z',
    coach: 'Ines',
    session_capacity: 12,
    session_taken: 7,
    custom_field_answers: [],
    compensation_voucher_expires_at: '2026-06-17T00:00:00Z',
  },
]

// Notification mock data

export type NotificationMock = {
  // ERD-inferred NOTIFICATION fields from product spec
  id: string
  program_member_id: string
  event_type:
    | 'booking_confirmed'
    | 'voucher_expiring'
    | 'session_cancelled'
    | 'compensation_issued'
    | 'purchase_confirmed'
    | 'approval_decision'
  title: string
  body: string
  target_type: 'session' | 'voucher' | 'booking' | 'purchase' | 'program'
  target_id: string
  created_at: string
  read_at: string | null

  // UI-only
  program_id: string
  program_name: string
  product_id?: string
  product_name?: string
  href: string
  reason?: string
}

export const NOTIFICATIONS: NotificationMock[] = [
  {
    id: 'notif-1',
    program_member_id: 'pm-1',
    event_type: 'session_cancelled',
    title: 'Saturday Bag Work was cancelled',
    body: 'Coach Marcus cancelled the May 2 session. A compensation voucher has been issued.',
    target_type: 'booking',
    target_id: 'bc-1',
    created_at: '2026-04-30T13:10:00Z',
    read_at: null,
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
    product_id: 'prod-p1-1',
    product_name: 'Saturday Bag Work',
    href: '/my/bookings',
    reason: 'Coach is unavailable',
  },
  {
    id: 'notif-2',
    program_member_id: 'pm-1',
    event_type: 'booking_confirmed',
    title: 'Booking confirmed',
    body: 'You are booked for Morning Vinyasa on Tuesday, 5 May.',
    target_type: 'session',
    target_id: 'si-p2-1-1',
    created_at: '2026-04-29T08:35:00Z',
    read_at: null,
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    href: '/programs/p2/products/prod-p2-1/sessions',
  },
  {
    id: 'notif-3',
    program_member_id: 'pm-1',
    event_type: 'voucher_expiring',
    title: 'Voucher expires soon',
    body: 'Your Morning Vinyasa voucher expires tomorrow.',
    target_type: 'voucher',
    target_id: 'v8',
    created_at: '2026-04-29T06:00:00Z',
    read_at: null,
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    href: '/wallet',
  },
  {
    id: 'notif-4',
    program_member_id: 'pm-1',
    event_type: 'compensation_issued',
    title: 'Compensation voucher issued',
    body: 'A replacement voucher is now available in your wallet.',
    target_type: 'voucher',
    target_id: 'v9',
    created_at: '2026-04-27T10:30:00Z',
    read_at: '2026-04-27T12:00:00Z',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    href: '/wallet',
  },
  {
    id: 'notif-5',
    program_member_id: 'pm-1',
    event_type: 'purchase_confirmed',
    title: 'Purchase confirmed',
    body: 'Your 10-Class Pass purchase is paid and vouchers are ready.',
    target_type: 'purchase',
    target_id: 'pur-1',
    created_at: '2026-04-24T16:20:00Z',
    read_at: '2026-04-24T17:45:00Z',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
    product_id: 'prod-p1-1',
    product_name: 'Saturday Bag Work',
    href: '/wallet',
  },
  {
    id: 'notif-6',
    program_member_id: 'pm-1',
    event_type: 'approval_decision',
    title: 'Join request approved',
    body: 'You can now book sessions with Slow Flow with Ines.',
    target_type: 'program',
    target_id: 'p2',
    created_at: '2026-04-20T09:00:00Z',
    read_at: '2026-04-20T09:10:00Z',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    href: '/programs/p2',
  },
]

// ─── Admin Dashboard ────────────────────────────────────────────────────────

export type AdminDashboardMock = {
  // ERD: PROGRAM fields
  program_id: string
  program_name: string

  // Stat card data
  revenue_this_month: number        // cents
  revenue_last_month: number        // cents
  revenue_trend: number[]           // monthly values, cents, oldest → newest
  active_member_count: number
  member_trend: number[]            // monthly values, counts, oldest → newest
  sessions_this_week: number
  sessions_by_day: number[]         // 7 values, Mon–Sun
  pending_join_requests: number
  pending_booking_requests: number

  // Revenue chart
  monthly_revenue: { month: string; amount: number }[]  // up to 12 months, cents

  // Attendance chart
  attendance_this_week: {
    product_id: string
    product_name: string
    taken: number
    capacity: number
  }[]

  // Voucher status chart — ERD: VOUCHER.status values
  voucher_status_counts: {
    claimed: number
    active: number
    expired: number
    refunded: number
  }

  // Nav tile subtitles
  active_product_count: number
  archived_product_count: number
  active_package_count: number
}

export const ADMIN_DASHBOARD: AdminDashboardMock = {
  program_id: 'p1',
  program_name: 'Eastside Boxing Club',
  revenue_this_month: 1248000,
  revenue_last_month: 1050000,
  revenue_trend: [420000, 520000, 610000, 520000, 650000, 800000, 880000, 1050000, 1248000],
  active_member_count: 84,
  member_trend: [52, 58, 63, 67, 71, 75, 78, 81, 84],
  sessions_this_week: 9,
  sessions_by_day: [0, 2, 2, 3, 0, 1, 1],
  pending_join_requests: 4,
  pending_booking_requests: 2,
  monthly_revenue: [
    { month: 'Dec', amount: 520000 },
    { month: 'Jan', amount: 650000 },
    { month: 'Feb', amount: 800000 },
    { month: 'Mar', amount: 880000 },
    { month: 'Apr', amount: 1050000 },
    { month: 'May', amount: 1248000 },
  ],
  attendance_this_week: [
    { product_id: 'prod-1', product_name: 'Boxing Fundamentals', taken: 14, capacity: 16 },
    { product_id: 'prod-2', product_name: 'Advanced Sparring',   taken: 8,  capacity: 12 },
    { product_id: 'prod-3', product_name: 'Bag Work Circuit',    taken: 10, capacity: 10 },
  ],
  voucher_status_counts: { claimed: 384, active: 224, expired: 112, refunded: 80 },
  active_product_count: 5,
  archived_product_count: 1,
  active_package_count: 3,
}
