import type { WorkoutLog } from '@/types/workout-log'

export interface MonthlyRecap {
  month: number // 0-11
  year: number
  totalWorkouts: number
  totalSets: number
  totalReps: number
  estimatedVolumeLbs: number
  prsHit: number
  topMovement: string | null
  averageRPE: number | null
  activeDays: number
  comparedToLastMonth: { workoutDelta: number; volumeDelta: number } | null
}

export interface YearlyRecap {
  year: number
  totalWorkouts: number
  totalVolumeLbs: number
  totalPRs: number
  longestStreak: number
  monthsActive: number
  topMovements: string[]
  averageWorkoutsPerWeek: number
  bestMonth: { month: number; workouts: number }
}

// ── helpers ─────────────────────────────────────────────────────

function completedInMonth(logs: WorkoutLog[], month: number, year: number): WorkoutLog[] {
  return logs.filter((l) => {
    if (!l.completed) return false
    const d = new Date(l.completedAt)
    return d.getUTCMonth() === month && d.getUTCFullYear() === year
  })
}

function completedInYear(logs: WorkoutLog[], year: number): WorkoutLog[] {
  return logs.filter((l) => {
    if (!l.completed) return false
    const d = new Date(l.completedAt)
    return d.getUTCFullYear() === year
  })
}

function computeVolume(logs: WorkoutLog[]): number {
  let vol = 0
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      for (const s of ex.sets) {
        if (s.completed && s.weight != null && s.reps != null) {
          vol += s.weight * s.reps
        }
      }
    }
  }
  return vol
}

function countSets(logs: WorkoutLog[]): number {
  let total = 0
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      total += ex.sets.length
    }
  }
  return total
}

function countReps(logs: WorkoutLog[]): number {
  let total = 0
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      for (const s of ex.sets) {
        if (s.reps != null) {
          total += s.reps
        }
      }
    }
  }
  return total
}

function movementFrequency(logs: WorkoutLog[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      freq.set(ex.movementName, (freq.get(ex.movementName) ?? 0) + 1)
    }
  }
  return freq
}

function topMovementFromFreq(freq: Map<string, number>): string | null {
  let best: string | null = null
  let bestCount = 0
  for (const [name, count] of freq) {
    if (count > bestCount) {
      best = name
      bestCount = count
    }
  }
  return best
}

function topNMovements(freq: Map<string, number>, n: number): string[] {
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name)
}

function countPRs(allLogs: WorkoutLog[], monthLogs: WorkoutLog[], month: number, year: number): number {
  // For each movement in monthLogs, find max weight in this month
  // Compare to max weight across all prior months
  const priorLogs = allLogs.filter((l) => {
    if (!l.completed) return false
    const d = new Date(l.completedAt)
    const logYear = d.getUTCFullYear()
    const logMonth = d.getUTCMonth()
    // Strictly before the target month
    return logYear < year || (logYear === year && logMonth < month)
  })

  // Collect max weights per movement in current month
  const monthMax = new Map<string, number>()
  for (const log of monthLogs) {
    for (const ex of log.exercises ?? []) {
      for (const s of ex.sets) {
        if (s.completed && s.weight != null) {
          const cur = monthMax.get(ex.movementName) ?? 0
          if (s.weight > cur) monthMax.set(ex.movementName, s.weight)
        }
      }
    }
  }

  // Collect max weights per movement in all prior months
  const priorMax = new Map<string, number>()
  for (const log of priorLogs) {
    for (const ex of log.exercises ?? []) {
      for (const s of ex.sets) {
        if (s.completed && s.weight != null) {
          const cur = priorMax.get(ex.movementName) ?? 0
          if (s.weight > cur) priorMax.set(ex.movementName, s.weight)
        }
      }
    }
  }

  let prs = 0
  for (const [name, maxW] of monthMax) {
    const prior = priorMax.get(name)
    if (prior == null) continue // no prior data → not a PR (new movement)
    if (maxW > prior) prs++
  }
  return prs
}

