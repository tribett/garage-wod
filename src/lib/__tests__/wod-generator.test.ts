import { describe, it, expect } from 'vitest'
import { generateWod, MOVEMENT_POOL } from '@/lib/wod-generator'
import type { WorkoutLog } from '@/types/workout-log'

/** Helper to build a minimal WorkoutLog with specific movement names */
function buildLog(movementNames: string[], daysAgo: number = 0): WorkoutLog {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return {
    id: `log-${Date.now()}-${Math.random()}`,
    programId: 'test',
    weekNumber: 1,
    dayNumber: 1,
    completedAt: date.toISOString(),
    completed: true,
    exercises: movementNames.map((name) => ({
      movementId: name.toLowerCase().replace(/\s/g, '-'),
      movementName: name,
      sets: [{ weight: 100, reps: 10, completed: true }],
    })),
  }
}

/** Collect all movement names from the pool into a flat set */
function allPoolMovements(): Set<string> {
  const names = new Set<string>()
  for (const movements of Object.values(MOVEMENT_POOL)) {
    for (const m of movements) {
      names.add(m)
    }
  }
  return names
}

describe('generateWod', () => {
  it('generates a valid WOD with 3-5 movements', () => {
    const wod = generateWod([], undefined, undefined, 42)
    expect(wod.movements.length).toBeGreaterThanOrEqual(3)
    expect(wod.movements.length).toBeLessThanOrEqual(5)
  })

  it('weights toward underrepresented categories', () => {
    // Create logs with ONLY squat and push exercises — many sessions
    const logs: WorkoutLog[] = []
    for (let i = 0; i < 10; i++) {
      logs.push(buildLog(['Air Squat', 'Push-up'], i))
    }

    // Generate multiple WODs and check that gap categories appear
    const gapHits = new Set<string>()
    for (let seed = 1; seed <= 20; seed++) {
      const wod = generateWod(logs, undefined, undefined, seed)
      for (const m of wod.movements) {
        if (['hinge', 'pull', 'cardio', 'carry', 'core'].includes(m.category)) {
          gapHits.add(m.category)
        }
      }
    }

    // At least some gap categories should appear across the generated WODs
    expect(gapHits.size).toBeGreaterThanOrEqual(2)
  })

  it('assigns appropriate reps per movement (between 5 and 30)', () => {
    const wod = generateWod([], undefined, undefined, 99)
    for (const m of wod.movements) {
      expect(m.reps).toBeGreaterThanOrEqual(5)
      expect(m.reps).toBeLessThanOrEqual(30)
    }
  })

  it('picks AMRAP/forTime/EMOM when type not specified', () => {
    const types = new Set<string>()
    for (let seed = 1; seed <= 30; seed++) {
      const wod = generateWod([], undefined, undefined, seed)
      types.add(wod.type)
    }
    expect(types.has('amrap')).toBe(true)
    expect(types.has('forTime')).toBe(true)
    expect(types.has('emom')).toBe(true)
  })

  it('sets reasonable duration (8-20 min) for AMRAP', () => {
    const wod = generateWod([], undefined, 'amrap', 42)
    expect(wod.type).toBe('amrap')
    expect(wod.duration).toBeGreaterThanOrEqual(8)
    expect(wod.duration).toBeLessThanOrEqual(20)
  })

  it('respects preferredType parameter', () => {
    const wod = generateWod([], undefined, 'emom', 42)
    expect(wod.type).toBe('emom')
  })

  it('generates a name containing "Garage Grinder"', () => {
    const wod = generateWod([], undefined, undefined, 42)
    expect(wod.name).toContain('Garage Grinder')
  })

  it('provides reasoning string mentioning gaps', () => {
    // Logs that only have squat → gaps in hinge, pull, etc.
    const logs: WorkoutLog[] = []
    for (let i = 0; i < 5; i++) {
      logs.push(buildLog(['Air Squat'], i))
    }
    const wod = generateWod(logs, undefined, undefined, 42)
    expect(wod.reasoning.toLowerCase()).toContain('gap')
  })

  it('all movements come from MOVEMENT_POOL', () => {
    const pool = allPoolMovements()
    for (let seed = 1; seed <= 10; seed++) {
      const wod = generateWod([], undefined, undefined, seed)
      for (const m of wod.movements) {
        expect(pool.has(m.name)).toBe(true)
      }
    }
  })

  it('does not repeat same movement in one WOD', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const wod = generateWod([], undefined, undefined, seed)
      const names = wod.movements.map((m) => m.name)
      expect(new Set(names).size).toBe(names.length)
    }
  })

  it('deterministic output with same seed', () => {
    const wod1 = generateWod([], undefined, undefined, 123)
    const wod2 = generateWod([], undefined, undefined, 123)
    expect(wod1).toEqual(wod2)
  })

  it('handles empty log history (fully random)', () => {
    const wod = generateWod([], undefined, undefined, 77)
    expect(wod.movements.length).toBeGreaterThanOrEqual(3)
    expect(wod.movements.length).toBeLessThanOrEqual(5)
    expect(wod.type).toBeDefined()
    expect(wod.name).toContain('Garage Grinder')
  })

  it('sets 3-5 rounds for forTime type', () => {
    const wod = generateWod([], undefined, 'forTime', 42)
    expect(wod.type).toBe('forTime')
    expect(wod.rounds).toBeGreaterThanOrEqual(3)
    expect(wod.rounds).toBeLessThanOrEqual(5)
  })
})
