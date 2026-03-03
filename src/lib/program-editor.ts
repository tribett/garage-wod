import type { Program, WodType } from '@/types/program'
import { formatMovementLine } from './format-movement'

interface EditorDayTemplate {
  name: string
  wodType: WodType
  movements: string
}

export interface EditorProgramTemplate {
  name: string
  description: string
  weeks: number
  daysPerWeek: number
  days: EditorDayTemplate[]
}

/**
 * Convert a Program back into an editable template — the reverse of `buildProgram()`.
 *
 * Extracts structure from the first phase/week:
 *   - Total weeks = sum of (weekEnd - weekStart + 1) across all phases
 *   - Days per week = day count from the first week
 *   - Each day's WOD type comes from the first 'wod' block with scoring
 *   - Movements are formatted back to text lines via `formatMovementLine`
 */
export function programToTemplate(program: Program): EditorProgramTemplate {
  const weeks = program.phases.reduce(
    (total, phase) => total + (phase.weekEnd - phase.weekStart + 1),
    0,
  )

  const firstWeek = program.phases[0]?.weeks[0]

  const days: EditorDayTemplate[] =
    firstWeek?.days.map((day) => {
      // Find the first WOD-type block that has scoring info
      const wodBlock = day.blocks.find((b) => b.type === 'wod' && b.scoring)
      const wodType: WodType = wodBlock?.scoring?.type ?? 'forTime'

      // Flatten all movements from every block into formatted text lines
      const allMovements = day.blocks.flatMap((b) => b.movements)
      const movements = allMovements.map(formatMovementLine).join('\n')

      return { name: day.name, wodType, movements }
    }) ?? []

  return {
    name: program.name,
    description: program.description,
    weeks,
    daysPerWeek: days.length,
    days,
  }
}
