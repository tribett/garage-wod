import type { WorkoutLog } from '@/types/workout-log'

export interface WodScoreEntry {
  date: string
  score: string
  scaling?: string
  type: string
}

/**
 * Get the score history for a specific WOD name.
 * Returns all previous scores sorted by date ascending (oldest first).
 */
export function getWodScoreHistory(
  logs: WorkoutLog[],
  wodName: string,
): WodScoreEntry[] {
  const name = wodName.toLowerCase()

  return logs
    .filter(
      (log) =>
        log.completed &&
        log.title?.toLowerCase() === name &&
        log.wodResult?.score,
    )
    .map((log) => ({
      date: log.completedAt,
      score: log.wodResult!.score!,
      scaling: log.wodResult!.scaling,
      type: log.wodResult!.type,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Search workout history by query string.
 * Matches against title, description, exercise names, and WOD scores.
 * Returns completed workouts sorted by date descending (newest first).
 */
export function searchWorkoutHistory(
  logs: WorkoutLog[],
  query: string,
): WorkoutLog[] {
  if (!query.trim()) return []

  const q = query.toLowerCase()

  return logs
    .filter((log) => {
      if (!log.completed) return false

      // Search title
      if (log.title?.toLowerCase().includes(q)) return true

      // Search description
      if (log.description?.toLowerCase().includes(q)) return true

      // Search exercise names
      if (log.exercises?.some((ex) => ex.movementName.toLowerCase().includes(q)))
        return true

      // Search WOD score
      if (log.wodResult?.score?.toLowerCase().includes(q)) return true

      return false
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )
}
