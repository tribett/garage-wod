import { describe, test, expect } from 'vitest'
import { parseWodScore, buildWodScoreTimeline } from '../wod-score-timeline'
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

describe('parseWodScore', () => {
  test('parses For Time scores (mm:ss)', () => {
    expect(parseWodScore('8:42', 'forTime')).toBe(522)
    expect(parseWodScore('12:05', 'forTime')).toBe(725)
    expect(parseWodScore('0:59', 'forTime')).toBe(59)
  })

  test('parses AMRAP scores (rounds+reps)', () => {
    expect(parseWodScore('5+3', 'amrap')).toBeCloseTo(5.3, 1)
    expect(parseWodScore('10+0', 'amrap')).toBeCloseTo(10.0, 1)
    expect(parseWodScore('3+12', 'amrap')).toBeCloseTo(3.12, 2)
  })

  test('parses Rounds scores', () => {
    expect(parseWodScore('5 rounds', 'rounds')).toBe(5)
    expect(parseWodScore('5', 'rounds')).toBe(5)
  })

  test('returns null for unparseable scores', () => {
    expect(parseWodScore('completed', 'forTime')).toBeNull()
    expect(parseWodScore('', 'amrap')).toBeNull()
    expect(parseWodScore('DNF', 'forTime')).toBeNull()
  })
})

describe('buildWodScoreTimeline', () => {
  test('returns empty array for no matching WOD', () => {
    expect(buildWodScoreTimeline([], 'Fran')).toEqual([])
  })

  test('returns timeline entries sorted by date', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-03-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '4:30', scaling: 'Rx' },
      }),
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '6:15', scaling: 'Scaled' },
      }),
    ]
    const timeline = buildWodScoreTimeline(logs, 'Fran')
    expect(timeline).toHaveLength(2)
    expect(timeline[0].numericScore).toBe(375) // 6:15 = 375s (earlier date)
    expect(timeline[1].numericScore).toBe(270) // 4:30 = 270s (later date)
  })

  test('matches WOD name case-insensitively', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'fran',
        wodResult: { type: 'forTime', score: '5:00' },
      }),
    ]
    expect(buildWodScoreTimeline(logs, 'Fran')).toHaveLength(1)
  })

  test('filters out entries with unparseable scores', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: 'completed' },
      }),
      makeLog({
        completedAt: '2026-02-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '5:00' },
      }),
    ]
    expect(buildWodScoreTimeline(logs, 'Fran')).toHaveLength(1)
  })
})
