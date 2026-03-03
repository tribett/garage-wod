/**
 * volume-calculator.ts — Computes weekly training volume (workouts, sets, reps)
 * for this week vs. last week, enabling a simple comparison widget on the Dashboard.
 */

import type { WorkoutLog } from '@/types/workout-log'

export interface PeriodVolume {
  workouts: number
  totalSets: number
  totalReps: number
}

export interface WeeklyVolume {
  thisWeek: PeriodVolume
  lastWeek: PeriodVolume
}

function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  // Week starts Monday
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

function volumeForPeriod(
  logs: WorkoutLog[],
  start: Date,
  end: Date,
): PeriodVolume {
  let workouts = 0
  let totalSets = 0
  let totalReps = 0

  for (const log of logs) {
    if (!log.completed) continue
    const logDate = new Date(log.completedAt)
    if (logDate < start || logDate >= end) continue

    workouts++

    if (log.exercises) {
      for (const ex of log.exercises) {
        for (const set of ex.sets) {
          if (set.completed) {
            totalSets++
            totalReps += set.reps ?? 0
          }
        }
      }
    }
  }

  return { workouts, totalSets, totalReps }
}

export function getWeeklyVolume(logs: WorkoutLog[]): WeeklyVolume {
  const now = new Date()
  const thisWeekStart = getWeekStart(now)
  const thisWeekEnd = new Date(thisWeekStart)
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7)

  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  return {
    thisWeek: volumeForPeriod(logs, thisWeekStart, thisWeekEnd),
    lastWeek: volumeForPeriod(logs, lastWeekStart, thisWeekStart),
  }
}
