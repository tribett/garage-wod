import { describe, it, expect } from 'vitest'
import { compareWodScore, generateCallout } from '../score-comparisons'
import type { ScoreComparison } from '../score-comparisons'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> & { completedAt: string }): WorkoutLog {
  return {
    id: Math.random().toString(),
    programId: 'standalone',
    weekNumber: 0,
    dayNumber: 1,
    completed: true,
    ...overrides,
  }
}

describe('compareWodScore', () => {
  it('identifies first attempt when no matching WOD in history', () => {
    const result = compareWodScore('Fran', '8:42', 'forTime', [])
    expect(result.trend).toBe('first')
    expect(result.attemptNumber).toBe(1)
    expect(result.previousScore).toBeNull()
    expect(result.improvement).toBeNull()
    expect(result.improvementPct).toBeNull()
    expect(result.isBest).toBe(true)
    expect(result.bestScore).toBe('8:42')
    expect(result.currentScore).toBe('8:42')
  })

  it('calculates time improvement for forTime', () => {
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:42' },
      }),
    ]
    const result = compareWodScore('Fran', '8:19', 'forTime', history)
    expect(result.improvement).toBe(23)
    expect(result.previousScore).toBe('8:42')
    expect(result.currentScore).toBe('8:19')
    expect(result.trend).toBe('improving')
  })

  it('calculates round improvement for AMRAP', () => {
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Cindy',
        wodResult: { type: 'amrap', score: '5+3' },
      }),
    ]
    const result = compareWodScore('Cindy', '6+1', 'amrap', history)
    expect(result.improvement).toBeCloseTo(0.8, 1)
    expect(result.trend).toBe('improving')
  })

  it('detects new personal best for forTime (lowest time)', () => {
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:42' },
      }),
      makeLog({
        completedAt: '2026-02-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:19' },
      }),
    ]
    const result = compareWodScore('Fran', '7:50', 'forTime', history)
    expect(result.isBest).toBe(true)
    expect(result.bestScore).toBe('7:50')
  })

  it('detects declining performance when forTime score is worse/higher', () => {
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:19' },
      }),
    ]
    const result = compareWodScore('Fran', '9:00', 'forTime', history)
    expect(result.trend).toBe('declining')
  })

  it('detects plateau when scores within 5%', () => {
    // Previous: 8:42 = 522s. 5% of 522 = 26.1.
    // Current: 8:38 = 518s. Diff = 4s, which is within 26.1 → plateau
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:42' },
      }),
    ]
    const result = compareWodScore('Fran', '8:38', 'forTime', history)
    expect(result.trend).toBe('plateau')
  })

  it('counts attempt number correctly with 3 previous attempts', () => {
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '9:00' },
      }),
      makeLog({
        completedAt: '2026-02-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:42' },
      }),
      makeLog({
        completedAt: '2026-03-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:19' },
      }),
    ]
    const result = compareWodScore('Fran', '8:00', 'forTime', history)
    expect(result.attemptNumber).toBe(4)
  })

  it('handles missing/unparseable scores gracefully', () => {
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: 'DNF' },
      }),
    ]
    const result = compareWodScore('Fran', 'completed', 'forTime', history)
    expect(result.trend).toBe('first')
    expect(result.improvement).toBeNull()
    expect(result.improvementPct).toBeNull()
  })

  it('calculates improvement percentage correctly', () => {
    // Previous: 8:42 = 522s. Current: 8:19 = 499s.
    // Improvement = 23s. Pct = 23/522 * 100 ≈ 4.41%
    const history: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '8:42' },
      }),
    ]
    const result = compareWodScore('Fran', '8:19', 'forTime', history)
    expect(result.improvementPct).toBeCloseTo(4.41, 1)
  })
})

describe('generateCallout', () => {
  it('generates encouraging callout for improvement', () => {
    const comparison: ScoreComparison = {
      currentScore: '8:19',
      previousScore: '8:42',
      improvement: 23,
      improvementPct: 4.41,
      trend: 'improving',
      attemptNumber: 2,
      bestScore: '8:19',
      isBest: true,
      callout: '',
    }
    const callout = generateCallout(comparison, 'forTime')
    expect(callout).toBe('23 seconds faster than last time!')
  })

  it('generates first-attempt callout', () => {
    const comparison: ScoreComparison = {
      currentScore: '8:42',
      previousScore: null,
      improvement: null,
      improvementPct: null,
      trend: 'first',
      attemptNumber: 1,
      bestScore: '8:42',
      isBest: true,
      callout: '',
    }
    const callout = generateCallout(comparison, 'forTime')
    expect(callout).toBe('First time doing this WOD — baseline set!')
  })

  it('generates "still your Nth best" callout for decline', () => {
    const comparison: ScoreComparison = {
      currentScore: '9:00',
      previousScore: '8:19',
      improvement: -41,
      improvementPct: -7.85,
      trend: 'declining',
      attemptNumber: 4,
      bestScore: '8:00',
      isBest: false,
      callout: '',
    }
    const callout = generateCallout(comparison, 'forTime')
    expect(callout).toMatch(/still your \d+\w+ best/)
  })
})
