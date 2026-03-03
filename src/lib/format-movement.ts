import type { Movement } from '@/types/program'

/**
 * Format a Movement into a single human-readable line for display in contexts
 * like the timer page or share cards.
 *
 * Examples:
 *   "5 x 3 Back Squat (315#)"
 *   "21 Thrusters (95/65)"
 *   "400m Run"
 *   "60s Plank Hold"
 *   "Pull-ups"
 */
export function formatMovementLine(movement: Movement): string {
  const parts: string[] = []

  // Sets x Reps prefix
  if (movement.sets && movement.reps) {
    parts.push(`${movement.sets} x ${movement.reps}`)
  } else if (movement.reps) {
    parts.push(`${movement.reps}`)
  } else if (movement.distance) {
    parts.push(movement.distance)
  } else if (movement.duration) {
    parts.push(`${movement.duration}s`)
  }

  // Movement name
  parts.push(movement.name)

  // Weight parenthetical
  if (movement.weight) {
    parts.push(`(${movement.weight})`)
  }

  return parts.join(' ')
}
