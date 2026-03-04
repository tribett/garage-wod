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
    // Should match "Dumbbell Thruster" via abbreviation expansion
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

  // ── New video entries ─────────────────────────────────────
  test('returns video ID for newly added movements', () => {
    expect(getMovementVideoId('Row')).toBeTruthy()
    expect(getMovementVideoId('Wall Walk')).toBeTruthy()
    expect(getMovementVideoId('Ring Row')).toBeTruthy()
    expect(getMovementVideoId('Back Extension')).toBeTruthy()
    expect(getMovementVideoId('Box Step-up')).toBeTruthy()
    expect(getMovementVideoId('Single-under')).toBeTruthy()
    expect(getMovementVideoId('Goblet Squat')).toBeTruthy()
    expect(getMovementVideoId('Step-up')).toBeTruthy()
  })

  // ── Abbreviation expansion ────────────────────────────────
  test('expands KB abbreviation to match Kettlebell Swing', () => {
    const id = getMovementVideoId('KB Swings')
    const expected = getMovementVideoId('Kettlebell Swing')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('expands DB abbreviation to match Dumbbell movements', () => {
    const id = getMovementVideoId('DB Snatch')
    const expected = getMovementVideoId('Dumbbell Snatch')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('expands DB Clean to match Dumbbell Clean', () => {
    const id = getMovementVideoId('DB Cleans')
    const expected = getMovementVideoId('Dumbbell Clean')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('maps Ground-to-Overhead to Clean and Jerk video', () => {
    const id = getMovementVideoId('Ground-to-Overhead')
    const expected = getMovementVideoId('Clean and Jerk')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('maps G2OH abbreviation to Clean and Jerk video', () => {
    const id = getMovementVideoId('G2OH')
    const expected = getMovementVideoId('Clean and Jerk')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('maps GTOH abbreviation to Clean and Jerk video', () => {
    const id = getMovementVideoId('GTOH')
    const expected = getMovementVideoId('Clean and Jerk')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('expands T2B to Toes-to-Bar', () => {
    const id = getMovementVideoId('T2B')
    const expected = getMovementVideoId('Toes-to-Bar')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('expands C2B to Chest-to-Bar Pull-up', () => {
    const id = getMovementVideoId('C2B')
    const expected = getMovementVideoId('Chest-to-Bar Pull-up')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('expands DU to Double-under', () => {
    const id = getMovementVideoId('DU')
    const expected = getMovementVideoId('Double-under')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  // ── Real-world program movement names ─────────────────────
  test('matches "DB Hang Power Cleans" via expansion + substring', () => {
    const id = getMovementVideoId('DB Hang Power Cleans')
    expect(id).toBeTruthy()
  })

  test('matches "DB Box Step-ups" via expansion + substring', () => {
    const id = getMovementVideoId('DB Box Step-ups')
    expect(id).toBeTruthy()
  })

  test('matches rowing variants via substring', () => {
    expect(getMovementVideoId('cal Row')).toBeTruthy()
    expect(getMovementVideoId('500m Row')).toBeTruthy()
  })

  test('matches "Goblet Squats" (plural) to Goblet Squat', () => {
    const id = getMovementVideoId('Goblet Squats')
    const expected = getMovementVideoId('Goblet Squat')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('matches "Wall Walks" (plural) to Wall Walk', () => {
    const id = getMovementVideoId('Wall Walks')
    const expected = getMovementVideoId('Wall Walk')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('matches "Back Extensions" (plural) to Back Extension', () => {
    const id = getMovementVideoId('Back Extensions')
    const expected = getMovementVideoId('Back Extension')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('matches "Ring Rows" (plural) to Ring Row', () => {
    const id = getMovementVideoId('Ring Rows')
    const expected = getMovementVideoId('Ring Row')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })

  test('matches "Single-unders" (plural) to Single-under', () => {
    const id = getMovementVideoId('Single-unders')
    const expected = getMovementVideoId('Single-under')
    expect(id).toBeTruthy()
    expect(id).toBe(expected)
  })
})
