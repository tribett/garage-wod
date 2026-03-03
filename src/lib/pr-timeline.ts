/**
 * pr-timeline.ts — Builds a chronological list of PR (personal record) entries
 * for charting progression over time. Only includes sessions where a new
 * all-time best was achieved.
 */

import type { WorkoutLog } from '@/types/workout-log'

export interface PRTimelineEntry {
  movementName: string
  weight: number
  reps: number
  date: string // ISO string
}

/**
 * Build a chronological timeline of PR achievements from workout logs.
 * Each entry represents a session where a new all-time best was set
 * for a given movement.
 *
 * @param logs         - All workout logs
 * @param movementName - Optional filter for a specific movement
 */
export function buildPRTimeline(
  logs: WorkoutLog[],
  movementName?: string,
): PRTimelineEntry[] {
  // Flatten all exercise entries, sorted by date
  const entries: { name: string; weight: number; reps: number; date: string }[] = []

  for (const log of logs) {
    if (!log.exercises) continue
    for (const ex of log.exercises) {
      if (movementName && ex.movementName.toLowerCase() !== movementName.toLowerCase()) {
        continue
      }
      let bestWeight = 0
      let bestReps = 0
      for (const set of ex.sets) {
        if (set.completed && set.weight && set.weight > bestWeight) {
          bestWeight = set.weight
          bestReps = set.reps ?? 0
        }
      }
      if (bestWeight > 0) {
        entries.push({
          name: ex.movementName,
          weight: bestWeight,
          reps: bestReps,
          date: log.completedAt,
        })
      }
    }
  }

  // Sort chronologically
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Filter to only keep entries that represent a new PR
  const bestByMovement = new Map<string, number>()
  const timeline: PRTimelineEntry[] = []

  for (const entry of entries) {
    const key = entry.name.toLowerCase()
    const currentBest = bestByMovement.get(key) ?? 0

    if (entry.weight > currentBest) {
      bestByMovement.set(key, entry.weight)
      timeline.push({
        movementName: entry.name,
        weight: entry.weight,
        reps: entry.reps,
        date: entry.date,
      })
    }
  }

  return timeline
}
