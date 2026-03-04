import { describe, it, expect } from 'vitest'
import {
  getMonthlyRecap,
  getYearlyRecap,
} from '../recaps'
import type { WorkoutLog } from '@/types/workout-log'

// ── helpers ─────────────────────────────────────────────────────

function makeLog(overrides: Partial<WorkoutLog> & { completedAt: string }): WorkoutLog {
  return {
    id: Math.random().toString(36).slice(2),
    programId: 'p1',
    weekNumber: 1,
    dayNumber: 1,
    completed: true,
    ...overrides,
  }
}

// ── Monthly Recap ──────────────────────────────────────────────

describe('getMonthlyRecap', () => {
  it('1 — counts total workouts in given month', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-01-05T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-15T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-25T10:00:00Z' }),
      makeLog({ completedAt: '2026-02-01T10:00:00Z' }), // different month
      makeLog({ completedAt: '2026-01-20T10:00:00Z', completed: false }), // not completed
    ]
    const recap = getMonthlyRecap(logs, 0, 2026) // month 0 = January
    expect(recap.totalWorkouts).toBe(3)
  })

  it('2 — counts total sets and reps from exercises', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: 'm1',
            movementName: 'Back Squat',
            sets: [
              { weight: 225, reps: 5, completed: true },
              { weight: 225, reps: 5, completed: true },
              { weight: 225, reps: 3, completed: true },
            ],
          },
        ],
      }),
      makeLog({
        completedAt: '2026-01-12T10:00:00Z',
        exercises: [
          {
            movementId: 'm2',
            movementName: 'Deadlift',
            sets: [
              { weight: 315, reps: 3, completed: true },
              { weight: 315, reps: 3, completed: true },
            ],
          },
        ],
      }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.totalSets).toBe(5)
    expect(recap.totalReps).toBe(19) // 5+5+3+3+3
  })

  it('3 — estimates total volume (sum of weight×reps for each completed set)', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: 'm1',
            movementName: 'Back Squat',
            sets: [
              { weight: 200, reps: 5, completed: true },    // 1000
              { weight: 200, reps: 5, completed: false },   // not completed → skip
              { weight: 200, reps: 5, completed: true },    // 1000
            ],
          },
          {
            movementId: 'm2',
            movementName: 'Bench Press',
            sets: [
              { weight: 135, reps: 10, completed: true },   // 1350
            ],
          },
        ],
      }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.estimatedVolumeLbs).toBe(3350)
  })

  it('4 — counts PRs hit in the month (movement best weight exceeds all prior months)', () => {
    const logs: WorkoutLog[] = [
      // Prior month: Back Squat max 200, Bench max 135
      makeLog({
        completedAt: '2025-12-10T10:00:00Z',
        exercises: [
          {
            movementId: 'm1',
            movementName: 'Back Squat',
            sets: [{ weight: 200, reps: 5, completed: true }],
          },
          {
            movementId: 'm2',
            movementName: 'Bench Press',
            sets: [{ weight: 135, reps: 5, completed: true }],
          },
        ],
      }),
      // Target month: Back Squat 225 (PR!), Bench 135 (no PR)
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          {
            movementId: 'm1',
            movementName: 'Back Squat',
            sets: [{ weight: 225, reps: 3, completed: true }],
          },
          {
            movementId: 'm2',
            movementName: 'Bench Press',
            sets: [{ weight: 135, reps: 5, completed: true }],
          },
        ],
      }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.prsHit).toBe(1) // only Back Squat
  })

  it('5 — identifies most frequently trained movement as topMovement', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-05T10:00:00Z',
        exercises: [
          { movementId: 'm1', movementName: 'Back Squat', sets: [{ weight: 200, reps: 5, completed: true }] },
          { movementId: 'm2', movementName: 'Bench Press', sets: [{ weight: 135, reps: 5, completed: true }] },
        ],
      }),
      makeLog({
        completedAt: '2026-01-10T10:00:00Z',
        exercises: [
          { movementId: 'm1', movementName: 'Back Squat', sets: [{ weight: 205, reps: 5, completed: true }] },
        ],
      }),
      makeLog({
        completedAt: '2026-01-15T10:00:00Z',
        exercises: [
          { movementId: 'm1', movementName: 'Back Squat', sets: [{ weight: 210, reps: 5, completed: true }] },
        ],
      }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.topMovement).toBe('Back Squat')
  })

  it('6 — calculates average RPE from logs with rpe set', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-01-05T10:00:00Z', rpe: 7 }),
      makeLog({ completedAt: '2026-01-10T10:00:00Z', rpe: 9 }),
      makeLog({ completedAt: '2026-01-15T10:00:00Z' }), // no RPE
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.averageRPE).toBe(8) // (7+9)/2
  })

  it('7 — counts unique active days (2 workouts same day = 1 active day)', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-01-05T08:00:00Z' }),
      makeLog({ completedAt: '2026-01-05T17:00:00Z' }), // same day
      makeLog({ completedAt: '2026-01-06T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-10T10:00:00Z' }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.activeDays).toBe(3)
  })

  it('8 — compares to previous month with workout delta and volume delta', () => {
    const logs: WorkoutLog[] = [
      // December 2025: 2 workouts, volume = 200*5 = 1000
      makeLog({
        completedAt: '2025-12-05T10:00:00Z',
        exercises: [{ movementId: 'm1', movementName: 'Squat', sets: [{ weight: 200, reps: 5, completed: true }] }],
      }),
      makeLog({ completedAt: '2025-12-15T10:00:00Z' }),
      // January 2026: 4 workouts, volume = 300*5 = 1500
      makeLog({
        completedAt: '2026-01-05T10:00:00Z',
        exercises: [{ movementId: 'm1', movementName: 'Squat', sets: [{ weight: 300, reps: 5, completed: true }] }],
      }),
      makeLog({ completedAt: '2026-01-10T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-15T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-20T10:00:00Z' }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.comparedToLastMonth).toEqual({
      workoutDelta: 2,   // 4 - 2
      volumeDelta: 500,   // 1500 - 1000
    })
  })

  it('9 — returns null comparison when previous month has no data', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-01-05T10:00:00Z' }),
    ]
    const recap = getMonthlyRecap(logs, 0, 2026)
    expect(recap.comparedToLastMonth).toBeNull()
  })
})

