import { describe, it, expect } from 'vitest'
import { generatedWodToTimerConfig } from '../generated-wod-to-timer-config'
import type { GeneratedWod } from '../wod-generator'

function makeMockWod(overrides: Partial<GeneratedWod> = {}): GeneratedWod {
  return {
    name: 'Garage Grinder #42',
    type: 'amrap',
    duration: 12,
    movements: [
      { name: 'Air Squat', reps: 15, category: 'squat' },
      { name: 'Push-up', reps: 12, category: 'push' },
    ],
    targetCategories: ['squat', 'push'],
    reasoning: 'Targeting gaps.',
    ...overrides,
  }
}

describe('generatedWodToTimerConfig', () => {
  it('converts AMRAP wod to timer config with correct duration', () => {
    const wod = makeMockWod({ type: 'amrap', duration: 15 })
    const { config } = generatedWodToTimerConfig(wod)

    expect(config.mode).toBe('amrap')
    expect(config.totalDuration).toBe(15 * 60000)
  })

  it('converts ForTime wod to timer config with default 20 min cap', () => {
    const wod = makeMockWod({ type: 'forTime', rounds: 4 })
    const { config } = generatedWodToTimerConfig(wod)

    expect(config.mode).toBe('forTime')
    expect(config.totalDuration).toBe(20 * 60000)
  })

  it('converts EMOM wod to timer config with interval and rounds', () => {
    const wod = makeMockWod({ type: 'emom', duration: 16, rounds: undefined })
    const { config } = generatedWodToTimerConfig(wod)

    expect(config.mode).toBe('emom')
    expect(config.totalDuration).toBe(16 * 60000)
    expect(config.intervalDuration).toBe(60000)
    expect(config.rounds).toBe(16)
  })

  it('defaults AMRAP to 10 min when duration is missing', () => {
    const wod = makeMockWod({ type: 'amrap', duration: undefined })
    const { config } = generatedWodToTimerConfig(wod)

    expect(config.totalDuration).toBe(10 * 60000)
  })

  it('formats movements as readable strings', () => {
    const wod = makeMockWod({
      movements: [
        { name: 'Air Squat', reps: 15, category: 'squat' },
        { name: 'Kettlebell Swing', reps: 10, category: 'hinge' },
      ],
    })
    const { movements } = generatedWodToTimerConfig(wod)

    expect(movements).toEqual(['15 Air Squat', '10 Kettlebell Swing'])
  })

  it('returns wod name', () => {
    const wod = makeMockWod({ name: 'Garage Grinder #99' })
    const { wodName } = generatedWodToTimerConfig(wod)

    expect(wodName).toBe('Garage Grinder #99')
  })
})
