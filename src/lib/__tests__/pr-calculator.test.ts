import { describe, test, expect } from 'vitest'
import { detectNewPRs, getMovementPR, getAllPRs } from '../pr-calculator'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: 'log-1',
    programId: 'prog-1',
    weekNumber: 1,
    dayNumber: 1,
    completedAt: '2025-01-01T00:00:00Z',
    completed: true,
    ...overrides,
  }
}

const HISTORY_WITH_SQUAT: WorkoutLog[] = [
  makeLog({
    exercises: [
      {
        movementId: 'sq-1',
        movementName: 'Back Squat',
        sets: [
          { weight: 185, reps: 5, completed: true },
          { weight: 200, reps: 3, completed: true },
        ],
      },
    ],
  }),
]

describe('detectNewPRs', () => {
  test('returns PR when weight exceeds previous best', () => {
    const pr = detectNewPRs('Back Squat', 225, 5, HISTORY_WITH_SQUAT)
    expect(pr).not.toBeNull()
    expect(pr!.value).toBe(225)
    expect(pr!.movementName).toBe('Back Squat')
  })

  test('returns null when weight does not beat previous best', () => {
    const pr = detectNewPRs('Back Squat', 185, 5, HISTORY_WITH_SQUAT)
    expect(pr).toBeNull()
  })

  test('returns PR for first-time movement (no history)', () => {
    const pr = detectNewPRs('Deadlift', 315, 1, [])
    expect(pr).not.toBeNull()
    expect(pr!.value).toBe(315)
    expect(pr!.movementName).toBe('Deadlift')
  })

  test('includes unit when specified', () => {
    const pr = detectNewPRs('Bench Press', 100, 5, [], 'kg')
    expect(pr).not.toBeNull()
    expect(pr!.unit).toBe('kg')
  })

  test('is case-insensitive for movement name matching', () => {
    const pr = detectNewPRs('back squat', 225, 5, HISTORY_WITH_SQUAT)
    expect(pr).not.toBeNull()
    expect(pr!.value).toBe(225)
  })
})

describe('getMovementPR', () => {
  test('returns the heaviest completed set for a movement', () => {
    const pr = getMovementPR('Back Squat', HISTORY_WITH_SQUAT)
    expect(pr).not.toBeNull()
    expect(pr!.value).toBe(200)
  })

  test('returns null for unknown movement', () => {
    const pr = getMovementPR('Overhead Press', HISTORY_WITH_SQUAT)
    expect(pr).toBeNull()
  })

  test('ignores incomplete sets', () => {
    const history: WorkoutLog[] = [
      makeLog({
        exercises: [
          {
            movementId: 'bp-1',
            movementName: 'Bench Press',
            sets: [
              { weight: 225, reps: 1, completed: false },
              { weight: 185, reps: 5, completed: true },
            ],
          },
        ],
      }),
    ]
    const pr = getMovementPR('Bench Press', history)
    expect(pr!.value).toBe(185)
  })
})

describe('getAllPRs', () => {
  test('returns PRs for all movements across logs', () => {
    const history: WorkoutLog[] = [
      makeLog({
        exercises: [
          {
            movementId: 'sq-1',
            movementName: 'Back Squat',
            sets: [{ weight: 200, reps: 5, completed: true }],
          },
          {
            movementId: 'bp-1',
            movementName: 'Bench Press',
            sets: [{ weight: 185, reps: 3, completed: true }],
          },
        ],
      }),
      makeLog({
        id: 'log-2',
        completedAt: '2025-01-08T00:00:00Z',
        exercises: [
          {
            movementId: 'sq-1',
            movementName: 'Back Squat',
            sets: [{ weight: 225, reps: 3, completed: true }],
          },
        ],
      }),
    ]

    const prs = getAllPRs(history)
    expect(prs.size).toBe(2)
    expect(prs.get('back squat')!.value).toBe(225)
    expect(prs.get('bench press')!.value).toBe(185)
  })

  test('returns empty map for no history', () => {
    const prs = getAllPRs([])
    expect(prs.size).toBe(0)
  })
})
