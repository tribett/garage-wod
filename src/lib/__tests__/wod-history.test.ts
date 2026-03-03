import { describe, test, expect } from 'vitest'
import { getWodScoreHistory, searchWorkoutHistory } from '../wod-history'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: 'log-1',
    programId: 'standalone',
    weekNumber: 0,
    dayNumber: 1,
    completedAt: '2025-01-01T00:00:00Z',
    completed: true,
    ...overrides,
  }
}

// ── getWodScoreHistory ────────────────────────────────────────

describe('getWodScoreHistory', () => {
  test('returns empty array when no matching WODs', () => {
    const result = getWodScoreHistory([], 'Fran')
    expect(result).toEqual([])
  })

  test('returns scores for matching WOD name', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        title: 'Fran',
        completedAt: '2025-01-01T00:00:00Z',
        wodResult: { type: 'forTime', score: '4:32' },
      }),
      makeLog({
        id: 'log-2',
        title: 'Fran',
        completedAt: '2025-02-01T00:00:00Z',
        wodResult: { type: 'forTime', score: '3:58' },
      }),
    ]
    const result = getWodScoreHistory(logs, 'Fran')
    expect(result).toHaveLength(2)
    expect(result[0].score).toBe('4:32')
    expect(result[1].score).toBe('3:58')
  })

  test('is case-insensitive for WOD name matching', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        title: 'fran',
        wodResult: { type: 'forTime', score: '4:32' },
      }),
    ]
    const result = getWodScoreHistory(logs, 'Fran')
    expect(result).toHaveLength(1)
  })

  test('includes scaling info when present', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        title: 'Fran',
        wodResult: { type: 'forTime', score: '4:32', scaling: 'rx' },
      }),
    ]
    const result = getWodScoreHistory(logs, 'Fran')
    expect(result[0].scaling).toBe('rx')
  })

  test('sorts results by date ascending', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-2',
        title: 'Fran',
        completedAt: '2025-02-01T00:00:00Z',
        wodResult: { type: 'forTime', score: '3:58' },
      }),
      makeLog({
        id: 'log-1',
        title: 'Fran',
        completedAt: '2025-01-01T00:00:00Z',
        wodResult: { type: 'forTime', score: '4:32' },
      }),
    ]
    const result = getWodScoreHistory(logs, 'Fran')
    expect(result[0].date).toBe('2025-01-01T00:00:00Z')
    expect(result[1].date).toBe('2025-02-01T00:00:00Z')
  })

  test('skips logs without wodResult or score', () => {
    const logs: WorkoutLog[] = [
      makeLog({ id: 'log-1', title: 'Fran' }),
      makeLog({
        id: 'log-2',
        title: 'Fran',
        wodResult: { type: 'forTime' },
      }),
      makeLog({
        id: 'log-3',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '4:32' },
      }),
    ]
    const result = getWodScoreHistory(logs, 'Fran')
    expect(result).toHaveLength(1)
    expect(result[0].score).toBe('4:32')
  })
})

// ── searchWorkoutHistory (Feature 4) ──────────────────────────

describe('searchWorkoutHistory', () => {
  test('returns empty array for no matches', () => {
    const result = searchWorkoutHistory([], 'thruster')
    expect(result).toEqual([])
  })

  test('finds workouts by title', () => {
    const logs: WorkoutLog[] = [
      makeLog({ id: 'log-1', title: 'Fran', completed: true }),
      makeLog({ id: 'log-2', title: 'Grace', completed: true }),
    ]
    const result = searchWorkoutHistory(logs, 'fran')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('log-1')
  })

  test('finds workouts by description', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        title: 'Fran',
        description: '21-15-9\nThrusters (95/65)\nPull-ups',
        completed: true,
      }),
      makeLog({
        id: 'log-2',
        title: 'Grace',
        description: '30 Clean & Jerks (135/95)',
        completed: true,
      }),
    ]
    const result = searchWorkoutHistory(logs, 'thruster')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('log-1')
  })

  test('finds workouts by exercise name', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        title: 'Week 1 Day 1',
        exercises: [
          {
            movementId: 'sq-1',
            movementName: 'Back Squat',
            sets: [{ weight: 185, reps: 5, completed: true }],
          },
        ],
        completed: true,
      }),
      makeLog({
        id: 'log-2',
        title: 'Week 1 Day 2',
        exercises: [
          {
            movementId: 'bp-1',
            movementName: 'Bench Press',
            sets: [{ weight: 135, reps: 5, completed: true }],
          },
        ],
        completed: true,
      }),
    ]
    const result = searchWorkoutHistory(logs, 'squat')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('log-1')
  })

  test('is case-insensitive', () => {
    const logs: WorkoutLog[] = [
      makeLog({ id: 'log-1', title: 'FRAN', completed: true }),
    ]
    const result = searchWorkoutHistory(logs, 'fran')
    expect(result).toHaveLength(1)
  })

  test('only returns completed workouts', () => {
    const logs: WorkoutLog[] = [
      makeLog({ id: 'log-1', title: 'Fran', completed: false }),
      makeLog({ id: 'log-2', title: 'Fran', completed: true }),
    ]
    const result = searchWorkoutHistory(logs, 'fran')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('log-2')
  })

  test('finds workouts by WOD score', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '4:32' },
        completed: true,
      }),
    ]
    const result = searchWorkoutHistory(logs, '4:32')
    expect(result).toHaveLength(1)
  })

  test('returns results sorted by date descending', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        title: 'Fran',
        completedAt: '2025-01-01T00:00:00Z',
        completed: true,
      }),
      makeLog({
        id: 'log-2',
        title: 'Fran',
        completedAt: '2025-02-01T00:00:00Z',
        completed: true,
      }),
    ]
    const result = searchWorkoutHistory(logs, 'fran')
    expect(result[0].id).toBe('log-2')
    expect(result[1].id).toBe('log-1')
  })
})
