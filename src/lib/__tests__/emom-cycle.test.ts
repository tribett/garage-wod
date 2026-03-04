import { describe, test, expect } from 'vitest'
import { getCurrentMovement, getMovementLabel } from '@/lib/emom-cycle'

describe('getCurrentMovement', () => {
  test('returns null for empty movements array', () => {
    expect(getCurrentMovement([], 1)).toBeNull()
  })

  test('returns null for round 0', () => {
    expect(getCurrentMovement([{ name: 'Cleans' }], 0)).toBeNull()
  })

  test('returns null for negative round', () => {
    expect(getCurrentMovement([{ name: 'Cleans' }], -1)).toBeNull()
  })

  test('with 1 movement, always returns that movement for any round', () => {
    const movements = [{ name: 'Cleans' }]
    expect(getCurrentMovement(movements, 1)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 2)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 5)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 100)).toEqual({ name: 'Cleans', index: 0 })
  })

  test('with 2 movements, alternates between them', () => {
    const movements = [{ name: 'Cleans' }, { name: 'Burpees' }]
    expect(getCurrentMovement(movements, 1)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 2)).toEqual({ name: 'Burpees', index: 1 })
    expect(getCurrentMovement(movements, 3)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 4)).toEqual({ name: 'Burpees', index: 1 })
  })

  test('with 3 movements, cycles through all three', () => {
    const movements = [
      { name: 'Cleans' },
      { name: 'Burpees' },
      { name: 'Box Jumps' },
    ]
    expect(getCurrentMovement(movements, 1)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 2)).toEqual({ name: 'Burpees', index: 1 })
    expect(getCurrentMovement(movements, 3)).toEqual({ name: 'Box Jumps', index: 2 })
    expect(getCurrentMovement(movements, 4)).toEqual({ name: 'Cleans', index: 0 })
    expect(getCurrentMovement(movements, 5)).toEqual({ name: 'Burpees', index: 1 })
    expect(getCurrentMovement(movements, 6)).toEqual({ name: 'Box Jumps', index: 2 })
  })
})

describe('getMovementLabel', () => {
  test('returns empty string for empty movements', () => {
    expect(getMovementLabel([], 1, 10)).toBe('')
  })

  test('returns empty string for round 0', () => {
    expect(getMovementLabel([{ name: 'Cleans' }], 0, 10)).toBe('')
  })

  test('with single movement, returns just the name (no round prefix)', () => {
    expect(getMovementLabel([{ name: 'Cleans' }], 1, 10)).toBe('Cleans')
    expect(getMovementLabel([{ name: 'Cleans' }], 5, 10)).toBe('Cleans')
  })

  test('with multiple movements, returns "Round X/Y: MovementName"', () => {
    const movements = [{ name: 'Cleans' }, { name: 'Burpees' }]
    expect(getMovementLabel(movements, 1, 10)).toBe('Round 1/10: Cleans')
    expect(getMovementLabel(movements, 2, 10)).toBe('Round 2/10: Burpees')
    expect(getMovementLabel(movements, 3, 10)).toBe('Round 3/10: Cleans')
  })

  test('with 3 movements, cycles correctly in label', () => {
    const movements = [
      { name: 'Cleans' },
      { name: 'Burpees' },
      { name: 'Box Jumps' },
    ]
    expect(getMovementLabel(movements, 1, 9)).toBe('Round 1/9: Cleans')
    expect(getMovementLabel(movements, 4, 9)).toBe('Round 4/9: Cleans')
    expect(getMovementLabel(movements, 9, 9)).toBe('Round 9/9: Box Jumps')
  })
})
