import { MOVEMENT_VIDEOS } from '@/data/movement-videos'

/**
 * Pre-compute a lowercase map for O(1) case-insensitive lookups.
 */
const lowerMap = new Map(
  Object.entries(MOVEMENT_VIDEOS).map(([k, v]) => [k.toLowerCase(), v]),
)

/**
 * Common CrossFit abbreviations → full names.
 * Applied before lookup so "KB Swings" → "Kettlebell Swings" → matches
 * "Kettlebell Swing" via plural stripping.
 */
const ABBREVIATIONS: [RegExp, string][] = [
  [/\bKB\b/gi, 'Kettlebell'],
  [/\bDB\b/gi, 'Dumbbell'],
  [/\bBB\b/gi, 'Barbell'],
  [/\bOHS\b/gi, 'Overhead Squat'],
  [/\bHSPU\b/gi, 'Handstand Push-up'],
  [/\bT2B\b/gi, 'Toes-to-Bar'],
  [/\bC2B\b/gi, 'Chest-to-Bar Pull-up'],
  [/\bGHD\b/gi, 'GHD'],
  [/\bDU\b/gi, 'Double-under'],
  [/\bSU\b/gi, 'Single-under'],
  [/\bSDHP\b/gi, 'Sumo Deadlift High Pull'],
  [/\bMU\b/gi, 'Muscle-up'],
  [/\bG2OH?\b/gi, 'Clean and Jerk'],
  [/\bGTOH\b/gi, 'Clean and Jerk'],
  [/\bGround[- ]to[- ]Overheads?\b/gi, 'Clean and Jerk'],
]

function expandAbbreviations(name: string): string {
  let expanded = name
  for (const [pattern, replacement] of ABBREVIATIONS) {
    expanded = expanded.replace(pattern, replacement)
  }
  return expanded
}

function stripPlural(s: string): string {
  return s.endsWith('s') ? s.slice(0, -1) : s
}

/**
 * Look up a YouTube video ID for a CrossFit movement name.
 *
 * Matching strategy (most → least specific):
 *   1. Expand common abbreviations (KB→Kettlebell, DB→Dumbbell, etc.)
 *   2. Exact case-insensitive match
 *   3. Strip trailing "s" (plurals) then re-check
 *   4. Substring: find the longest known key contained within the query
 */
export function getMovementVideoId(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const expanded = expandAbbreviations(trimmed)
  const lower = expanded.toLowerCase()

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
