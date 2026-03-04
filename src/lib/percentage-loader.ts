/**
 * Percentage-based loading from 1RMs.
 *
 * Parses weight strings like "80%", "@ 75%", or "80% 1RM" and resolves
 * them to concrete loads using a PR map and the Epley formula.
 */

export function parsePercentage(weightStr: string): { percentage: number } | null {
  // Matches: "80%", "80% 1RM", "@80%", "@ 80%"
  const match = weightStr.match(/(?:@\s*)?(\d{1,3})%/)
  if (!match) return null
  return { percentage: parseInt(match[1], 10) }
}

export function calculateLoadFromPercentage(
  percentage: number,
  estimatedOneRM: number,
  roundTo: number = 5,
): number {
  const raw = (percentage / 100) * estimatedOneRM
  return Math.round(raw / roundTo) * roundTo
}

export function resolveWeight(
  weightStr: string,
  movementName: string,
  prs: Map<string, { weight: number; reps: number }>,
  estimateOneRM: (weight: number, reps: number) => number,
  roundTo: number = 5,
): { display: string; calculated: number } | null {
  const parsed = parsePercentage(weightStr)
  if (!parsed) return null
  const pr = prs.get(movementName.toLowerCase())
  if (!pr) return null
  const oneRM = estimateOneRM(pr.weight, pr.reps)
  const load = calculateLoadFromPercentage(parsed.percentage, oneRM, roundTo)
  return { display: `${load}`, calculated: load }
}
