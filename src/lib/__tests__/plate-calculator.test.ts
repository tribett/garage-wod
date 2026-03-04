import { describe, it, expect } from 'vitest'
import {
  calculatePlates,
  formatPlateLoadout,
  PLATE_COLORS,
} from '@/lib/plate-calculator'

describe('calculatePlates', () => {
  it('returns empty perSide when target equals bar weight (45 lbs)', () => {
    const result = calculatePlates(45)
    expect(result.targetWeight).toBe(45)
    expect(result.barWeight).toBe(45)
    expect(result.perSide).toEqual([])
    expect(result.totalLoaded).toBe(45)
    expect(result.remainder).toBe(0)
  })

  it('calculates single plate pair (135 lbs → one 45 per side)', () => {
    const result = calculatePlates(135)
    expect(result.perSide).toEqual([
      { weight: 45, count: 1, color: '#3b82f6' },
    ])
    expect(result.totalLoaded).toBe(135)
    expect(result.remainder).toBe(0)
  })

  it('calculates mixed plates (225 lbs → two 45s per side, totalLoaded=225)', () => {
    const result = calculatePlates(225)
    expect(result.perSide).toEqual([
      { weight: 45, count: 2, color: '#3b82f6' },
    ])
    expect(result.totalLoaded).toBe(225)
    expect(result.remainder).toBe(0)
  })

  it('handles odd weights with remainder (227 lbs → loads 225, remainder 2)', () => {
    const result = calculatePlates(227)
    expect(result.totalLoaded).toBe(225)
    expect(result.remainder).toBe(2)
    expect(result.perSide).toEqual([
      { weight: 45, count: 2, color: '#3b82f6' },
    ])
  })

  it('works with kg plates and 20kg bar', () => {
    const result = calculatePlates(100, 20, 'kg')
    // 100 - 20 = 80kg to load, 40kg per side
    // 25 + 15 = 40 per side
    expect(result.barWeight).toBe(20)
    expect(result.perSide).toEqual([
      { weight: 25, count: 1, color: '#22c55e' },
      { weight: 15, count: 1, color: '#f97316' },
    ])
    expect(result.totalLoaded).toBe(100)
    expect(result.remainder).toBe(0)
  })

  it('uses custom available plates when provided', () => {
    const result = calculatePlates(95, 45, 'lbs', [25, 10])
    // 95 - 45 = 50, 25 per side → one 25 per side
    expect(result.perSide).toEqual([
      { weight: 25, count: 1, color: '#22c55e' },
    ])
    expect(result.totalLoaded).toBe(95)
    expect(result.remainder).toBe(0)
  })

  it('returns all zeros for weight less than bar weight', () => {
    const result = calculatePlates(30)
    expect(result.perSide).toEqual([])
    expect(result.totalLoaded).toBe(0)
    expect(result.remainder).toBe(0)
  })

  it('handles 0 weight input', () => {
    const result = calculatePlates(0)
    expect(result.targetWeight).toBe(0)
    expect(result.perSide).toEqual([])
    expect(result.totalLoaded).toBe(0)
    expect(result.remainder).toBe(0)
  })
})

describe('formatPlateLoadout', () => {
  it('formats "Just the bar" for bar-weight-only loadout', () => {
    const loadout = calculatePlates(45)
    expect(formatPlateLoadout(loadout)).toBe('Just the bar')
  })

  it('formats single plate pair as "45 per side"', () => {
    const loadout = calculatePlates(135)
    expect(formatPlateLoadout(loadout)).toBe('45 per side')
  })

  it('formats mixed plates as "45 + 25 per side"', () => {
    const loadout = calculatePlates(185)
    expect(formatPlateLoadout(loadout)).toBe('45 + 25 per side')
  })
})

describe('plate colors', () => {
  it('assigns correct standard colors to each plate weight', () => {
    expect(PLATE_COLORS[55]).toBe('#ef4444')
    expect(PLATE_COLORS[45]).toBe('#3b82f6')
    expect(PLATE_COLORS[35]).toBe('#eab308')
    expect(PLATE_COLORS[25]).toBe('#22c55e')
    expect(PLATE_COLORS[15]).toBe('#f97316')
    expect(PLATE_COLORS[10]).toBe('#6b7280')
    expect(PLATE_COLORS[5]).toBe('#1f2937')
    expect(PLATE_COLORS[2.5]).toBe('#9ca3af')
    expect(PLATE_COLORS[20]).toBe('#3b82f6')
    expect(PLATE_COLORS[1.25]).toBe('#9ca3af')
  })
})

describe('greedy algorithm', () => {
  it('picks largest plates first (185 = 45+25 per side, not 35+35)', () => {
    const result = calculatePlates(185)
    // 185 - 45 = 140, 70 per side → 45 + 25
    expect(result.perSide).toEqual([
      { weight: 45, count: 1, color: '#3b82f6' },
      { weight: 25, count: 1, color: '#22c55e' },
    ])
    expect(result.totalLoaded).toBe(185)
    expect(result.remainder).toBe(0)
  })
})
