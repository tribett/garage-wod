import { MOVEMENT_VIDEOS } from '@/data/movement-videos'

/**
 * Pre-compute a lowercase map for O(1) case-insensitive lookups.
 */
const lowerMap = new Map(
  Object.entries(MOVEMENT_VIDEOS).map(([k, v]) => [k.toLowerCase(), v]),
)

function stripPlural(s: string): string {
  return s.endsWith('s') ? s.slice(0, -1) : s
}

/**
 * Look up a YouTube video ID for a CrossFit movement name.
 *
 * Matching strategy (most → least specific):
 *   1. Exact case-insensitive match
 *   2. Strip trailing "s" (plurals) then re-check
 *   3. Substring: find the longest known key contained within the query
 */
export function getMovementVideoId(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()

  // 1. Exact match
  if (lowerMap.has(lower)) return lowerMap.get(lower)!

  // 2. Strip plural
  const singular = stripPlural(lower)
  if (lowerMap.has(singular)) return lowerMap.get(singular)!

  // 3. Substring — longest key that appears inside the query wins
  let bestVal: string | null = null
  let bestLen = 0
  for (const [key, val] of lowerMap) {
    if (singular.includes(key) && key.length > bestLen) {
      bestVal = val
      bestLen = key.length
    }
  }

  return bestVal
}
