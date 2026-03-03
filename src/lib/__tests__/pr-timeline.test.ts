import { describe, test, expect } from 'vitest'
import { buildPRTimeline } from '../pr-timeline'
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

describe('buildPRTimeline', () => {
  test('returns empty array with no exercises', () => {
    expect(buildPRTimeline([])).toEqual([])
  })

  test('builds timeline of PRs from logs', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Squat',
            sets: [{ weight: 200, reps: 5, completed: true }],
          },
        ],
      }),
      makeLog({
        completedAt: '2026-02-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Squat',
            sets: [{ weight: 225, reps: 5, completed: true }],
          },
        ],
      }),
    ]
    const timeline = buildPRTimeline(logs)
    expect(timeline).toHaveLength(2)
    expect(timeline[0].weight).toBe(200)
    expect(timeline[1].weight).toBe(225)
  })

  test('only includes new PRs (progressive increases)', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Bench',
            sets: [{ weight: 185, reps: 5, completed: true }],
          },
        ],
      }),
      makeLog({
        completedAt: '2026-02-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Bench',
            sets: [{ weight: 175, reps: 5, completed: true }], // NOT a PR
          },
        ],
      }),
      makeLog({
        completedAt: '2026-03-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Bench',
            sets: [{ weight: 200, reps: 5, completed: true }],
          },
        ],
      }),
    ]
    const timeline = buildPRTimeline(logs)
    expect(timeline).toHaveLength(2) // 185 and 200, not 175
    expect(timeline[0].weight).toBe(185)
    expect(timeline[1].weight).toBe(200)
  })

  test('filters by movement name', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Squat',
            sets: [{ weight: 315, reps: 5, completed: true }],
          },
          {
            movementId: '2',
            movementName: 'Bench',
            sets: [{ weight: 185, reps: 5, completed: true }],
          },
        ],
      }),
    ]
    const squatTimeline = buildPRTimeline(logs, 'Squat')
    expect(squatTimeline).toHaveLength(1)
    expect(squatTimeline[0].movementName).toBe('Squat')
  })

  test('entries are sorted chronologically', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-03-01T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Deadlift',
            sets: [{ weight: 405, reps: 1, completed: true }],
          },
        ],
      }),
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'Deadlift',
            sets: [{ weight: 365, reps: 1, completed: true }],
          },
        ],
      }),
    ]
    const timeline = buildPRTimeline(logs)
    expect(timeline[0].date).toBe('2026-01-01T10:00:00Z')
    expect(timeline[1].date).toBe('2026-03-01T10:00:00Z')
  })

  test('skips incomplete sets', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: '1',
            movementName: 'OHP',
            sets: [{ weight: 135, reps: 5, completed: false }],
          },
        ],
      }),
    ]
    const timeline = buildPRTimeline(logs)
    expect(timeline).toHaveLength(0)
  })
})
