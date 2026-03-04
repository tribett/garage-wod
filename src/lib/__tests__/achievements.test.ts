import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkAchievements,
  getUnlockedAchievements,
  saveUnlockedAchievements,
} from '../achievements'
import type { Achievement, AchievementContext } from '../achievements'
import type { WorkoutLog } from '@/types/workout-log'

function makeLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: crypto.randomUUID(),
    programId: 'p1',
    weekNumber: 1,
    dayNumber: 1,
    completedAt: '2026-01-15T10:00:00',
    completed: true,
    ...overrides,
  }
}

function makeCtx(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    logs: [],
    prs: new Map(),
    streakWeeks: 0,
    ...overrides,
  }
}

describe('achievements', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })
  })

  // 1
  it('unlocks "First Blood" on first completed workout', () => {
    const ctx = makeCtx({ logs: [makeLog()] })
    const result = checkAchievements(ctx, [])
    const firstBlood = result.find((a) => a.id === 'first-blood')
    expect(firstBlood).toBeDefined()
    expect(firstBlood!.tier).toBe('bronze')
  })

  // 2
  it('unlocks "Century Club" at exactly 100 completed workouts', () => {
    const logs = Array.from({ length: 100 }, () => makeLog())
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, [])
    const centuryClub = result.find((a) => a.id === 'century-club')
    expect(centuryClub).toBeDefined()
    expect(centuryClub!.tier).toBe('silver')
  })

  // 3
  it('unlocks "Iron Week" with 5 workouts in same calendar week (Mon-Sun)', () => {
    // Mon Jan 12 through Fri Jan 16, 2026 — all same ISO week
    const logs = [
      makeLog({ completedAt: '2026-01-12T10:00:00' }), // Monday
      makeLog({ completedAt: '2026-01-13T10:00:00' }), // Tuesday
      makeLog({ completedAt: '2026-01-14T10:00:00' }), // Wednesday
      makeLog({ completedAt: '2026-01-15T10:00:00' }), // Thursday
      makeLog({ completedAt: '2026-01-16T10:00:00' }), // Friday
    ]
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, [])
    const ironWeek = result.find((a) => a.id === 'iron-week')
    expect(ironWeek).toBeDefined()
    expect(ironWeek!.tier).toBe('gold')
  })

  // 4
  it('unlocks "Dawn Patrol" when completedAt has hour < 6', () => {
    const logs = [makeLog({ completedAt: '2026-01-15T05:30:00' })]
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, [])
    const dawnPatrol = result.find((a) => a.id === 'dawn-patrol')
    expect(dawnPatrol).toBeDefined()
    expect(dawnPatrol!.tier).toBe('bronze')
  })

  // 5
  it('unlocks "Bodyweight Snatch" when snatch PR value >= bodyweight', () => {
    const prs = new Map([['snatch', { value: 155, reps: 1 }]])
    const ctx = makeCtx({ prs, bodyweight: 150 })
    const result = checkAchievements(ctx, [])
    const bwSnatch = result.find((a) => a.id === 'bodyweight-snatch')
    expect(bwSnatch).toBeDefined()
    expect(bwSnatch!.tier).toBe('gold')
  })

  // 6
  it('unlocks "Double Bodyweight Deadlift" when deadlift PR >= 2x bodyweight', () => {
    const prs = new Map([['deadlift', { value: 400, reps: 1 }]])
    const ctx = makeCtx({ prs, bodyweight: 200 })
    const result = checkAchievements(ctx, [])
    const dbd = result.find((a) => a.id === 'double-bodyweight-deadlift')
    expect(dbd).toBeDefined()
    expect(dbd!.tier).toBe('legendary')
  })

  // 7
  it('does not re-unlock already-unlocked achievements', () => {
    const logs = [makeLog()]
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, ['first-blood'])
    const firstBlood = result.find((a) => a.id === 'first-blood')
    expect(firstBlood).toBeUndefined()
  })

  // 8
  it('returns empty array when no new achievements earned', () => {
    const ctx = makeCtx({ logs: [] })
    const result = checkAchievements(ctx, [])
    expect(result).toEqual([])
  })

  // 9
  it('can unlock multiple achievements simultaneously', () => {
    // 1 workout at 5 AM => First Blood + Dawn Patrol
    const logs = [makeLog({ completedAt: '2026-01-15T04:00:00' })]
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, [])
    const ids = result.map((a) => a.id)
    expect(ids).toContain('first-blood')
    expect(ids).toContain('dawn-patrol')
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  // 10
  it('unlocks "Streak Master" when streakWeeks >= 8', () => {
    const ctx = makeCtx({ streakWeeks: 8 })
    const result = checkAchievements(ctx, [])
    const streakMaster = result.find((a) => a.id === 'streak-master')
    expect(streakMaster).toBeDefined()
    expect(streakMaster!.tier).toBe('silver')
  })

  // 11
  it('saves achievements to localStorage', () => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        store[key] = val
      }),
    })
    const achievements: Achievement[] = [
      {
        id: 'first-blood',
        name: 'First Blood',
        description: 'Complete your first workout',
        icon: 'drop',
        tier: 'bronze',
        unlockedAt: '2026-01-15T10:00:00',
      },
    ]
    saveUnlockedAchievements(achievements)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'grgwod:achievements',
      JSON.stringify(achievements),
    )
  })

  // 12
  it('loads achievements from localStorage', () => {
    const achievements: Achievement[] = [
      {
        id: 'first-blood',
        name: 'First Blood',
        description: 'Complete your first workout',
        icon: 'drop',
        tier: 'bronze',
        unlockedAt: '2026-01-15T10:00:00',
      },
    ]
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => JSON.stringify(achievements)),
      setItem: vi.fn(),
    })
    const loaded = getUnlockedAchievements()
    expect(loaded).toEqual(achievements)
  })

  // 13
  it('handles missing bodyweight (skips BW-based achievements, no crash)', () => {
    const prs = new Map([
      ['snatch', { value: 155, reps: 1 }],
      ['deadlift', { value: 400, reps: 1 }],
    ])
    const ctx = makeCtx({ prs }) // bodyweight is undefined
    const result = checkAchievements(ctx, [])
    const bwIds = result.map((a) => a.id)
    expect(bwIds).not.toContain('bodyweight-snatch')
    expect(bwIds).not.toContain('double-bodyweight-deadlift')
  })

  // 14
  it('unlocks "Rx Machine" with 10 consecutive WODs scaled Rx', () => {
    const logs = Array.from({ length: 10 }, (_, i) =>
      makeLog({
        completedAt: `2026-01-${String(i + 10).padStart(2, '0')}T10:00:00`,
        wodResult: { type: 'forTime', scaling: 'Rx' },
      }),
    )
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, [])
    const rxMachine = result.find((a) => a.id === 'rx-machine')
    expect(rxMachine).toBeDefined()
    expect(rxMachine!.tier).toBe('silver')
  })

  // 15
  it('unlocks "Fran Sub-5" with title="Fran", type=forTime, score < 300s', () => {
    const logs = [
      makeLog({
        title: 'Fran',
        wodResult: { type: 'forTime', score: '4:30' },
      }),
    ]
    const ctx = makeCtx({ logs })
    const result = checkAchievements(ctx, [])
    const franSub5 = result.find((a) => a.id === 'fran-sub-5')
    expect(franSub5).toBeDefined()
    expect(franSub5!.tier).toBe('legendary')
  })
})
