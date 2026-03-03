import type { Program } from '@/types/program'

export interface WeekDay {
  dayNumber: number
  name: string
}

/**
 * Returns all days in the specified week of a program.
 * Returns empty array if week not found.
 */
export function getWeekDays(program: Program | null, weekNumber: number): WeekDay[] {
  if (!program) return []
  for (const phase of program.phases) {
    for (const week of phase.weeks) {
      if (week.weekNumber === weekNumber) {
        return week.days.map((d) => ({ dayNumber: d.dayNumber, name: d.name }))
      }
    }
  }
  return []
}
