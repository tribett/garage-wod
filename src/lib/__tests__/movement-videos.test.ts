import { describe, test, expect } from 'vitest'
import { getMovementVideoId } from '../movement-videos'

describe('getMovementVideoId', () => {
  test('returns video ID for exact match', () => {
    const id = getMovementVideoId('Air Squat')
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
  })

  test('is case-insensitive', () => {
    const id1 = getMovementVideoId('Air Squat')
    const id2 = getMovementVideoId('air squat')
    expect(id1).toBe(id2)
  })

  test('handles plural/singular variation', () => {
    // "Air Squats" should match "Air Squat"
    const id = getMovementVideoId('Air Squats')
    expect(id).toBeTruthy()
  })

  test('handles prefix variations like "DB Thrusters"', () => {
    // Should match "Thruster" even with prefix
    const id = getMovementVideoId('DB Thrusters')
    expect(id).toBeTruthy()
  })

  test('returns null for unrecognized movement', () => {
    expect(getMovementVideoId('Flamingo Stand')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getMovementVideoId('')).toBeNull()
  })

  test('returns null for whitespace-only string', () => {
    expect(getMovementVideoId('   ')).toBeNull()
  })
})
