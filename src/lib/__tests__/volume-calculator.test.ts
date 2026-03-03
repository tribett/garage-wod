import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWeeklyVolume } from '../volume-calculator'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> & { completedAt: string }): WorkoutLog {
  return {
    id: Math.random().toString(),
    programId: 'test',
    weekNumber: 1,
    dayNumber: 1,
    completed: true,
    ...overrides,
  }
}

describe('getWeeklyVolume', () => {
  beforeEach(() => {
    // Fix "now" to Wednesday March 4, 2026
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 4))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns zero volume with no logs', () => {
    const vol = getWeeklyVolume([])
    expect(vol.thisWeek.workouts).toBe(0)
    expect(vol.thisWeek.totalSets).toBe(0)
    expect(vol.thisWeek.totalReps).toBe(0)
    expect(vol.lastWeek.workouts).toBe(0)
  })

  test('counts workouts this week', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-03-02T10:00:00Z' }), // Monday this week
      makeLog({ completedAt: '2026-03-03T10:00:00Z' }), // Tuesday this week
    ]
    const vol = getWeeklyVolume(logs)
    expect(vol.thisWeek.workouts).toBe(2)
  })

  test('counts sets and reps from exercises', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-03-02T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Squat',
            sets: [
              { weight: 225, reps: 5, completed: true },
              { weight: 225, reps: 5, completed: true },
              { weight: 225, reps: 5, completed: true },
            ],
          },
        ],
      }),
    ]
    const vol = getWeeklyVolume(logs)
    expect(vol.thisWeek.totalSets).toBe(3)
    expect(vol.thisWeek.totalReps).toBe(15)
  })

  test('separates this week from last week', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-03-02T10:00:00Z' }), // this week (Mon)
      makeLog({ completedAt: '2026-02-25T10:00:00Z' }), // last week (Wed)
      makeLog({ completedAt: '2026-02-23T10:00:00Z' }), // last week (Mon)
    ]
    const vol = getWeeklyVolume(logs)
    expect(vol.thisWeek.workouts).toBe(1)
    expect(vol.lastWeek.workouts).toBe(2)
  })

  test('ignores incomplete logs', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-03-02T10:00:00Z', completed: false }),
    ]
    const vol = getWeeklyVolume(logs)
    expect(vol.thisWeek.workouts).toBe(0)
  })

  test('only counts completed sets for reps', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-03-02T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Bench',
            sets: [
              { weight: 185, reps: 5, completed: true },
              { weight: 185, reps: 5, completed: false }, // not completed
            ],
          },
        ],
      }),
    ]
    const vol = getWeeklyVolume(logs)
    expect(vol.thisWeek.totalSets).toBe(1) // only completed
    expect(vol.thisWeek.totalReps).toBe(5)
  })
})
