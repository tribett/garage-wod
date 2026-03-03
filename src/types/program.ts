export interface Program {
  id: string
  name: string
  author: string
  description: string
  version: string
  phases: Phase[]
}

export interface Phase {
  name: string
  description: string
  weekStart: number
  weekEnd: number
  weeks: Week[]
}

export interface Week {
  weekNumber: number
  days: Day[]
}

export type DayIntent = 'heavy' | 'recovery' | 'conditioning' | 'skill' | 'benchmark'

export interface Day {
  dayNumber: number
  name: string
  blocks: WorkoutBlock[]
  coachNotes?: string
  intent?: DayIntent
}

export type BlockType = 'warmup' | 'skill' | 'wod' | 'cooldown'

export interface WorkoutBlock {
  type: BlockType
  name: string
  description?: string
  movements: Movement[]
  scoring?: WodScoring
}

export interface Movement {
  id: string
  name: string
  sets?: number
  reps?: number | string
  weight?: string
  duration?: number
  distance?: string
  notes?: string
  rest?: number
}

export type WodType = 'amrap' | 'emom' | 'forTime' | 'tabata' | 'rounds'

export interface WodScoring {
  type: WodType
  duration?: number
  interval?: number
  rounds?: number
  workInterval?: number
  restInterval?: number
}
