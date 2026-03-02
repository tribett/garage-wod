import type { WorkoutLog } from '@/types/workout-log'

export function calculateStreak(logs: WorkoutLog[]): number {
  if (logs.length === 0) return 0

  const completedDates = logs
    .filter((log) => log.completed)
    .map((log) => {
      const d = new Date(log.completedAt)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })

  // Deduplicate (multiple workouts same day = 1 day)
  const uniqueDates = [...new Set(completedDates)]
    .map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number)
      return new Date(y, m, d)
    })
    .sort((a, b) => b.getTime() - a.getTime())

  if (uniqueDates.length === 0) return 0

  // Count consecutive weeks with at least one workout
  // A "streak" = consecutive calendar weeks with workouts
  const now = new Date()
  const currentWeekStart = getWeekStart(now)
  const lastWorkoutWeekStart = getWeekStart(uniqueDates[0])

  // If no workout this week or last week, streak is 0
  const weekDiff = Math.floor(
    (currentWeekStart.getTime() - lastWorkoutWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
  )
  if (weekDiff > 1) return 0

  // Count consecutive weeks backwards
  let streak = 0
  const workoutWeeks = new Set(
    uniqueDates.map((d) => getWeekStart(d).getTime()),
  )

  let checkWeek = weekDiff === 0 ? currentWeekStart : lastWorkoutWeekStart
  while (workoutWeeks.has(checkWeek.getTime())) {
    streak++
    checkWeek = new Date(checkWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  return streak
}

function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  // Week starts Monday
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

export function getWorkoutsThisWeek(logs: WorkoutLog[]): number {
  const now = new Date()
  const weekStart = getWeekStart(now)

  return logs.filter((log) => {
    if (!log.completed) return false
    const logDate = new Date(log.completedAt)
    return logDate >= weekStart
  }).length
}
