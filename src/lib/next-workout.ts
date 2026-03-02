import type { Program, Day } from '@/types/program'
import type { WorkoutLog } from '@/types/workout-log'

export interface NextWorkoutResult {
  day: Day
  weekNumber: number
}

/**
 * Finds the next uncompleted workout in a program, starting from the given
 * position (week/day) and scanning forward through all remaining weeks.
 */
export function findNextWorkout(
  program: Program | null,
  position: { week: number; day: number },
  logs: WorkoutLog[],
): NextWorkoutResult | null {
  if (!program) return null

  const completedSet = new Set(
    logs
      .filter((l) => l.completed)
      .map((l) => `${l.weekNumber}-${l.dayNumber}`),
  )

  for (const phase of program.phases) {
    for (const week of phase.weeks) {
      // Skip weeks before the current position
      if (week.weekNumber < position.week) continue

      for (const day of week.days) {
        // Skip days at or before the current position within the same week
        if (week.weekNumber === position.week && day.dayNumber <= position.day) continue

        const key = `${week.weekNumber}-${day.dayNumber}`
        if (!completedSet.has(key)) {
          return { day, weekNumber: week.weekNumber }
        }
      }

      // If we're past the current week, check from the start of subsequent weeks
      // (the loop already handles this since day.dayNumber > position.day won't
      // filter anything when weekNumber > position.week — except it does because
      // the condition only applies when weekNumber === position.week)
    }
  }

  return null
}
