import { describe, test, expect } from 'vitest'
import {
  parsePercentage,
  calculateLoadFromPercentage,
  resolveWeight,
} from '../percentage-loader'
import { estimate1RM } from '../one-rm-calculator'

describe('parsePercentage', () => {
  test('parses "80%" to { percentage: 80 }', () => {
    expect(parsePercentage('80%')).toEqual({ percentage: 80 })
  })

  test('parses "@ 75%" to { percentage: 75 }', () => {
    expect(parsePercentage('@ 75%')).toEqual({ percentage: 75 })
  })

  test('parses "80% 1RM" to { percentage: 80 }', () => {
    expect(parsePercentage('80% 1RM')).toEqual({ percentage: 80 })
  })

  test('returns null for plain number "185"', () => {
    expect(parsePercentage('185')).toBeNull()
  })

  test('returns null for non-percentage text "heavy"', () => {
    expect(parsePercentage('heavy')).toBeNull()
  })
})

describe('calculateLoadFromPercentage', () => {
  test('80% of 315 rounds to nearest 5 → 250', () => {
    // raw: 0.80 × 315 = 252, rounded to nearest 5 → 250
    expect(calculateLoadFromPercentage(80, 315, 5)).toBe(250)
  })

  test('70% of 200 rounds to nearest 5 → 140', () => {
    // raw: 0.70 × 200 = 140, already multiple of 5
    expect(calculateLoadFromPercentage(70, 200, 5)).toBe(140)
  })

  test('85% of 300 rounds to nearest 2.5 → 255', () => {
    // raw: 0.85 × 300 = 255, already multiple of 2.5
    expect(calculateLoadFromPercentage(85, 300, 2.5)).toBe(255)
  })
})

describe('resolveWeight', () => {
  test('resolves percentage with known PR', () => {
    const prs = new Map<string, { weight: number; reps: number }>()
    prs.set('back squat', { weight: 315, reps: 1 })

    const result = resolveWeight('80%', 'Back Squat', prs, estimate1RM, 5)
    expect(result).not.toBeNull()
    // 1RM of 315×1 = 315, 80% = 252 → rounds to 250
    expect(result!.calculated).toBe(250)
    expect(result!.display).toBe('250')
  })

  test('returns null for unknown movement', () => {
    const prs = new Map<string, { weight: number; reps: number }>()
    const result = resolveWeight('80%', 'Unknown', prs, estimate1RM, 5)
    expect(result).toBeNull()
  })

  test('returns null for non-percentage weight string', () => {
    const prs = new Map<string, { weight: number; reps: number }>()
    prs.set('back squat', { weight: 315, reps: 1 })

    const result = resolveWeight('heavy', 'Back Squat', prs, estimate1RM, 5)
    expect(result).toBeNull()
  })
})
