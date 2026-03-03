export interface PercentageEntry {
  percentage: number
  weight: number
}

/**
 * Estimate a one-rep max using the Epley formula:
 *   1RM = weight × (1 + reps / 30)
 *
 * Returns the weight itself for single reps, and 0 for invalid inputs.
 */
export function estimate1RM(weight: number, reps: number): number {
  if (weight === 0 || reps === 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/** Standard percentage breakpoints for training tables. */
const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

/**
 * Generate a percentage table from a known 1RM.
 * Returns entries from 50% to 100% with weights rounded to the nearest integer.
 */
export function getPercentages(oneRM: number): PercentageEntry[] {
  return PERCENTAGES.map((p) => ({
    percentage: p,
    weight: Math.round(oneRM * (p / 100)),
  }))
}
