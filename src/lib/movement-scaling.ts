import { MOVEMENT_SCALING } from '@/data/movement-scaling'

/**
 * Pre-compute a lowercase map for O(1) case-insensitive lookups.
 */
const lowerMap = new Map(
  Object.entries(MOVEMENT_SCALING).map(([k, v]) => [k.toLowerCase(), v]),
)

function stripPlural(s: string): string {
  return s.endsWith('s') ? s.slice(0, -1) : s
}

/**
 * Look up scaling progressions for a CrossFit movement.
 * Returns options ordered from Rx (hardest) to most accessible, or null.
 *
 * Matching strategy mirrors movement-videos: exact → plural strip → substring.
 */
export function getScalingOptions(name: string): string[] | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()

  // 1. Exact match
  if (lowerMap.has(lower)) return lowerMap.get(lower)!

  // 2. Strip plural
  const singular = stripPlural(lower)
  if (lowerMap.has(singular)) return lowerMap.get(singular)!

  // 3. Substring — longest key inside the query
  let bestVal: string[] | null = null
  let bestLen = 0
  for (const [key, val] of lowerMap) {
    if (singular.includes(key) && key.length > bestLen) {
      bestVal = val
      bestLen = key.length
    }
  }

  return bestVal
}
