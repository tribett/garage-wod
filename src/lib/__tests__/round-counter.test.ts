import { describe, it, expect } from 'vitest'
import {
  incrementRound,
  decrementRound,
  setExtraReps,
  formatRoundCount,
} from '@/lib/round-counter'

describe('incrementRound', () => {
  it('increments from {0,0} to {1,0}', () => {
    const result = incrementRound({ rounds: 0, extraReps: 0 })
    expect(result).toEqual({ rounds: 1, extraReps: 0 })
  })

  it('increments from {3,5} to {4,0} (resets extraReps)', () => {
    const result = incrementRound({ rounds: 3, extraReps: 5 })
    expect(result).toEqual({ rounds: 4, extraReps: 0 })
  })
})

describe('decrementRound', () => {
  it('decrements from {2,0} to {1,0}', () => {
    const result = decrementRound({ rounds: 2, extraReps: 0 })
    expect(result).toEqual({ rounds: 1, extraReps: 0 })
  })

  it('floors at {0,0}', () => {
    const result = decrementRound({ rounds: 0, extraReps: 0 })
    expect(result).toEqual({ rounds: 0, extraReps: 0 })
  })
})

describe('setExtraReps', () => {
  it('sets extra reps on {5,0} + 3 to {5,3}', () => {
    const result = setExtraReps({ rounds: 5, extraReps: 0 }, 3)
    expect(result).toEqual({ rounds: 5, extraReps: 3 })
  })

  it('floors extra reps at 0', () => {
    const result = setExtraReps({ rounds: 5, extraReps: 3 }, -2)
    expect(result).toEqual({ rounds: 5, extraReps: 0 })
  })
})

describe('formatRoundCount', () => {
  it('formats {0,0} as "0"', () => {
    expect(formatRoundCount({ rounds: 0, extraReps: 0 })).toBe('0')
  })

  it('formats {5,0} as "5"', () => {
    expect(formatRoundCount({ rounds: 5, extraReps: 0 })).toBe('5')
  })

  it('formats {5,3} as "5+3"', () => {
    expect(formatRoundCount({ rounds: 5, extraReps: 3 })).toBe('5+3')
  })
})
