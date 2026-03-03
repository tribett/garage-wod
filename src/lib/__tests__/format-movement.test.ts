import { describe, test, expect } from 'vitest'
import { formatMovementLine } from '../format-movement'
import type { Movement } from '@/types/program'

function mov(overrides: Partial<Movement> & { name: string }): Movement {
  return { id: '1', ...overrides }
}

describe('formatMovementLine', () => {
  test('name only', () => {
    expect(formatMovementLine(mov({ name: 'Pull-ups' }))).toBe('Pull-ups')
  })

  test('reps + name', () => {
    expect(formatMovementLine(mov({ name: 'Pull-ups', reps: 10 }))).toBe(
      '10 Pull-ups',
    )
  })

  test('sets x reps + name', () => {
    expect(
      formatMovementLine(mov({ name: 'Back Squat', sets: 5, reps: 3 })),
    ).toBe('5 x 3 Back Squat')
  })

  test('includes weight when present', () => {
    expect(
      formatMovementLine(
        mov({ name: 'Deadlift', sets: 3, reps: 5, weight: '315#' }),
      ),
    ).toBe('3 x 5 Deadlift (315#)')
  })

  test('includes distance when present', () => {
    expect(
      formatMovementLine(mov({ name: 'Run', distance: '400m' })),
    ).toBe('400m Run')
  })

  test('string reps (e.g. "max")', () => {
    expect(
      formatMovementLine(mov({ name: 'Push-ups', reps: 'max' })),
    ).toBe('max Push-ups')
  })

  test('duration-based movement', () => {
    expect(
      formatMovementLine(mov({ name: 'Plank Hold', duration: 60 })),
    ).toBe('60s Plank Hold')
  })

  test('reps + weight, no sets', () => {
    expect(
      formatMovementLine(
        mov({ name: 'Thrusters', reps: 21, weight: '95/65' }),
      ),
    ).toBe('21 Thrusters (95/65)')
  })
})
