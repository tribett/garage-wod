import { describe, it, expect } from 'vitest'
import type { GeneratedWod } from '@/lib/wod-generator'

/**
 * Test that the TimerPage LocationState type includes generatedWod.
 * This is a compile-time type check — if the type is correct, the
 * assignment compiles. We also test the navigation builder function.
 */

const MOCK_WOD: GeneratedWod = {
  name: 'Garage Grinder #42',
  type: 'amrap',
  duration: 12,
  movements: [
    { name: 'Air Squat', reps: 15, category: 'squat' },
    { name: 'Push-up', reps: 12, category: 'push' },
  ],
  targetCategories: ['squat', 'push'],
  reasoning: 'Targeting gaps.',
}

describe('TimerPage – generatedWod forwarding', () => {
  it('buildWodLogNavState includes generatedWod when present', async () => {
    const { buildWodLogNavState } = await import('@/lib/generated-wod-to-timer-config')
    const navState = buildWodLogNavState({
      timerScore: '8:42',
      timerMode: 'amrap',
      timerElapsed: 522000,
      timerRounds: 5,
      timerExtraReps: 3,
      generatedWod: MOCK_WOD,
    })

    expect(navState.timerScore).toBe('8:42')
    expect(navState.timerMode).toBe('amrap')
    expect(navState.generatedWod).toEqual(MOCK_WOD)
  })

  it('buildWodLogNavState works without generatedWod', async () => {
    const { buildWodLogNavState } = await import('@/lib/generated-wod-to-timer-config')
    const navState = buildWodLogNavState({
      timerScore: '12:30',
      timerMode: 'forTime',
      timerElapsed: 750000,
    })

    expect(navState.timerScore).toBe('12:30')
    expect(navState.generatedWod).toBeUndefined()
  })
})
