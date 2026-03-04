import type { WorkoutLog } from '@/types/workout-log'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  unlockedAt?: string
}

export interface AchievementContext {
  logs: WorkoutLog[]
  prs: Map<string, { value: number; reps: number }>
  bodyweight?: number
  streakWeeks: number
}

const STORAGE_KEY = 'grgwod:achievements'

interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  check: (ctx: AchievementContext) => boolean
}

/**
 * Get ISO week key "YYYY-WW" for a given date.
 * Weeks start on Monday (ISO 8601).
 */
function getISOWeekKey(date: Date): string {
  // Copy date so we don't mutate
  const d = new Date(date.getTime())
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1 .. Sun=7)
  const dayNum = d.getDay() || 7 // convert Sunday from 0 to 7
  d.setDate(d.getDate() + 4 - dayNum)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

/**
 * Parse a "MM:SS" or "M:SS" time string into total seconds.
 */
function parseTimeScore(score: string): number | null {
  const parts = score.split(':')
  if (parts.length !== 2) return null
  const minutes = parseInt(parts[0], 10)
  const seconds = parseInt(parts[1], 10)
  if (isNaN(minutes) || isNaN(seconds)) return null
  return minutes * 60 + seconds
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first workout',
    icon: 'drop',
    tier: 'bronze',
    check: (ctx) => ctx.logs.filter((l) => l.completed).length >= 1,
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Complete 100 workouts',
    icon: 'trophy',
    tier: 'silver',
    check: (ctx) => ctx.logs.filter((l) => l.completed).length >= 100,
  },
  {
    id: 'iron-week',
    name: 'Iron Week',
    description: '5 workouts in one calendar week',
    icon: 'calendar',
    tier: 'gold',
    check: (ctx) => {
      const weekCounts = new Map<string, number>()
      for (const log of ctx.logs) {
        if (!log.completed) continue
        const key = getISOWeekKey(new Date(log.completedAt))
        weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1)
      }
      for (const count of weekCounts.values()) {
        if (count >= 5) return true
      }
      return false
    },
  },
  {
    id: 'dawn-patrol',
    name: 'Dawn Patrol',
    description: 'Log a workout before 6 AM',
    icon: 'sunrise',
    tier: 'bronze',
    check: (ctx) =>
      ctx.logs.some((l) => {
        if (!l.completed) return false
        const hour = new Date(l.completedAt).getHours()
        return hour < 6
      }),
  },
  {
    id: 'rx-machine',
    name: 'Rx Machine',
    description: '10 consecutive WODs with Rx scaling',
    icon: 'rx',
    tier: 'silver',
    check: (ctx) => {
      // Only consider logs that have a wodResult
      const wodsWithResults = ctx.logs
        .filter((l) => l.completed && l.wodResult)
        .sort(
          (a, b) =>
            new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
        )

      let consecutive = 0
      for (const log of wodsWithResults) {
        if (log.wodResult?.scaling === 'Rx') {
          consecutive++
          if (consecutive >= 10) return true
        } else {
          consecutive = 0
        }
      }
      return false
    },
  },
  {
    id: 'bodyweight-snatch',
    name: 'Bodyweight Snatch',
    description: 'Snatch PR at or above bodyweight',
    icon: 'barbell',
    tier: 'gold',
    check: (ctx) => {
      if (ctx.bodyweight == null) return false
      const snatchPr = ctx.prs.get('snatch')
      if (!snatchPr) return false
      return snatchPr.value >= ctx.bodyweight
    },
  },
  {
    id: 'double-bodyweight-deadlift',
    name: 'Double Bodyweight Deadlift',
    description: 'Deadlift PR at or above 2x bodyweight',
    icon: 'fire',
    tier: 'legendary',
    check: (ctx) => {
      if (ctx.bodyweight == null) return false
      const dlPr = ctx.prs.get('deadlift')
      if (!dlPr) return false
      return dlPr.value >= 2 * ctx.bodyweight
    },
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: '8-week training streak',
    icon: 'flame',
    tier: 'silver',
    check: (ctx) => ctx.streakWeeks >= 8,
  },
  {
    id: 'pr-parade',
    name: 'PR Parade',
    description: '3+ different movement PRs in one session',
    icon: 'star',
    tier: 'bronze',
    check: (ctx) => {
      // Group logs by date (YYYY-MM-DD)
      const dayMap = new Map<string, Set<string>>()
      for (const log of ctx.logs) {
        if (!log.completed || !log.exercises) continue
        const dateKey = log.completedAt.slice(0, 10)
        if (!dayMap.has(dateKey)) dayMap.set(dateKey, new Set())
        for (const ex of log.exercises) {
          if (ctx.prs.has(ex.movementId) || ctx.prs.has(ex.movementName)) {
            dayMap.get(dateKey)!.add(ex.movementId || ex.movementName)
          }
        }
      }
      for (const movements of dayMap.values()) {
        if (movements.size >= 3) return true
      }
      return false
    },
  },
  {
    id: 'the-murph',
    name: 'The Murph',
    description: 'Complete the Murph workout',
    icon: 'medal',
    tier: 'gold',
    check: (ctx) =>
      ctx.logs.some(
        (l) =>
          l.completed &&
          l.title?.toLowerCase() === 'murph',
      ),
  },
  {
    id: 'fran-sub-5',
    name: 'Fran Sub-5',
    description: 'Complete Fran in under 5 minutes',
    icon: 'lightning',
    tier: 'legendary',
    check: (ctx) =>
      ctx.logs.some((l) => {
        if (!l.completed) return false
        if (l.title?.toLowerCase() !== 'fran') return false
        if (l.wodResult?.type !== 'forTime') return false
        if (!l.wodResult.score) return false
        const seconds = parseTimeScore(l.wodResult.score)
        if (seconds == null) return false
        return seconds < 300
      }),
  },
  {
    id: 'year-round',
    name: 'Year-Round',
    description: 'At least 1 workout in 12 different months',
    icon: 'globe',
    tier: 'legendary',
    check: (ctx) => {
      const months = new Set<string>()
      for (const log of ctx.logs) {
        if (!log.completed) continue
        const d = new Date(log.completedAt)
        months.add(`${d.getFullYear()}-${d.getMonth()}`)
      }
      return months.size >= 12
    },
  },
]

export function checkAchievements(
  ctx: AchievementContext,
  alreadyUnlocked: string[],
): Achievement[] {
  const alreadySet = new Set(alreadyUnlocked)
  const now = new Date().toISOString()
  const unlocked: Achievement[] = []

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (alreadySet.has(def.id)) continue
    if (def.check(ctx)) {
      unlocked.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        tier: def.tier,
        unlockedAt: now,
      })
    }
  }

  return unlocked
}

export function getUnlockedAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    return JSON.parse(raw) as Achievement[]
  } catch {
    return []
  }
}

export function saveUnlockedAchievements(achievements: Achievement[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements))
}