/** Get ISO week number (Mon-Sun weeks) for a UTC date */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1...Sun=7)
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// ── public API ──────────────────────────────────────────────────

export function getMonthlyRecap(logs: WorkoutLog[], month: number, year: number): MonthlyRecap {
  const monthLogs = completedInMonth(logs, month, year)

  const freq = movementFrequency(monthLogs)

  // Average RPE
  const rpeValues = monthLogs.filter((l) => l.rpe != null).map((l) => l.rpe!)
  const averageRPE = rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null

  // Active days
  const daySet = new Set<string>()
  for (const log of monthLogs) {
    daySet.add(log.completedAt.slice(0, 10))
  }

  // Comparison to previous month
  let prevMonth = month - 1
  let prevYear = year
  if (prevMonth < 0) {
    prevMonth = 11
    prevYear = year - 1
  }
  const prevLogs = completedInMonth(logs, prevMonth, prevYear)
  const comparedToLastMonth =
    prevLogs.length === 0
      ? null
      : {
          workoutDelta: monthLogs.length - prevLogs.length,
          volumeDelta: computeVolume(monthLogs) - computeVolume(prevLogs),
        }

  return {
    month,
    year,
    totalWorkouts: monthLogs.length,
    totalSets: countSets(monthLogs),
    totalReps: countReps(monthLogs),
    estimatedVolumeLbs: computeVolume(monthLogs),
    prsHit: countPRs(logs, monthLogs, month, year),
    topMovement: topMovementFromFreq(freq),
    averageRPE,
    activeDays: daySet.size,
    comparedToLastMonth,
  }
}

export function getYearlyRecap(logs: WorkoutLog[], year: number): YearlyRecap {
  const yearLogs = completedInYear(logs, year)

  // Months active
  const activeMonths = new Set<number>()
  for (const log of yearLogs) {
    activeMonths.add(new Date(log.completedAt).getUTCMonth())
  }

  // Workouts per month
  const monthCounts = new Map<number, number>()
  for (const log of yearLogs) {
    const m = new Date(log.completedAt).getUTCMonth()
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1)
  }

  let bestMonth = { month: 0, workouts: 0 }
  for (const [m, count] of monthCounts) {
    if (count > bestMonth.workouts) {
      bestMonth = { month: m, workouts: count }
    }
  }

  // Longest streak: consecutive ISO weeks with ≥1 workout
  const weekSet = new Set<number>()
  for (const log of yearLogs) {
    const d = new Date(log.completedAt)
    weekSet.add(getISOWeek(d))
  }
  const sortedWeeks = [...weekSet].sort((a, b) => a - b)
  let longestStreak = 0
  let currentStreak = 0
  for (let i = 0; i < sortedWeeks.length; i++) {
    if (i === 0 || sortedWeeks[i] === sortedWeeks[i - 1] + 1) {
      currentStreak++
    } else {
      currentStreak = 1
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak
  }

  // Top movements
  const freq = movementFrequency(yearLogs)

  // Total PRs: sum monthly PRs
  let totalPRs = 0
  for (const m of activeMonths) {
    const mLogs = completedInMonth(logs, m, year)
    totalPRs += countPRs(logs, mLogs, m, year)
  }

  return {
    year,
    totalWorkouts: yearLogs.length,
    totalVolumeLbs: computeVolume(yearLogs),
    totalPRs,
    longestStreak,
    monthsActive: activeMonths.size,
    topMovements: topNMovements(freq, 3),
    averageWorkoutsPerWeek: yearLogs.length / 52,
    bestMonth,
  }
}

export function getCurrentMonthRecap(logs: WorkoutLog[]): MonthlyRecap {
  const now = new Date()
  return getMonthlyRecap(logs, now.getUTCMonth(), now.getUTCFullYear())
}
