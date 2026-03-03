import { describe, test, expect } from 'vitest'
import { getScalingOptions } from '../movement-scaling'

describe('getScalingOptions', () => {
  test('returns options for exact match', () => {
    const options = getScalingOptions('Pull-up')
    expect(options).toBeTruthy()
    expect(Array.isArray(options)).toBe(true)
    expect(options!.length).toBeGreaterThanOrEqual(2)
  })

  test('is case-insensitive', () => {
    const opt1 = getScalingOptions('Pull-up')
    const opt2 = getScalingOptions('pull-up')
    expect(opt1).toEqual(opt2)
  })

  test('handles plural variation', () => {
    const options = getScalingOptions('Pull-ups')
    expect(options).toBeTruthy()
  })

  test('returns null for unknown movement', () => {
    expect(getScalingOptions('Flamingo Press')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getScalingOptions('')).toBeNull()
  })
})
