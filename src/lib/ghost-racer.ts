import type { WorkoutLog } from '@/types/workout-log'

export interface GhostState {
  isActive: boolean
  previousTime: number
  currentElapsed: number
  paceStatus: 'ahead' | 'behind' | 'tied'
  delta: number
  deltaFormatted: string
  progressPct: number
}

/**
 * Parse a "M:SS" score string into milliseconds.
 */
function parseScoreToMs(score: string): number {
  const parts = score.split(':')
  const minutes = parseInt(parts[0], 10)
  const seconds = parseInt(parts[1], 10)
  return (minutes * 60 + seconds) * 1000
}

/**
 * Find the most recent forTime log matching wodName (case-insensitive).
 * Returns the previous time in ms and the raw score string, or null if none found.
 */
export function createGhostFromHistory(
  wodName: string,
  logs: WorkoutLog[],
): { previousTime: number; previousScore: string } | null {
  const normalised = wodName.toLowerCase()

  const matching = logs
    .filter(
      (log) =>
        log.title?.toLowerCase() === normalised &&
        log.wodResult?.type === 'forTime' &&
        log.wodResult.score != null,
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )

  if (matching.length === 0) return null

  const mostRecent = matching[0]
  const score = mostRecent.wodResult!.score!
  return {
    previousTime: parseScoreToMs(score),
    previousScore: score,
  }
}

/**
 * Compute the current ghost racer state given elapsed time and the ghost's
 * previous total time (both in milliseconds).
 */
export function updateGhostState(
  elapsed: number,
  previousTime: number,
): GhostState {
  const delta = previousTime - elapsed
  const absDelta = Math.abs(delta)

  let paceStatus: GhostState['paceStatus']
  if (absDelta <= 1000) {
    paceStatus = 'tied'
  } else if (delta > 0) {
    paceStatus = 'ahead'
  } else {
    paceStatus = 'behind'
  }

  const progressPct = Math.min((elapsed / previousTime) * 100, 100)

  return {
    isActive: elapsed < previousTime,
    previousTime,
    currentElapsed: elapsed,
    paceStatus,
    delta,
    deltaFormatted: formatGhostDelta(delta),
    progressPct,
  }
}

/**
 * Format a delta in milliseconds as "+M:SS" or "-M:SS".
 */
export function formatGhostDelta(deltaMs: number): string {
  const sign = deltaMs >= 0 ? '+' : '-'
  const abs = Math.abs(deltaMs)
  const totalSeconds = Math.floor(abs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`
}
