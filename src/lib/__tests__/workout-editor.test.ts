import { describe, test, expect } from 'vitest'
import { mergeWorkoutUpdate, canEditLog } from '../workout-editor'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> & { completedAt: string }): WorkoutLog {
  return {
    id: 'log-1',
    programId: 'test',
    weekNumber: 1,
    dayNumber: 1,
    completed: true,
    ...overrides,
  }
}

describe('mergeWorkoutUpdate', () => {
  test('preserves original id and programId when not in updates', () => {
    const existing = makeLog({ completedAt: '2026-01-10T10:00:00Z' })
    const result = mergeWorkoutUpdate(existing, { notes: 'Updated' })
    expect(result.id).toBe('log-1')
    expect(result.programId).toBe('test')
    expect(result.completedAt).toBe('2026-01-10T10:00:00Z')
  })

  test('updates notes field', () => {
    const existing = makeLog({ completedAt: '2026-01-10T10:00:00Z', notes: 'Old' })
    const result = mergeWorkoutUpdate(existing, { notes: 'New notes' })
    expect(result.notes).toBe('New notes')
  })

  test('updates exercises array (full replacement)', () => {
    const existing = makeLog({
      completedAt: '2026-01-10T10:00:00Z',
      exercises: [{ movementId: '1', movementName: 'Squat', sets: [{ weight: 200, reps: 5, completed: true }] }],
    })
    const newExercises = [{ movementId: '1', movementName: 'Squat', sets: [{ weight: 225, reps: 5, completed: true }] }]
    const result = mergeWorkoutUpdate(existing, { exercises: newExercises })
    expect(result.exercises![0].sets[0].weight).toBe(225)
  })

  test('updates wodResult', () => {
    const existing = makeLog({ completedAt: '2026-01-10T10:00:00Z' })
    const result = mergeWorkoutUpdate(existing, {
      wodResult: { type: 'amrap', score: '5+3', scaling: 'Rx' },
    })
    expect(result.wodResult?.score).toBe('5+3')
  })

  test('does not overwrite fields with undefined', () => {
    const existing = makeLog({ completedAt: '2026-01-10T10:00:00Z', notes: 'Keep me' })
    const result = mergeWorkoutUpdate(existing, {})
    expect(result.notes).toBe('Keep me')
  })
})

describe('canEditLog', () => {
  test('returns true for completed logs', () => {
    expect(canEditLog(makeLog({ completedAt: '2026-01-10T10:00:00Z', completed: true }))).toBe(true)
  })

  test('returns false for incomplete logs', () => {
    expect(canEditLog(makeLog({ completedAt: '2026-01-10T10:00:00Z', completed: false }))).toBe(false)
  })
})
