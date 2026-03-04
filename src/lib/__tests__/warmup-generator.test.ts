import { describe, it, expect } from 'vitest'
import {
  generateWarmUp,
} from '@/lib/warmup-generator'

describe('generateWarmUp', () => {
  it('generates hip-focused warm-up for squat movements', () => {
    const result = generateWarmUp([{ name: 'Back Squat' }])
    const names = result.exercises.map((e) => e.name)
    const hasHipWork = names.includes('Hip Circles') || names.includes('Ankle Rocks')
    expect(hasHipWork).toBe(true)
  })

  it('generates shoulder warm-up for pressing movements', () => {
    const result = generateWarmUp([{ name: 'Shoulder Press' }])
    const names = result.exercises.map((e) => e.name)
    expect(names).toContain('Shoulder Pass-Throughs')
  })

  it('always includes at least one general warm-up exercise', () => {
    const result = generateWarmUp([{ name: 'Deadlift' }])
    const generalExercises = result.exercises.filter(
      (e) => e.category === 'general',
    )
    expect(generalExercises.length).toBeGreaterThanOrEqual(1)
  })

  it('includes buildup exercise when movements contain barbell-type movements', () => {
    const result = generateWarmUp([{ name: 'Back Squat' }])
    const names = result.exercises.map((e) => e.name)
    expect(names).toContain('Empty Bar Warm-up Sets')
    const buildup = result.exercises.find(
      (e) => e.name === 'Empty Bar Warm-up Sets',
    )
    expect(buildup?.category).toBe('buildup')
    expect(buildup?.duration).toBe('3 sets of 5')
  })

  it('limits exercises to fit target duration (default 8 min, ~8 exercises)', () => {
    const result = generateWarmUp([
      { name: 'Back Squat' },
      { name: 'Shoulder Press' },
      { name: 'Deadlift' },
      { name: 'Pull-up' },
    ])
    expect(result.exercises.length).toBeLessThanOrEqual(8)
  })

  it('handles mixed movement days with both hip and shoulder exercises', () => {
    const result = generateWarmUp([
      { name: 'Back Squat' },
      { name: 'Shoulder Press' },
    ])
    const names = result.exercises.map((e) => e.name)
    const hasHipWork = names.includes('Hip Circles') || names.includes('Ankle Rocks')
    const hasShoulderWork = names.includes('Shoulder Pass-Throughs')
    expect(hasHipWork).toBe(true)
    expect(hasShoulderWork).toBe(true)
  })

  it('returns minimal warm-up for cardio-only days', () => {
    const result = generateWarmUp([{ name: 'Row' }, { name: 'Double-Under' }])
    const hasGeneral = result.exercises.some((e) => e.category === 'general')
    expect(hasGeneral).toBe(true)
    // Cardio-only should be short — general + cardio warmups only
    expect(result.exercises.length).toBeLessThanOrEqual(5)
  })

  it('includes ankle mobility for overhead squat', () => {
    const result = generateWarmUp([{ name: 'Overhead Squat' }])
    const names = result.exercises.map((e) => e.name)
    const hasAnkleWork = names.includes('Ankle Rocks') || names.includes('Hip Circles')
    expect(hasAnkleWork).toBe(true)
  })

  it('does not duplicate exercises', () => {
    const result = generateWarmUp([
      { name: 'Front Squat' },
      { name: 'Back Squat' },
      { name: 'Overhead Squat' },
    ])
    const names = result.exercises.map((e) => e.name)
    const unique = new Set(names)
    expect(names.length).toBe(unique.size)
  })

  it('returns empty exercises array for empty movement list', () => {
    const result = generateWarmUp([])
    expect(result.exercises).toEqual([])
    expect(result.estimatedMinutes).toBe(0)
    expect(result.targetAreas).toEqual([])
  })

  it('estimates total duration based on exercise count', () => {
    const result = generateWarmUp([{ name: 'Back Squat' }])
    expect(result.estimatedMinutes).toBe(result.exercises.length)
  })

  it('identifies target areas from movement categories', () => {
    const result = generateWarmUp([
      { name: 'Back Squat' },
      { name: 'Shoulder Press' },
    ])
    expect(result.targetAreas).toContain('hips')
    expect(result.targetAreas).toContain('shoulders')
  })
})
