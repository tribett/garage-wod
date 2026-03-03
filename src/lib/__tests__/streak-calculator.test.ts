import { describe, test, expect, vi, afterEach } from 'vitest'
import { getWorkoutsThisMonth, getTotalWodCount } from '../streak-calculator'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: 'log-1',
    programId: 'prog-1',
    weekNumber: 1,
    dayNumber: 1,
    completedAt: '2025-01-15T00:00:00Z',
    completed: true,
    ...overrides,
  }
}

// ── getWorkoutsThisMonth ──────────────────────────────────────

describe('getWorkoutsThisMonth', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns 0 for empty logs', () => {
    const result = getWorkoutsThisMonth([])
    expect(result).toBe(0)
  })

  test('counts workouts in the current month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-20T12:00:00Z'))

    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        completedAt: '2025-01-05T00:00:00Z',
        completed: true,
      }),
      makeLog({
        id: 'log-2',
        completedAt: '2025-01-15T00:00:00Z',
        completed: true,
      }),
      makeLog({
        id: 'log-3',
        completedAt: '2024-12-20T00:00:00Z',
        completed: true,
      }),
    ]
    const result = getWorkoutsThisMonth(logs)
    expect(result).toBe(2)
  })

  test('only counts completed workouts', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-20T12:00:00Z'))

    const logs: WorkoutLog[] = [
      makeLog({
        id: 'log-1',
        completedAt: '2025-01-05T00:00:00Z',
        completed: true,
      }),
      makeLog({
        id: 'log-2',
        completedAt: '2025-01-10T00:00:00Z',
        completed: false,
      }),
    ]
    const result = getWorkoutsThisMonth(logs)
    expect(result).toBe(1)
  })
})

// ── getTotalWodCount ──────────────────────────────────────────

describe('getTotalWodCount', () => {
  test('returns 0 for empty logs', () => {
    const result = getTotalWodCount([])
    expect(result).toBe(0)
  })

  test('counts all completed workouts', () => {
    const logs: WorkoutLog[] = [
      makeLog({ id: 'log-1', completed: true }),
      makeLog({ id: 'log-2', completed: true }),
      makeLog({ id: 'log-3', completed: false }),
    ]
    const result = getTotalWodCount(logs)
    expect(result).toBe(2)
  })
})
