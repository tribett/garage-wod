import type { WodType } from './program'

export interface WorkoutLog {
  id: string
  programId: string
  weekNumber: number
  dayNumber: number
  completedAt: string
  completed: boolean
  exercises?: ExerciseLog[]
  wodResult?: WodResult
  notes?: string
}

export interface ExerciseLog {
  movementId: string
  movementName: string
  sets: SetLog[]
}

export interface SetLog {
  weight?: number
  reps?: number
  completed: boolean
}

export interface WodResult {
  type: WodType
  roundsCompleted?: number
  extraReps?: number
  totalTime?: number
  score?: string
}
