import { describe, test, expect } from 'vitest'
import { RPE_LABELS, getAverageRPE, getTrainingLoadWarning } from '../rpe'

// ── RPE_LABELS ──────────────────────────────────────────────────

describe('RPE_LABELS', () => {
  test('has entries for levels 1 through 5', () => {
    for (let i = 1; i <= 5; i++) {
      expect(RPE_LABELS[i]).toBeDefined()
    }
  })

  test('each entry has label, emoji, and color', () => {
    for (let i = 1; i <= 5; i++) {
      const entry = RPE_LABELS[i]
      expect(entry).toHaveProperty('label')
      expect(entry).toHaveProperty('emoji')
      expect(entry).toHaveProperty('color')
      expect(typeof entry.label).toBe('string')
      expect(typeof entry.emoji).toBe('string')
      expect(typeof entry.color).toBe('string')
    }
  })
})

// ── getAverageRPE ───────────────────────────────────────────────

describe('getAverageRPE', () => {
  test('returns correct average for rated logs', () => {
    expect(getAverageRPE([{ rpe: 3 }, { rpe: 4 }, { rpe: 5 }])).toBe(4)
  })

  test('returns null for empty array', () => {
    expect(getAverageRPE([])).toBeNull()
  })

  test('filters out logs with undefined rpe', () => {
    expect(getAverageRPE([{ rpe: undefined }, { rpe: 3 }])).toBe(3)
  })

  test('returns null when all rpe values are undefined', () => {
    expect(getAverageRPE([{ rpe: undefined }, { rpe: undefined }])).toBeNull()
  })

  test('rounds to one decimal place', () => {
    // (3 + 4) / 2 = 3.5
    expect(getAverageRPE([{ rpe: 3 }, { rpe: 4 }])).toBe(3.5)
  })
})

// ── getTrainingLoadWarning ──────────────────────────────────────

describe('getTrainingLoadWarning', () => {
  test('returns high load warning when avg >= 4.5', () => {
    expect(getTrainingLoadWarning([5, 5, 5])).toBe(
      'High training load — consider a recovery day',
    )
  })

  test('returns elevated warning when avg >= 3.8 and < 4.5', () => {
    expect(getTrainingLoadWarning([4, 4, 3.5])).toBe(
      'Training load is elevated — listen to your body',
    )
  })

  test('returns null when avg is below thresholds', () => {
    expect(getTrainingLoadWarning([2, 3, 2])).toBeNull()
  })

  test('returns null when fewer than 3 entries', () => {
    expect(getTrainingLoadWarning([5, 5])).toBeNull()
  })
})
