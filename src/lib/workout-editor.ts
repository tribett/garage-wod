import type { WorkoutLog } from '@/types/workout-log'

/**
 * Merge partial updates into an existing workout log.
 * Preserves every field on `existing` unless explicitly overridden
 * with a defined value in `updates`.
 */
export function mergeWorkoutUpdate(
  existing: WorkoutLog,
  updates: Partial<WorkoutLog>,
): WorkoutLog {
  const result = { ...existing }

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      ;(result as Record<string, unknown>)[key] = value
    }
  }

  return result
}

/**
 * Determine whether a workout log is eligible for editing.
 * Only completed workouts can be edited — editing an incomplete log
 * doesn't make sense (there's nothing recorded yet).
 */
export function canEditLog(log: WorkoutLog): boolean {
  return log.completed
}
