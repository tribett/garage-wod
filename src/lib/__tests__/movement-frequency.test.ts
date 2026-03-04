import { describe, test, expect } from 'vitest'
import {
  categorizeMovement,
  getFrequencyBreakdown,
  getGaps,
  ALL_CATEGORIES,
  type MovementCategory,
} from '../movement-frequency'

describe('categorizeMovement', () => {
  test('Back Squat → squat', () => {
    expect(categorizeMovement('Back Squat')).toBe('squat')
  })

  test('Deadlift → hinge', () => {
    expect(categorizeMovement('Deadlift')).toBe('hinge')
  })

  test('Push-up → push', () => {
    expect(categorizeMovement('Push-up')).toBe('push')
  })

  test('Pull-up → pull', () => {
    expect(categorizeMovement('Pull-up')).toBe('pull')
  })

  test('Sit-up → core', () => {
    expect(categorizeMovement('Sit-up')).toBe('core')
  })

  test('Burpee → cardio', () => {
    expect(categorizeMovement('Burpee')).toBe('cardio')
  })

  test('Unknown Exercise → other', () => {
    expect(categorizeMovement('Unknown Exercise')).toBe('other')
  })

  test('DB Front Squat → squat (substring match)', () => {
    expect(categorizeMovement('DB Front Squat')).toBe('squat')
  })
})

describe('getFrequencyBreakdown', () => {
  test('empty logs → all zeros', () => {
    const result = getFrequencyBreakdown([])
    for (const cat of ALL_CATEGORIES) {
      expect(result[cat]).toBe(0)
    }
    expect(result.other).toBe(0)
  })

  test('counts unique categories per session', () => {
    const now = new Date().toISOString()
    const logs = [
      {
        completedAt: now,
        exercises: [
          { movementName: 'Back Squat' },
          { movementName: 'Front Squat' }, // same category, should only count once
          { movementName: 'Pull-up' },
        ],
      },
      {
        completedAt: now,
        exercises: [
          { movementName: 'Deadlift' },
          { movementName: 'Push-up' },
        ],
      },
    ]

    const result = getFrequencyBreakdown(logs)
    expect(result.squat).toBe(1) // 1 session had squats
    expect(result.pull).toBe(1) // 1 session had pulls
    expect(result.hinge).toBe(1) // 1 session had hinges
    expect(result.push).toBe(1) // 1 session had pushes
    expect(result.cardio).toBe(0)
    expect(result.core).toBe(0)
    expect(result.carry).toBe(0)
  })
})

describe('getGaps', () => {
  test('returns categories below threshold', () => {
    const breakdown: Record<MovementCategory, number> = {
      squat: 5,
      hinge: 1,
      push: 3,
      pull: 0,
      core: 0,
      cardio: 4,
      carry: 1,
      other: 0,
    }
    const gaps = getGaps(breakdown, 2)
    expect(gaps).toContain('hinge')
    expect(gaps).toContain('pull')
    expect(gaps).toContain('core')
    expect(gaps).toContain('carry')
    expect(gaps).not.toContain('squat')
    expect(gaps).not.toContain('push')
    expect(gaps).not.toContain('cardio')
  })

  test('all categories above threshold → empty', () => {
    const breakdown: Record<MovementCategory, number> = {
      squat: 5,
      hinge: 3,
      push: 4,
      pull: 2,
      core: 3,
      cardio: 6,
      carry: 2,
      other: 0,
    }
    const gaps = getGaps(breakdown, 2)
    expect(gaps).toHaveLength(0)
  })
})
