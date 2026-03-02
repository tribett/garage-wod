import type { WodType } from '@/types/program'

export interface BenchmarkWod {
  name: string
  type: WodType
  description: string
  category: 'girl' | 'hero' | 'classic' | 'open'
}

/**
 * Classic CrossFit benchmark workouts.
 * Movements are written in the standard shorthand used on crossfit.com.
 */
export const BENCHMARK_WODS: BenchmarkWod[] = [
  // ── The Girls ──────────────────────────────────────────────
  {
    name: 'Fran',
    type: 'forTime',
    category: 'girl',
    description: '21-15-9\nThrusters (95/65)\nPull-ups',
  },
  {
    name: 'Grace',
    type: 'forTime',
    category: 'girl',
    description: '30 Clean & Jerks (135/95)',
  },
  {
    name: 'Helen',
    type: 'forTime',
    category: 'girl',
    description: '3 rounds:\n400m Run\n21 KB Swings (53/35)\n12 Pull-ups',
  },
  {
    name: 'Diane',
    type: 'forTime',
    category: 'girl',
    description: '21-15-9\nDeadlifts (225/155)\nHandstand Push-ups',
  },
  {
    name: 'Elizabeth',
    type: 'forTime',
    category: 'girl',
    description: '21-15-9\nCleans (135/95)\nRing Dips',
  },
  {
    name: 'Isabel',
    type: 'forTime',
    category: 'girl',
    description: '30 Snatches (135/95)',
  },
  {
    name: 'Jackie',
    type: 'forTime',
    category: 'girl',
    description: '1000m Row\n50 Thrusters (45/35)\n30 Pull-ups',
  },
  {
    name: 'Karen',
    type: 'forTime',
    category: 'girl',
    description: '150 Wall Balls (20/14)',
  },
  {
    name: 'Annie',
    type: 'forTime',
    category: 'girl',
    description: '50-40-30-20-10\nDouble-unders\nSit-ups',
  },
  {
    name: 'Nancy',
    type: 'forTime',
    category: 'girl',
    description: '5 rounds:\n400m Run\n15 Overhead Squats (95/65)',
  },
  {
    name: 'Cindy',
    type: 'amrap',
    category: 'girl',
    description: '20 min AMRAP:\n5 Pull-ups\n10 Push-ups\n15 Air Squats',
  },
  {
    name: 'Mary',
    type: 'amrap',
    category: 'girl',
    description: '20 min AMRAP:\n5 Handstand Push-ups\n10 Pistols (alternating)\n15 Pull-ups',
  },
  {
    name: 'Chelsea',
    type: 'emom',
    category: 'girl',
    description: 'EMOM 30:\n5 Pull-ups\n10 Push-ups\n15 Air Squats',
  },
  {
    name: 'Amanda',
    type: 'forTime',
    category: 'girl',
    description: '9-7-5\nMuscle-ups\nSnatches (135/95)',
  },
  {
    name: 'Linda',
    type: 'forTime',
    category: 'girl',
    description: '10-9-8-7-6-5-4-3-2-1\nDeadlifts (1.5x BW)\nBench Press (BW)\nCleans (0.75x BW)',
  },

  // ── Hero WODs ──────────────────────────────────────────────
  {
    name: 'Murph',
    type: 'forTime',
    category: 'hero',
    description: '1 mile Run\n100 Pull-ups\n200 Push-ups\n300 Air Squats\n1 mile Run\n(20 lb vest)',
  },
  {
    name: 'DT',
    type: 'forTime',
    category: 'hero',
    description: '5 rounds:\n12 Deadlifts (155/105)\n9 Hang Power Cleans (155/105)\n6 Push Jerks (155/105)',
  },
  {
    name: 'Loredo',
    type: 'rounds',
    category: 'hero',
    description: '6 rounds:\n24 Air Squats\n24 Push-ups\n24 Walking Lunges\n400m Run',
  },
  {
    name: 'Nate',
    type: 'amrap',
    category: 'hero',
    description: '20 min AMRAP:\n2 Muscle-ups\n4 Handstand Push-ups\n8 KB Swings (70/53)',
  },
  {
    name: 'Randy',
    type: 'forTime',
    category: 'hero',
    description: '75 Power Snatches (75/55)',
  },
  {
    name: 'Michael',
    type: 'forTime',
    category: 'hero',
    description: '3 rounds:\n800m Run\n50 Back Extensions\n50 Sit-ups',
  },
  {
    name: 'Daniel',
    type: 'forTime',
    category: 'hero',
    description: '50 Pull-ups\n400m Run\n21 Thrusters (95/65)\n800m Run\n21 Thrusters (95/65)\n400m Run\n50 Pull-ups',
  },
  {
    name: 'Josh',
    type: 'forTime',
    category: 'hero',
    description: '21 Overhead Squats (95/65)\n42 Pull-ups\n15 Overhead Squats (95/65)\n30 Pull-ups\n9 Overhead Squats (95/65)\n18 Pull-ups',
  },
  {
    name: 'Jag 28',
    type: 'forTime',
    category: 'hero',
    description: '800m Run\n28 KB Swings (70/53)\n28 Strict Pull-ups\n28 KB Clean & Jerk (70/53)\n28 Strict Pull-ups\n800m Run',
  },
  {
    name: 'The Seven',
    type: 'forTime',
    category: 'hero',
    description: '7 rounds:\n7 Handstand Push-ups\n7 Thrusters (135/95)\n7 Knees-to-Elbows\n7 Deadlifts (245/175)\n7 Burpees\n7 KB Swings (70/53)\n7 Pull-ups',
  },

  // ── Classics / Other ──────────────────────────────────────
  {
    name: 'Fight Gone Bad',
    type: 'rounds',
    category: 'classic',
    description: '3 rounds, 1 min each station:\nWall Balls (20/14)\nSumo Deadlift High Pull (75/55)\nBox Jumps (20")\nPush Press (75/55)\nRow (calories)\n1 min rest between rounds',
  },
  {
    name: 'Filthy Fifty',
    type: 'forTime',
    category: 'classic',
    description: '50 Box Jumps (24"/20")\n50 Jumping Pull-ups\n50 KB Swings (35/26)\n50 Walking Lunges\n50 Knees-to-Elbows\n50 Push Press (45/35)\n50 Back Extensions\n50 Wall Balls (20/14)\n50 Burpees\n50 Double-unders',
  },
  {
    name: 'Kalsu',
    type: 'forTime',
    category: 'classic',
    description: '100 Thrusters (135/95)\nAt the top of every minute: 5 Burpees\n(Start with 5 burpees)',
  },
  {
    name: 'King Kong',
    type: 'forTime',
    category: 'classic',
    description: '3 rounds:\n1 Deadlift (460/315)\n2 Muscle-ups\n3 Squat Cleans (250/170)\n4 Handstand Push-ups',
  },
  {
    name: 'The Chief',
    type: 'amrap',
    category: 'classic',
    description: '5 cycles of 3 min AMRAP:\n3 Power Cleans (135/95)\n6 Push-ups\n9 Air Squats\n1 min rest between cycles',
  },
  {
    name: 'Tabata Something Else',
    type: 'tabata',
    category: 'classic',
    description: 'Tabata (8x :20 on / :10 off each):\nPull-ups\nPush-ups\nSit-ups\nAir Squats\n(Score = total reps)',
  },
  {
    name: 'Tabata This!',
    type: 'tabata',
    category: 'classic',
    description: 'Tabata (8x :20 on / :10 off each):\nRow (calories)\nRest 1 min\nAir Squats\nRest 1 min\nPull-ups\nRest 1 min\nPush-ups\nRest 1 min\nSit-ups',
  },

  // ── Open WODs ───────────────────────────────────────────────

  // 2025
  {
    name: '25.1',
    type: 'forTime',
    category: 'open',
    description: '3 rounds:\n10 Deadlifts (225/155)\n50 Double-unders\n10 Clean & Jerks (135/95)\n50 Double-unders\n(15 min cap)',
  },
  {
    name: '25.2',
    type: 'amrap',
    category: 'open',
    description: '20 min AMRAP:\n100 cal Row\n80 Chest-to-Bar Pull-ups\n60 Shuttle Runs (25 ft)\n40 Thrusters (95/65)\n20 Muscle-ups',
  },
  {
    name: '25.3',
    type: 'forTime',
    category: 'open',
    description: '5 rounds:\n10 Burpee Box Jump-overs (24"/20")\n10 Snatches (95/65)\n(20 min cap)',
  },

  // 2024
  {
    name: '24.1',
    type: 'amrap',
    category: 'open',
    description: '15 min AMRAP:\n21 cal Row\n21 Lateral Burpees over Rower\n21 Snatches (75/55)\n15 cal Row\n15 Lateral Burpees over Rower\n15 Snatches (100/70)\n9 cal Row\n9 Lateral Burpees over Rower\n9 Snatches (135/95)',
  },
  {
    name: '24.2',
    type: 'forTime',
    category: 'open',
    description: '20 min to find:\n3 rep max Front Squat',
  },
  {
    name: '24.3',
    type: 'forTime',
    category: 'open',
    description: 'For time:\n30 Bar Muscle-ups\n30 Snatches (135/95)\n(10 min cap)',
  },

  // 2023
  {
    name: '23.1',
    type: 'amrap',
    category: 'open',
    description: '14 min AMRAP:\n60 cal Row\n50 Toes-to-Bars\n40 Wall Balls (20/14)\n30 Cleans (135/95)\n20 Muscle-ups',
  },
  {
    name: '23.2A',
    type: 'forTime',
    category: 'open',
    description: '15 min to find:\n1 rep max Thruster',
  },
  {
    name: '23.2B',
    type: 'forTime',
    category: 'open',
    description: '5 min AMRAP:\nShuttle Runs (25 ft increments)',
  },
  {
    name: '23.3',
    type: 'forTime',
    category: 'open',
    description: 'For time:\n5 Wall Walks\n50 Double-unders\n15 Snatches (65/45)\n5 Wall Walks\n50 Double-unders\n12 Snatches (95/65)\n5 Wall Walks\n50 Double-unders\n9 Snatches (120/85)\n5 Wall Walks\n50 Double-unders\n6 Snatches (155/105)\n(15 min cap)',
  },

  // 2022
  {
    name: '22.1',
    type: 'amrap',
    category: 'open',
    description: '15 min AMRAP:\n3 Wall Walks\n12 DB Snatches (50/35)\n15 Box Jump-overs (24"/20")',
  },
  {
    name: '22.2',
    type: 'forTime',
    category: 'open',
    description: '1-2-3-4-5-6-7-8-9-10\nDeadlifts (225/155)\nBar-facing Burpees\n(10 min cap)',
  },
  {
    name: '22.3',
    type: 'forTime',
    category: 'open',
    description: '21-15-9:\nPull-ups\nThrusters (65/45)\nthen 21-15-9:\nChest-to-Bar Pull-ups\nThrusters (85/65)\nthen 21-15-9:\nBar Muscle-ups\nThrusters (115/85)\n(15 min cap)',
  },

  // 2021
  {
    name: '21.1',
    type: 'forTime',
    category: 'open',
    description: '1 Wall Walk\n10 Double-unders\n3 Wall Walks\n30 Double-unders\n6 Wall Walks\n60 Double-unders\n9 Wall Walks\n90 Double-unders\n15 Wall Walks\n150 Double-unders\n21 Wall Walks\n210 Double-unders\n(15 min cap)',
  },
  {
    name: '21.2',
    type: 'amrap',
    category: 'open',
    description: '20 min AMRAP:\n10 DB Snatches (50/35)\n15 Burpee Box Jump-overs (24"/20")',
  },
  {
    name: '21.3',
    type: 'forTime',
    category: 'open',
    description: '15 Front Squats (95/65)\n30 Toes-to-Bars\n15 Thrusters (95/65)\nthen:\n15 Front Squats (135/95)\n30 Chest-to-Bar Pull-ups\n15 Thrusters (135/95)\nthen:\n15 Front Squats (155/105)\n30 Bar Muscle-ups\n15 Thrusters (155/105)\n(15 min cap)',
  },

  // 2020
  {
    name: '20.1',
    type: 'forTime',
    category: 'open',
    description: '10 rounds:\n8 Ground-to-Overheads (95/65)\n10 Bar-Facing Burpees\n(15 min cap)',
  },
  {
    name: '20.2',
    type: 'amrap',
    category: 'open',
    description: '20 min AMRAP:\n4 DB Thrusters (50/35)\n6 Toes-to-Bars\n24 Double-unders',
  },
  {
    name: '20.3',
    type: 'forTime',
    category: 'open',
    description: '21 Deadlifts (225/155)\n21 Handstand Push-ups\n15 Deadlifts (225/155)\n15 Handstand Push-ups\n9 Deadlifts (225/155)\n9 Handstand Push-ups\n21 Deadlifts (315/205)\n21 Deficit Handstand Push-ups\n15 Deadlifts (315/205)\n15 Deficit Handstand Push-ups\n9 Deadlifts (315/205)\n9 Deficit Handstand Push-ups\n(9 min cap)',
  },
  {
    name: '20.4',
    type: 'forTime',
    category: 'open',
    description: '30 Box Jumps (24"/20")\n15 Clean & Jerks (95/65)\n30 Box Jumps (24"/20")\n15 Clean & Jerks (135/85)\n30 Box Jumps (24"/20")\n10 Clean & Jerks (185/115)\n30 Single-Leg Squats (15 each leg)\n10 Clean & Jerks (225/145)\n(20 min cap)',
  },
  {
    name: '20.5',
    type: 'forTime',
    category: 'open',
    description: '40 Muscle-ups\n80 cal Row\n120 Wall Balls (20/14)\n(20 min cap)',
  },

  // 2019
  {
    name: '19.1',
    type: 'amrap',
    category: 'open',
    description: '15 min AMRAP:\n19 Wall Balls (20/14)\n19 cal Row',
  },
  {
    name: '19.2',
    type: 'forTime',
    category: 'open',
    description: '25 Toes-to-Bars\n50 Double-unders\n15 Squat Cleans (135/85)\n25 Toes-to-Bars\n50 Double-unders\n13 Squat Cleans (185/115)\n(20 min cap)',
  },
  {
    name: '19.3',
    type: 'forTime',
    category: 'open',
    description: '200-ft DB Overhead Lunge (50/35)\n50 DB Box Step-ups (24"/20")\n50 Strict Handstand Push-ups\n200-ft Handstand Walk\n(10 min cap)',
  },
  {
    name: '19.4',
    type: 'forTime',
    category: 'open',
    description: '3 rounds:\n10 Snatches (95/65)\n12 Bar-Facing Burpees\nthen 3 rounds:\n10 Bar Muscle-ups\n12 Bar-Facing Burpees\n(12 min cap)',
  },
  {
    name: '19.5',
    type: 'forTime',
    category: 'open',
    description: '33-27-21-15-9:\nThrusters (95/65)\nChest-to-Bar Pull-ups\n(20 min cap)',
  },

  // 2018
  {
    name: '18.1',
    type: 'amrap',
    category: 'open',
    description: '20 min AMRAP:\n8 Toes-to-Bars\n10 DB Hang Clean & Jerks (50/35)\n14 cal Row',
  },
  {
    name: '18.2',
    type: 'amrap',
    category: 'open',
    description: '12 min:\n1-2-3-4-5-6-7-8-9-10 ... etc.\nDB Squats (50/35)\nBar-Facing Burpees',
  },
  {
    name: '18.3',
    type: 'forTime',
    category: 'open',
    description: '2 rounds:\n100 Double-unders\n20 Overhead Squats (115/80)\n100 Double-unders\n12 Ring Muscle-ups\n100 Double-unders\n20 DB Snatches (50/35)\n100 Double-unders\n12 Bar Muscle-ups\n(14 min cap)',
  },
  {
    name: '18.4',
    type: 'forTime',
    category: 'open',
    description: '21-15-9:\nDeadlifts (225/155)\nHandstand Push-ups\nthen 21-15-9:\nDeadlifts (315/205)\n50-ft Handstand Walk\n(9 min cap)',
  },
  {
    name: '18.5',
    type: 'forTime',
    category: 'open',
    description: '7 rounds:\n3 Thrusters (100/70)\n3 Chest-to-Bar Pull-ups\nthen 7 rounds:\n3 Thrusters (135/95)\n3 Bar Muscle-ups\n(9 min cap)',
  },

  // 2017
  {
    name: '17.1',
    type: 'forTime',
    category: 'open',
    description: '10 DB Snatches (50/35)\n15 Burpee Box Jump-overs (24"/20")\n20 DB Snatches\n15 Burpee Box Jump-overs\n30 DB Snatches\n15 Burpee Box Jump-overs\n40 DB Snatches\n15 Burpee Box Jump-overs\n50 DB Snatches\n15 Burpee Box Jump-overs\n(20 min cap)',
  },
  {
    name: '17.2',
    type: 'amrap',
    category: 'open',
    description: '12 min AMRAP:\n2 rounds of:\n50-ft Weighted Walking Lunges (50/35)\n16 Toes-to-Bars\n8 Power Cleans (50/35)\nthen 2 rounds of:\n50-ft Weighted Walking Lunges (50/35)\n16 Bar Muscle-ups\n8 Power Cleans (50/35)',
  },
  {
    name: '17.3',
    type: 'forTime',
    category: 'open',
    description: 'Prior to 8 min, find:\n3 rep max Squat Snatch\nthen 3 rep max Squat Snatch (heavier)',
  },
  {
    name: '17.4',
    type: 'forTime',
    category: 'open',
    description: '55 Deadlifts (225/155)\n55 Wall Balls (20/14)\n55 cal Row\n55 Handstand Push-ups\n(13 min cap)',
  },
  {
    name: '17.5',
    type: 'forTime',
    category: 'open',
    description: '10 rounds:\n9 Thrusters (95/65)\n35 Double-unders\n(40 min cap)',
  },
]
