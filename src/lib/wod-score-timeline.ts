import type { WorkoutLog } from '@/types/workout-log'
import type { WodType } from '@/types/program'

export interface WodScorePoint {
  date: string
  rawScore: string
  numericScore: number
  scaling?: string
}

/**
 * Parse a human-entered WOD score into a numeric value.
 *
 * Supported formats:
 *   forTime  → "8:42"   → 522 (seconds)
 *   amrap    → "5+3"    → 5.3 (rounds.reps)
 *   rounds   → "5"      → 5   (also accepts "5 rounds")
 */
export function parseWodScore(score: string, type: WodType): number | null {
  const s = score?.trim()
  if (!s) return null

  if (type === 'forTime') {
    const match = s.match(/^(\d+):(\d{2})$/)
    if (!match) return null
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
  }

  if (type === 'amrap') {
    const match = s.match(/^(\d+)\+(\d+)$/)
    if (!match) return null
    // Encode as rounds.reps (e.g. 5+3 → 5.3, 3+12 → 3.12)
    return parseFloat(`${match[1]}.${match[2]}`)
  }

  if (type === 'rounds') {
    const match = s.match(/^(\d+)/)
    if (!match) return null
    return parseInt(match[1], 10)
  }

  return null
}

/**
 * Build a chronological score timeline for a named WOD.
 * Filters to matching logs, parses each score, drops unparseables,
 * and sorts by date ascending.
 */
export function buildWodScoreTimeline(
  logs: WorkoutLog[],
  wodName: string,
): WodScorePoint[] {
  const lowerName = wodName.toLowerCase()

  const points: WodScorePoint[] = []

  for (const log of logs) {
    if (log.title?.toLowerCase() !== lowerName) continue
    if (!log.wodResult?.score) continue

    const numericScore = parseWodScore(log.wodResult.score, log.wodResult.type)
    if (numericScore === null) continue

    const point: WodScorePoint = {
      date: log.completedAt,
      rawScore: log.wodResult.score,
      numericScore,
    }
    if (log.wodResult.scaling) point.scaling = log.wodResult.scaling
    points.push(point)
  }

  return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
