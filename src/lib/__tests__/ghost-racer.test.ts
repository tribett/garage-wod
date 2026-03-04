import { describe, it, expect } from 'vitest'
import {
  createGhostFromHistory,
  updateGhostState,
  formatGhostDelta,
} from '../ghost-racer'
import type { GhostState } from '../ghost-racer'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> & { completedAt: string }): WorkoutLog {
  return {
    id: Math.random().toString(),
    programId: 'standalone',
    weekNumber: 0,
    dayNumber: 1,
    completed: true,
    ...overrides,
  }
}

describe('createGhostFromHistory', () => {
  it('finds most recent forTime result by WOD name', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '3:45' },
      }),
    ]
    const result = createGhostFromHistory('Fran', logs)
    expect(result).not.toBeNull()
    expect(result!.previousTime).toBe(225000) // 3*60*1000 + 45*1000
    expect(result!.previousScore).toBe('3:45')
  })

  it('returns null when no previous attempt exists', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Grace',
        wodResult: { type: 'forTime', score: '2:30' },
      }),
    ]
    const result = createGhostFromHistory('Fran', logs)
    expect(result).toBeNull()
  })

  it('picks most recent attempt, not best', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-15T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '4:00' },
      }),
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'Fran',
        wodResult: { type: 'forTime', score: '3:00' },
      }),
    ]
    const result = createGhostFromHistory('Fran', logs)
    expect(result).not.toBeNull()
    expect(result!.previousTime).toBe(240000) // 4:00 = 240s = 240000ms
    expect(result!.previousScore).toBe('4:00')
  })

  it('is case-insensitive on WOD name', () => {
    const logs: WorkoutLog[] = [
      makeLog({
        completedAt: '2026-01-01T10:00:00Z',
        title: 'FRAN',
        wodResult: { type: 'forTime', score: '3:45' },
      }),
    ]
    const result = createGhostFromHistory('fran', logs)
    expect(result).not.toBeNull()
    expect(result!.previousTime).toBe(225000)
  })
})

describe('updateGhostState', () => {
  it('shows "ahead" when elapsed < previousTime', () => {
    const state: GhostState = updateGhostState(100000, 200000)
    expect(state.isActive).toBe(true)
    expect(state.paceStatus).toBe('ahead')
    expect(state.delta).toBe(100000)
  })

  it('shows "behind" when elapsed > previousTime', () => {
    const state: GhostState = updateGhostState(250000, 200000)
    expect(state.paceStatus).toBe('behind')
    expect(state.delta).toBe(-50000)
  })

  it('shows "tied" when delta within 1000ms', () => {
    const state: GhostState = updateGhostState(199500, 200000)
    expect(state.paceStatus).toBe('tied')
  })

  it('calculates progressPct as (elapsed/previousTime)*100 capped at 100', () => {
    const state: GhostState = updateGhostState(50000, 200000)
    expect(state.progressPct).toBe(25)
  })

  it('handles ghost completing (elapsed > previousTime, progressPct = 100)', () => {
    const state: GhostState = updateGhostState(250000, 200000)
    expect(state.progressPct).toBe(100)
    expect(state.paceStatus).toBe('behind')
  })
})

describe('formatGhostDelta', () => {
  it('formats positive delta as "+M:SS"', () => {
    expect(formatGhostDelta(63000)).toBe('+1:03')
  })

  it('formats negative delta as "-M:SS"', () => {
    expect(formatGhostDelta(-5000)).toBe('-0:05')
  })
})
