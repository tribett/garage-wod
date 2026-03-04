import { describe, it, expect } from 'vitest'
import { predictDifficulty } from '../difficulty-predictor'
import type { DifficultyPrediction } from '../difficulty-predictor'
import type { WorkoutBlock } from '@/types/program'

function makeBlock(movements: WorkoutBlock['movements'], overrides: Partial<WorkoutBlock> = {}): WorkoutBlock {
  return {
    type: 'wod',
    name: 'Test Block',
    movements,
    ...overrides,
  }
}

function makeMov(name: string, opts: Partial<WorkoutBlock['movements'][0]> = {}): WorkoutBlock['movements'][0] {
  return { id: crypto.randomUUID(), name, sets: 3, reps: 10, ...opts }
}

describe('predictDifficulty', () => {
  // 1. rates bodyweight-only WOD as low (score ≤ 3)
  it('rates bodyweight-only WOD (air squats, burpees) as low', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Air Squats', { sets: 3, reps: 10 }),
        makeMov('Burpees', { sets: 3, reps: 10 }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const result: DifficultyPrediction = predictDifficulty(blocks, prs)
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.score).toBeLessThanOrEqual(3)
  })

  // 2. rates workout with weights at 90%+ of PR as high (score ≥ 7)
  it('rates workout with weights at 90%+ of PR as high', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Back Squat', { sets: 5, reps: 5, weight: '270' }),
        makeMov('Deadlift', { sets: 5, reps: 5, weight: '360' }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>([
      ['Back Squat', { value: 300, reps: 1 }],
      ['Deadlift', { value: 400, reps: 1 }],
    ])
    const result = predictDifficulty(blocks, prs)
    expect(result.score).toBeGreaterThanOrEqual(7)
  })

  // 3. rates workout with weights at 50-60% of PR as low-moderate (score ≤ 5)
  it('rates workout with weights at 50-60% of PR as low-moderate', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Back Squat', { sets: 3, reps: 8, weight: '165' }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>([
      ['Back Squat', { value: 300, reps: 1 }],
    ])
    const result = predictDifficulty(blocks, prs)
    expect(result.score).toBeLessThanOrEqual(5)
  })

  // 4. accounts for total volume (more sets/reps increases score)
  it('accounts for total volume (more sets/reps increases score)', () => {
    const lowVolume: WorkoutBlock[] = [
      makeBlock([makeMov('Air Squats', { sets: 2, reps: 5 })]),
    ]
    const highVolume: WorkoutBlock[] = [
      makeBlock([makeMov('Air Squats', { sets: 10, reps: 20 })]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const lowResult = predictDifficulty(lowVolume, prs)
    const highResult = predictDifficulty(highVolume, prs)
    expect(highResult.score).toBeGreaterThan(lowResult.score)
  })

  // 5. includes movement complexity factor (muscle-ups add high impact)
  it('includes movement complexity factor for muscle-ups', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Muscle-Up', { sets: 3, reps: 5 }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const result = predictDifficulty(blocks, prs)
    const complexFactor = result.factors.find((f) => f.impact === 'high')
    expect(complexFactor).toBeDefined()
    expect(complexFactor!.description.toLowerCase()).toContain('complex')
  })

  // 6. calibrates with recent RPE (high average RPEs bump score up by 1-2)
  it('calibrates with recent RPE (high average RPEs bump score up)', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([makeMov('Air Squats', { sets: 3, reps: 10 })]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const withoutRPE = predictDifficulty(blocks, prs)
    const withHighRPE = predictDifficulty(blocks, prs, [9, 9, 10, 9])
    expect(withHighRPE.score).toBeGreaterThanOrEqual(withoutRPE.score + 1)
    expect(withHighRPE.score).toBeLessThanOrEqual(withoutRPE.score + 2)
  })

  // 7. returns "Light" label for score 1-3
  it('returns "Light" label for score 1-3', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([makeMov('Air Squats', { sets: 2, reps: 5 })]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const result = predictDifficulty(blocks, prs)
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.score).toBeLessThanOrEqual(3)
    expect(result.label).toBe('Light')
  })

  // 8. returns "Moderate" for score 4-5
  it('returns "Moderate" label for score 4-5', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Air Squats', { sets: 5, reps: 15 }),
        makeMov('Push-ups', { sets: 5, reps: 15 }),
        makeMov('Lunges', { sets: 5, reps: 15 }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const result = predictDifficulty(blocks, prs)
    expect(result.score).toBeGreaterThanOrEqual(4)
    expect(result.score).toBeLessThanOrEqual(5)
    expect(result.label).toBe('Moderate')
  })

  // 9. returns "Challenging" for score 6-7
  it('returns "Challenging" label for score 6-7', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Back Squat', { sets: 5, reps: 5, weight: '255' }),
        makeMov('Bench Press', { sets: 5, reps: 5, weight: '190' }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>([
      ['Back Squat', { value: 300, reps: 1 }],
      ['Bench Press', { value: 225, reps: 1 }],
    ])
    const result = predictDifficulty(blocks, prs)
    expect(result.score).toBeGreaterThanOrEqual(6)
    expect(result.score).toBeLessThanOrEqual(7)
    expect(result.label).toBe('Challenging')
  })

  // 10. returns "Brutal" for score 8-9
  it('returns "Brutal" label for score 8-9', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Back Squat', { sets: 7, reps: 5, weight: '285' }),
        makeMov('Deadlift', { sets: 7, reps: 5, weight: '380' }),
        makeMov('Muscle-Up', { sets: 5, reps: 5 }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>([
      ['Back Squat', { value: 300, reps: 1 }],
      ['Deadlift', { value: 400, reps: 1 }],
    ])
    const result = predictDifficulty(blocks, prs)
    expect(result.score).toBeGreaterThanOrEqual(8)
    expect(result.score).toBeLessThanOrEqual(9)
    expect(result.label).toBe('Brutal')
  })

  // 11. returns "Competition-Level" for score 10
  it('returns "Competition-Level" label for score 10', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([
        makeMov('Snatch', { sets: 10, reps: 10, weight: '185' }),
        makeMov('Muscle-Up', { sets: 10, reps: 10 }),
        makeMov('Handstand Walk', { sets: 10, reps: 10 }),
        makeMov('Back Squat', { sets: 10, reps: 10, weight: '285' }),
        makeMov('Deadlift', { sets: 10, reps: 10, weight: '380' }),
      ]),
    ]
    const prs = new Map<string, { value: number; reps: number }>([
      ['Snatch', { value: 200, reps: 1 }],
      ['Back Squat', { value: 300, reps: 1 }],
      ['Deadlift', { value: 400, reps: 1 }],
    ])
    const result = predictDifficulty(blocks, prs, [10, 10, 10])
    expect(result.score).toBe(10)
    expect(result.label).toBe('Competition-Level')
  })

  // 12. generates descriptive factors array with at least one factor
  it('generates descriptive factors array with at least one factor', () => {
    const blocks: WorkoutBlock[] = [
      makeBlock([makeMov('Air Squats', { sets: 3, reps: 10 })]),
    ]
    const prs = new Map<string, { value: number; reps: number }>()
    const result = predictDifficulty(blocks, prs)
    expect(result.factors.length).toBeGreaterThanOrEqual(1)
    for (const factor of result.factors) {
      expect(factor.description).toBeTruthy()
      expect(['low', 'medium', 'high']).toContain(factor.impact)
    }
  })
})