// ── Yearly Recap ───────────────────────────────────────────────

describe('getYearlyRecap', () => {
  it('10 — counts all completed workouts in year', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-03-01T10:00:00Z' }),
      makeLog({ completedAt: '2026-06-15T10:00:00Z' }),
      makeLog({ completedAt: '2026-09-20T10:00:00Z' }),
      makeLog({ completedAt: '2025-12-31T10:00:00Z' }), // wrong year
      makeLog({ completedAt: '2026-04-10T10:00:00Z', completed: false }), // not completed
    ]
    const recap = getYearlyRecap(logs, 2026)
    expect(recap.totalWorkouts).toBe(3)
  })

  it('11 — finds longest consecutive week streak within year', () => {
    // 2026-01-05 is a Monday (week 2 of 2026)
    // Create workouts in weeks 2, 3, 4 (3-week streak) then gap, then weeks 6, 7 (2-week streak)
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-01-05T10:00:00Z' }), // Mon week 2
      makeLog({ completedAt: '2026-01-12T10:00:00Z' }), // Mon week 3
      makeLog({ completedAt: '2026-01-19T10:00:00Z' }), // Mon week 4
      // gap week 5
      makeLog({ completedAt: '2026-02-02T10:00:00Z' }), // Mon week 6
      makeLog({ completedAt: '2026-02-09T10:00:00Z' }), // Mon week 7
    ]
    const recap = getYearlyRecap(logs, 2026)
    expect(recap.longestStreak).toBe(3)
  })

  it('12 — counts months with ≥1 workout (monthsActive)', () => {
    const logs: WorkoutLog[] = [
      makeLog({ completedAt: '2026-01-10T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-20T10:00:00Z' }), // same month
      makeLog({ completedAt: '2026-03-05T10:00:00Z' }),
      makeLog({ completedAt: '2026-06-15T10:00:00Z' }),
      makeLog({ completedAt: '2026-09-01T10:00:00Z' }),
    ]
    const recap = getYearlyRecap(logs, 2026)
    expect(recap.monthsActive).toBe(4) // Jan, Mar, Jun, Sep
  })

  it('13 — calculates average workouts per week (totalWorkouts / 52)', () => {
    // Generate exactly 52 workouts spread across 2026
    const logs: WorkoutLog[] = Array.from({ length: 52 }, (_, i) => {
      const month = Math.floor((i * 12) / 52)
      const day = (i % 28) + 1
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      return makeLog({ completedAt: `2026-${mm}-${dd}T10:00:00Z` })
    })
    const recap = getYearlyRecap(logs, 2026)
    expect(recap.averageWorkoutsPerWeek).toBe(1) // 52 / 52
  })

  it('14 — identifies best month by workout count', () => {
    const logs: WorkoutLog[] = [
      // January: 2 workouts
      makeLog({ completedAt: '2026-01-05T10:00:00Z' }),
      makeLog({ completedAt: '2026-01-15T10:00:00Z' }),
      // March: 5 workouts (best)
      makeLog({ completedAt: '2026-03-01T10:00:00Z' }),
      makeLog({ completedAt: '2026-03-05T10:00:00Z' }),
      makeLog({ completedAt: '2026-03-10T10:00:00Z' }),
      makeLog({ completedAt: '2026-03-15T10:00:00Z' }),
      makeLog({ completedAt: '2026-03-20T10:00:00Z' }),
      // June: 3 workouts
      makeLog({ completedAt: '2026-06-01T10:00:00Z' }),
      makeLog({ completedAt: '2026-06-10T10:00:00Z' }),
      makeLog({ completedAt: '2026-06-20T10:00:00Z' }),
    ]
    const recap = getYearlyRecap(logs, 2026)
    expect(recap.bestMonth).toEqual({ month: 2, workouts: 5 }) // month 2 = March (0-indexed)
  })
})
