import type { WorkoutLog } from '@/types/workout-log'
import type { WodType } from '@/types/program'
import { parseWodScore } from '@/lib/wod-score-timeline'

export interface ScoreComparison {
  currentScore: string
  previousScore: string | null
  improvement: number | null
  improvementPct: number | null
  trend: 'improving' | 'plateau' | 'declining' | 'first'
  attemptNumber: number
  bestScore: string
  isBest: boolean
  callout: string
}

/**
 * Determine whether "higher is better" for a given WOD type.
 * For forTime, lower is better (fewer seconds).
 * For amrap/rounds, higher is better (more rounds/reps).
 */
function higherIsBetter(wodType: WodType): boolean {
  return wodType !== 'forTime'
}

/**
 * Find all previous logs matching a WOD name (case-insensitive),
 * sorted chronologically (oldest first).
 */
function findMatchingLogs(wodName: string, history: WorkoutLog[]): WorkoutLog[] {
  const lowerName = wodName.toLowerCase()
  return history
    .filter((log) => log.title?.toLowerCase() === lowerName && log.wodResult?.score)
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    )
}

/**
 * Compare the current WOD score against historical attempts.
 */
export function compareWodScore(
  wodName: string,
  currentScore: string,
  wodType: WodType,
  history: WorkoutLog[],
): ScoreComparison {
  const currentNumeric = parseWodScore(currentScore, wodType)
  const matchingLogs = findMatchingLogs(wodName, history)

  // Parse all historical numeric scores alongside their raw values
  const parsedHistory = matchingLogs
    .map((log) => ({
      raw: log.wodResult!.score!,
      numeric: parseWodScore(log.wodResult!.score!, wodType),
    }))
    .filter((h) => h.numeric !== null) as Array<{
    raw: string
    numeric: number
  }>

  // If current score is unparseable, treat as first attempt with nulls
  if (currentNumeric === null) {
    return {
      currentScore,
      previousScore: null,
      improvement: null,
      improvementPct: null,
      trend: 'first',
      attemptNumber: 1,
      bestScore: currentScore,
      isBest: true,
      callout: generateCallout(
        {
          currentScore,
          previousScore: null,
          improvement: null,
          improvementPct: null,
          trend: 'first',
          attemptNumber: 1,
          bestScore: currentScore,
          isBest: true,
          callout: '',
        },
        wodType,
      ),
    }
  }

  const attemptNumber = parsedHistory.length + 1

  // No valid previous scores -> first attempt
  if (parsedHistory.length === 0) {
    const result: ScoreComparison = {
      currentScore,
      previousScore: null,
      improvement: null,
      improvementPct: null,
      trend: 'first',
      attemptNumber: 1,
      bestScore: currentScore,
      isBest: true,
      callout: '',
    }
    result.callout = generateCallout(result, wodType)
    return result
  }

  const previousEntry = parsedHistory[parsedHistory.length - 1]
  const previousScore = previousEntry.raw
  const previousNumeric = previousEntry.numeric

  // Calculate raw difference (positive = better performance)
  const hib = higherIsBetter(wodType)
  const rawDiff = hib
    ? currentNumeric - previousNumeric
    : previousNumeric - currentNumeric
  const improvement = rawDiff
  const improvementPct =
    previousNumeric !== 0
      ? (Math.abs(rawDiff) / previousNumeric) * 100 * Math.sign(rawDiff)
      : null

  // Determine best score ever (including current)
  const allNumerics = [...parsedHistory.map((h) => h.numeric), currentNumeric]
  const bestNumeric = hib
    ? Math.max(...allNumerics)
    : Math.min(...allNumerics)
  const isBest = currentNumeric === bestNumeric

  // Find the best raw score string
  let bestScore: string
  if (isBest) {
    bestScore = currentScore
  } else {
    const bestEntry = parsedHistory.find((h) => h.numeric === bestNumeric)
    bestScore = bestEntry ? bestEntry.raw : currentScore
  }

  // Determine trend: plateau if change is within 2% of previous score
  const absPct = Math.abs(improvementPct ?? 0)
  let trend: ScoreComparison['trend']
  if (absPct <= 2) {
    trend = 'plateau'
  } else if (improvement > 0) {
    trend = 'improving'
  } else {
    trend = 'declining'
  }

  const result: ScoreComparison = {
    currentScore,
    previousScore,
    improvement,
    improvementPct,
    trend,
    attemptNumber,
    bestScore,
    isBest,
    callout: '',
  }
  result.callout = generateCallout(result, wodType)
  return result
}

/**
 * Generate a human-readable callout message for a score comparison.
 */
export function generateCallout(
  comparison: ScoreComparison,
  wodType: WodType,
): string {
  if (comparison.trend === 'first') {
    return 'First time doing this WOD — baseline set!'
  }

  if (comparison.trend === 'improving' && comparison.improvement !== null) {
    const imp = Math.abs(comparison.improvement)
    if (wodType === 'forTime') {
      return `${imp} seconds faster than last time!`
    }
    return `${imp} more rounds than last time!`
  }

  if (comparison.trend === 'declining') {
    // Rank: current attempt is not the best, estimate rank among all attempts
    const rank = comparison.attemptNumber - 1
    const suffix = ordinalSuffix(rank)
    return `still your ${rank}${suffix} best`
  }

  // plateau
  return 'Holding steady — consistency is key!'
}

function ordinalSuffix(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  if (mod10 === 1) return 'st'
  if (mod10 === 2) return 'nd'
  if (mod10 === 3) return 'rd'
  return 'th'
}
