import { describe, test, expect } from 'vitest'
import { estimate1RM, getPercentages } from '../one-rm-calculator'

describe('estimate1RM', () => {
  test('single rep returns same weight', () => {
    expect(estimate1RM(315, 1)).toBe(315)
  })

  test('uses Epley formula for multiple reps', () => {
    // Epley: weight × (1 + reps/30)
    // 225 × (1 + 5/30) = 225 × 1.1667 = 262.5 → 263
    expect(estimate1RM(225, 5)).toBe(263)
  })

  test('calculates correctly for high reps', () => {
    // 135 × (1 + 10/30) = 135 × 1.3333 = 180
    expect(estimate1RM(135, 10)).toBe(180)
  })

  test('returns 0 for 0 weight', () => {
    expect(estimate1RM(0, 5)).toBe(0)
  })

  test('returns 0 for 0 reps', () => {
    expect(estimate1RM(225, 0)).toBe(0)
  })
})

describe('getPercentages', () => {
  test('returns entries from 50% to 100%', () => {
    const entries = getPercentages(300)
    expect(entries.length).toBeGreaterThanOrEqual(6)
    expect(entries[0].percentage).toBe(50)
    expect(entries[entries.length - 1].percentage).toBe(100)
  })

  test('calculates correct weights', () => {
    const entries = getPercentages(300)
    const at70 = entries.find((e) => e.percentage === 70)
    expect(at70).toBeTruthy()
    expect(at70!.weight).toBe(210) // 300 × 0.70
  })

  test('rounds to nearest integer', () => {
    const entries = getPercentages(315)
    const at85 = entries.find((e) => e.percentage === 85)
    expect(at85!.weight).toBe(Math.round(315 * 0.85)) // 267.75 → 268
  })

  test('returns 0 weights for 0 1RM', () => {
    const entries = getPercentages(0)
    for (const entry of entries) {
      expect(entry.weight).toBe(0)
    }
  })
})
