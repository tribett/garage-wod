import { generateId } from './id'
import type { Program, Phase, Week, Day, WorkoutBlock, Movement, WodType, WodScoring } from '@/types/program'

export interface DayTemplate {
  name: string
  wodType: WodType
  wodName: string
  wodDescription?: string
  /** One movement per line: "10 Thrusters (95/65)" */
  movementLines: string[]
  scoring?: Partial<WodScoring>
}

export interface ProgramTemplate {
  name: string
  description: string
  weeks: number
  daysPerWeek: DayTemplate[]
}

/**
 * Parses a single movement line like "10 Thrusters (95/65)" into a Movement object.
 * Supports formats:
 *   "10 Back Squats"          → reps=10, name="Back Squats"
 *   "Thrusters (95/65)"      → name="Thrusters", weight="95/65"
 *   "10 Thrusters (95/65)"   → reps=10, name="Thrusters", weight="95/65"
 *   "Run 400m"               → name="Run 400m"
 */
export function parseMovementLine(line: string): Movement {
  const trimmed = line.trim()
  if (!trimmed) {
    return { id: generateId(), name: 'Unknown' }
  }

  let reps: number | undefined
  let name: string
  let weight: string | undefined

  // Extract parenthetical weight: "(95/65)" or "(Heavy DB)"
  const weightMatch = trimmed.match(/\(([^)]+)\)\s*$/)
  const withoutWeight = weightMatch ? trimmed.slice(0, weightMatch.index).trim() : trimmed
  if (weightMatch) {
    weight = weightMatch[1]
  }

  // Extract leading number for reps: "10 Thrusters" → reps=10
  const repsMatch = withoutWeight.match(/^(\d+)\s+(.+)/)
  if (repsMatch) {
    reps = parseInt(repsMatch[1], 10)
    name = repsMatch[2]
  } else {
    name = withoutWeight
  }

  return {
    id: generateId(),
    name,
    reps,
    weight,
  }
}

/**
 * Builds a full Program object from a simple template.
 * Replicates the weekly day pattern across all weeks.
 */
export function buildProgram(template: ProgramTemplate): Program {
  const weeks: Week[] = []

  for (let w = 1; w <= template.weeks; w++) {
    const days: Day[] = template.daysPerWeek.map((dayTemplate, i) => {
      const movements: Movement[] = dayTemplate.movementLines
        .filter((l) => l.trim())
        .map(parseMovementLine)

      const scoring: WodScoring = {
        type: dayTemplate.wodType,
        ...dayTemplate.scoring,
      }

      const wodBlock: WorkoutBlock = {
        type: 'wod',
        name: dayTemplate.wodName || dayTemplate.name,
        description: dayTemplate.wodDescription,
        movements,
        scoring,
      }

      return {
        dayNumber: i + 1,
        name: dayTemplate.name,
        blocks: [wodBlock],
      }
    })

    weeks.push({ weekNumber: w, days })
  }

  const phase: Phase = {
    name: template.name,
    description: template.description,
    weekStart: 1,
    weekEnd: template.weeks,
    weeks,
  }

  return {
    id: generateId(),
    name: template.name,
    author: 'Custom',
    description: template.description,
    version: '1.0.0',
    phases: [phase],
  }
}
