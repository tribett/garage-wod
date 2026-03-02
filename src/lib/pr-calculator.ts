import type { WorkoutLog } from '@/types/workout-log'

export interface PR {
  movementName: string
  value: number
  unit: 'lbs' | 'kg'
  achievedAt: string
  reps: number
}

export function detectNewPRs(
  movementName: string,
  weight: number,
  reps: number,
  history: WorkoutLog[],
  unit: 'lbs' | 'kg' = 'lbs',
): PR | null {
  const previousBest = getMovementPR(movementName, history)

  if (!previousBest || weight > previousBest.value) {
    return {
      movementName,
      value: weight,
      unit,
      achievedAt: new Date().toISOString(),
      reps,
    }
  }
  return null
}

export function getMovementPR(
  movementName: string,
  history: WorkoutLog[],
): PR | null {
  let best: PR | null = null

  for (const log of history) {
    if (!log.exercises) continue
    for (const ex of log.exercises) {
      if (ex.movementName.toLowerCase() !== movementName.toLowerCase()) continue
      for (const set of ex.sets) {
        if (set.weight && set.completed) {
          if (!best || set.weight > best.value) {
            best = {
              movementName: ex.movementName,
              value: set.weight,
              unit: 'lbs',
              achievedAt: log.completedAt,
              reps: set.reps ?? 0,
            }
          }
        }
      }
    }
  }

  return best
}

export function getAllPRs(history: WorkoutLog[]): Map<string, PR> {
  const prs = new Map<string, PR>()

  for (const log of history) {
    if (!log.exercises) continue
    for (const ex of log.exercises) {
      for (const set of ex.sets) {
        if (set.weight && set.completed) {
          const key = ex.movementName.toLowerCase()
          const current = prs.get(key)
          if (!current || set.weight > current.value) {
            prs.set(key, {
              movementName: ex.movementName,
              value: set.weight,
              unit: 'lbs',
              achievedAt: log.completedAt,
              reps: set.reps ?? 0,
            })
          }
        }
      }
    }
  }

  return prs
}

export function getMovementHistory(
  movementName: string,
  history: WorkoutLog[],
): { date: string; weight: number; reps: number }[] {
  const entries: { date: string; weight: number; reps: number }[] = []

  for (const log of history) {
    if (!log.exercises) continue
    for (const ex of log.exercises) {
      if (ex.movementName.toLowerCase() !== movementName.toLowerCase()) continue
      // Find heaviest set for this session
      let best = 0
      let bestReps = 0
      for (const set of ex.sets) {
        if (set.weight && set.completed && set.weight > best) {
          best = set.weight
          bestReps = set.reps ?? 0
        }
      }
      if (best > 0) {
        entries.push({ date: log.completedAt, weight: best, reps: bestReps })
      }
    }
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getRecentPRs(history: WorkoutLog[], limit = 5): PR[] {
  const allPRs = getAllPRs(history)
  return Array.from(allPRs.values())
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, limit)
}
