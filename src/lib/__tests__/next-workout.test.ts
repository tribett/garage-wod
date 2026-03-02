import type { Program } from '@/types/program'
import type { WorkoutLog } from '@/types/workout-log'
import { findNextWorkout } from '../next-workout'

const MINI_PROGRAM: Program = {
  id: 'test-program',
  name: 'Test Program',
  author: 'Test',
  description: 'A tiny test program',
  version: '1.0',
  phases: [
    {
      name: 'Phase 1',
      description: 'Test phase',
      weekStart: 1,
      weekEnd: 2,
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              dayNumber: 1,
              name: 'Monday WOD',
              blocks: [{ type: 'wod', name: 'WOD A', movements: [] }],
            },
            {
              dayNumber: 3,
              name: 'Wednesday WOD',
              blocks: [{ type: 'wod', name: 'WOD B', movements: [] }],
            },
            {
              dayNumber: 5,
              name: 'Friday WOD',
              blocks: [{ type: 'wod', name: 'WOD C', movements: [] }],
            },
          ],
        },
        {
          weekNumber: 2,
          days: [
            {
              dayNumber: 1,
              name: 'Week 2 Monday',
              blocks: [{ type: 'wod', name: 'WOD D', movements: [] }],
            },
          ],
        },
      ],
    },
  ],
}

describe('findNextWorkout', () => {
  test('returns the next day in the current week when today has no workout', () => {
    // Position is week 1, day 2 (Tuesday — no workout). Next should be day 3 (Wednesday)
    const result = findNextWorkout(MINI_PROGRAM, { week: 1, day: 2 }, [])
    expect(result).not.toBeNull()
    expect(result!.day.name).toBe('Wednesday WOD')
    expect(result!.weekNumber).toBe(1)
  })

  test('returns the next uncompleted day, skipping completed ones', () => {
    const logs: WorkoutLog[] = [
      {
        id: 'log-1',
        programId: 'test-program',
        weekNumber: 1,
        dayNumber: 3,
        completedAt: '2026-03-01T12:00:00Z',
        completed: true,
      },
    ]
    // Position is day 2 (Tuesday). Day 3 is completed, so next should be day 5 (Friday)
    const result = findNextWorkout(MINI_PROGRAM, { week: 1, day: 2 }, logs)
    expect(result).not.toBeNull()
    expect(result!.day.name).toBe('Friday WOD')
  })

  test('returns the first day of the next week when current week is exhausted', () => {
    const logs: WorkoutLog[] = [
      { id: 'l1', programId: 'test-program', weekNumber: 1, dayNumber: 1, completedAt: '2026-03-01T12:00:00Z', completed: true },
      { id: 'l2', programId: 'test-program', weekNumber: 1, dayNumber: 3, completedAt: '2026-03-01T12:00:00Z', completed: true },
      { id: 'l3', programId: 'test-program', weekNumber: 1, dayNumber: 5, completedAt: '2026-03-01T12:00:00Z', completed: true },
    ]
    // All week 1 days completed, position still in week 1
    const result = findNextWorkout(MINI_PROGRAM, { week: 1, day: 5 }, logs)
    expect(result).not.toBeNull()
    expect(result!.day.name).toBe('Week 2 Monday')
    expect(result!.weekNumber).toBe(2)
  })

  test('returns null when all workouts in the program are completed', () => {
    const logs: WorkoutLog[] = [
      { id: 'l1', programId: 'test-program', weekNumber: 1, dayNumber: 1, completedAt: '2026-03-01T12:00:00Z', completed: true },
      { id: 'l2', programId: 'test-program', weekNumber: 1, dayNumber: 3, completedAt: '2026-03-01T12:00:00Z', completed: true },
      { id: 'l3', programId: 'test-program', weekNumber: 1, dayNumber: 5, completedAt: '2026-03-01T12:00:00Z', completed: true },
      { id: 'l4', programId: 'test-program', weekNumber: 2, dayNumber: 1, completedAt: '2026-03-01T12:00:00Z', completed: true },
    ]
    const result = findNextWorkout(MINI_PROGRAM, { week: 2, day: 1 }, logs)
    expect(result).toBeNull()
  })

  test('returns null when program is null', () => {
    const result = findNextWorkout(null, { week: 1, day: 1 }, [])
    expect(result).toBeNull()
  })
})
