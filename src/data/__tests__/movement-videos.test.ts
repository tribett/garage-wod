import { describe, test, expect } from 'vitest'
import { MOVEMENT_VIDEOS } from '../movement-videos'

describe('MOVEMENT_VIDEOS', () => {
  test('is a non-empty record', () => {
    expect(Object.keys(MOVEMENT_VIDEOS).length).toBeGreaterThan(0)
  })

  test('contains at least 40 movements', () => {
    expect(Object.keys(MOVEMENT_VIDEOS).length).toBeGreaterThanOrEqual(40)
  })

  test('contains essential CrossFit movements', () => {
    const required = [
      'Air Squat',
      'Thruster',
      'Pull-up',
      'Deadlift',
      'Clean',
      'Snatch',
      'Push-up',
      'Burpee',
    ]
    for (const name of required) {
      expect(MOVEMENT_VIDEOS).toHaveProperty(name)
    }
  })

  test('every value is a non-empty string (YouTube ID)', () => {
    for (const [name, id] of Object.entries(MOVEMENT_VIDEOS)) {
      expect(id, `${name} should have a non-empty video ID`).toBeTruthy()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThanOrEqual(5)
    }
  })
})
