import type { Program } from '@/types/program'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  program?: Program
}

const VALID_BLOCK_TYPES = ['warmup', 'skill', 'wod', 'cooldown']
const VALID_WOD_TYPES = ['amrap', 'emom', 'forTime', 'tabata', 'rounds']

export function validateProgram(data: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ path: '', message: 'Program must be an object' }] }
  }

  const obj = data as Record<string, unknown>

  // Top-level required fields
  if (!isNonEmptyString(obj.id)) errors.push({ path: 'id', message: 'Required: non-empty string' })
  if (!isNonEmptyString(obj.name)) errors.push({ path: 'name', message: 'Required: non-empty string' })
  if (!isNonEmptyString(obj.author)) errors.push({ path: 'author', message: 'Required: non-empty string' })
  if (!isNonEmptyString(obj.version)) errors.push({ path: 'version', message: 'Required: non-empty string' })

  if (!Array.isArray(obj.phases) || obj.phases.length === 0) {
    errors.push({ path: 'phases', message: 'Required: non-empty array of phases' })
    return { valid: false, errors }
  }

  const allMovementIds = new Set<string>()

  for (let pi = 0; pi < obj.phases.length; pi++) {
    const phase = obj.phases[pi] as Record<string, unknown>
    const pp = `phases[${pi}]`

    if (!isNonEmptyString(phase.name)) errors.push({ path: `${pp}.name`, message: 'Required: non-empty string' })
    if (typeof phase.weekStart !== 'number') errors.push({ path: `${pp}.weekStart`, message: 'Required: number' })
    if (typeof phase.weekEnd !== 'number') errors.push({ path: `${pp}.weekEnd`, message: 'Required: number' })
    if (typeof phase.weekStart === 'number' && typeof phase.weekEnd === 'number' && phase.weekStart > phase.weekEnd) {
      errors.push({ path: `${pp}`, message: 'weekStart must be <= weekEnd' })
    }

    if (!Array.isArray(phase.weeks)) {
      errors.push({ path: `${pp}.weeks`, message: 'Required: array of weeks' })
      continue
    }

    for (let wi = 0; wi < phase.weeks.length; wi++) {
      const week = phase.weeks[wi] as Record<string, unknown>
      const wp = `${pp}.weeks[${wi}]`

      if (typeof week.weekNumber !== 'number') {
        errors.push({ path: `${wp}.weekNumber`, message: 'Required: number' })
      }

      if (!Array.isArray(week.days)) {
        errors.push({ path: `${wp}.days`, message: 'Required: array of days' })
        continue
      }

      for (let di = 0; di < week.days.length; di++) {
        const day = week.days[di] as Record<string, unknown>
        const dp = `${wp}.days[${di}]`

        if (typeof day.dayNumber !== 'number') errors.push({ path: `${dp}.dayNumber`, message: 'Required: number' })
        if (!isNonEmptyString(day.name)) errors.push({ path: `${dp}.name`, message: 'Required: non-empty string' })

        if (!Array.isArray(day.blocks)) {
          errors.push({ path: `${dp}.blocks`, message: 'Required: array of blocks' })
          continue
        }

        for (let bi = 0; bi < day.blocks.length; bi++) {
          const block = day.blocks[bi] as Record<string, unknown>
          const bp = `${dp}.blocks[${bi}]`

          if (!VALID_BLOCK_TYPES.includes(block.type as string)) {
            errors.push({
              path: `${bp}.type`,
              message: `Must be one of: ${VALID_BLOCK_TYPES.join(', ')}. Got: "${block.type}"`,
            })
          }

          if (!isNonEmptyString(block.name)) errors.push({ path: `${bp}.name`, message: 'Required: non-empty string' })

          if (!Array.isArray(block.movements) || block.movements.length === 0) {
            errors.push({ path: `${bp}.movements`, message: 'Required: non-empty array' })
            continue
          }

          for (let mi = 0; mi < block.movements.length; mi++) {
            const mov = block.movements[mi] as Record<string, unknown>
            const mp = `${bp}.movements[${mi}]`

            if (!isNonEmptyString(mov.id)) {
              errors.push({ path: `${mp}.id`, message: 'Required: non-empty string' })
            } else if (allMovementIds.has(mov.id as string)) {
              errors.push({ path: `${mp}.id`, message: `Duplicate movement ID: "${mov.id}"` })
            } else {
              allMovementIds.add(mov.id as string)
            }

            if (!isNonEmptyString(mov.name)) errors.push({ path: `${mp}.name`, message: 'Required: non-empty string' })
          }

          // Validate scoring if present
          if (block.scoring) {
            const scoring = block.scoring as Record<string, unknown>
            const sp = `${bp}.scoring`

            if (!VALID_WOD_TYPES.includes(scoring.type as string)) {
              errors.push({
                path: `${sp}.type`,
                message: `Must be one of: ${VALID_WOD_TYPES.join(', ')}. Got: "${scoring.type}"`,
              })
            }
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, errors: [], program: data as Program }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
