import { describe, it, expect } from 'vitest'
import { calculateWhatIf } from '../what-if-calculator'

describe('calculateWhatIf', () => {
  it('calculates PR improvement when current PR exists', () => {
    const result = calculateWhatIf('Back Squat', 275, 1, 260)
    expect(result.prImprovement).toBe(15)
  })

  it('returns null improvement when no current PR', () => {
    const result = calculateWhatIf('Back Squat', 275, 1, null)
    expect(result.prImprovement).toBeNull()
    expect(result.prImprovementPct).toBeNull()
  })

  it('calculates bodyweight ratio when bodyweight provided', () => {
    const result = calculateWhatIf('Back Squat', 275, 1, null, 185)
    expect(result.bodyweightRatio).toBeCloseTo(1.49, 2)
  })

  it('returns null BW ratio when no bodyweight provided', () => {
    const result = calculateWhatIf('Back Squat', 275, 1, null)
    expect(result.bodyweightRatio).toBeNull()
  })

  it('estimates 1RM using Epley formula', () => {
    // 225 × (1 + 3/30) = 225 × 1.1 = 247.5 → 248
    const result = calculateWhatIf('Deadlift', 225, 3, null)
    expect(result.estimated1RM).toBe(248)
  })

  it('generates percentage table from estimated 1RM', () => {
    const result = calculateWhatIf('Deadlift', 225, 3, null)
    expect(result.percentageTable.length).toBeGreaterThanOrEqual(6)
    const at50 = result.percentageTable.find((e) => e.percentage === 50)
    expect(at50).toBeTruthy()
    const at60 = result.percentageTable.find((e) => e.percentage === 60)
    expect(at60).toBeTruthy()
  })

  it('handles single-rep hypothetical', () => {
    const result = calculateWhatIf('Bench Press', 315, 1, null)
    expect(result.estimated1RM).toBe(315)
  })

  it('calculates improvement percentage', () => {
    // (275 - 260) / 260 × 100 ≈ 5.77
    const result = calculateWhatIf('Back Squat', 275, 1, 260)
    expect(result.prImprovementPct).toBeCloseTo(5.77, 2)
  })

  it('handles zero hypothetical weight', () => {
    const result = calculateWhatIf('Back Squat', 0, 5, 260)
    expect(result.estimated1RM).toBe(0)
    expect(result.prImprovement).toBeNull()
    expect(result.prImprovementPct).toBeNull()
  })

  it('preserves movement name in result', () => {
    const result = calculateWhatIf('Overhead Press', 135, 5, null)
    expect(result.movement).toBe('Overhead Press')
  })
})
