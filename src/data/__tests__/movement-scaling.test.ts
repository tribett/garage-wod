import { describe, test, expect } from 'vitest'
import { MOVEMENT_SCALING } from '../movement-scaling'

describe('MOVEMENT_SCALING', () => {
  test('is a non-empty record', () => {
    expect(Object.keys(MOVEMENT_SCALING).length).toBeGreaterThan(0)
  })

  test('contains at least 25 movements', () => {
    expect(Object.keys(MOVEMENT_SCALING).length).toBeGreaterThanOrEqual(25)
  })

  test('contains key CrossFit movements', () => {
    const required = [
      'Pull-up',
      'Handstand Push-up',
      'Muscle-up',
      'Double-under',
      'Pistol',
    ]
    for (const name of required) {
      expect(MOVEMENT_SCALING, `${name} should be in scaling map`).toHaveProperty(name)
    }
  })

  test('each entry has at least 2 scaling options', () => {
    for (const [name, options] of Object.entries(MOVEMENT_SCALING)) {
      expect(Array.isArray(options), `${name} options should be an array`).toBe(true)
      expect(options.length, `${name} should have at least 2 options`).toBeGreaterThanOrEqual(2)
    }
  })

  test('scaling options are all non-empty strings', () => {
    for (const [name, options] of Object.entries(MOVEMENT_SCALING)) {
      for (const opt of options) {
        expect(typeof opt, `${name} option should be a string`).toBe('string')
        expect(opt.length, `${name} option should be non-empty`).toBeGreaterThan(0)
      }
    }
  })
})
