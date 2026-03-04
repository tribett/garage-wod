export type MovementCategory = 'squat' | 'hinge' | 'push' | 'pull' | 'carry' | 'cardio' | 'core' | 'other'

export const CATEGORY_MAP: Record<string, MovementCategory> = {
  'air squat': 'squat',
  'front squat': 'squat',
  'back squat': 'squat',
  'overhead squat': 'squat',
  'goblet squat': 'squat',
  'pistol': 'squat',
  'thruster': 'squat',
  'wall ball': 'squat',
  'deadlift': 'hinge',
  'clean': 'hinge',
  'power clean': 'hinge',
  'hang clean': 'hinge',
  'snatch': 'hinge',
  'power snatch': 'hinge',
  'hang snatch': 'hinge',
  'kettlebell swing': 'hinge',
  'clean and jerk': 'hinge',
  'sumo deadlift high pull': 'hinge',
  'shoulder press': 'push',
  'push press': 'push',
  'push jerk': 'push',
  'push-up': 'push',
  'bench press': 'push',
  'handstand push-up': 'push',
  'dip': 'push',
  'ring dip': 'push',
  'pull-up': 'pull',
  'chest-to-bar pull-up': 'pull',
  'muscle-up': 'pull',
  'bar muscle-up': 'pull',
  'toes-to-bar': 'pull',
  'ring row': 'pull',
  'rope climb': 'pull',
  'row': 'cardio',
  'double-under': 'cardio',
  'single-under': 'cardio',
  'burpee': 'cardio',
  'box jump': 'cardio',
  'box step-up': 'cardio',
  'sit-up': 'core',
  'ghd sit-up': 'core',
  'back extension': 'core',
  'l-sit': 'core',
  'knees-to-elbow': 'core',
  'turkish get-up': 'carry',
  'walking lunge': 'squat',
  'lunge': 'squat',
}

export function categorizeMovement(name: string): MovementCategory {
  const lower = name.toLowerCase().trim()
  // Exact match first
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower]
  // Substring match — longest key wins
  let bestCat: MovementCategory = 'other'
  let bestLen = 0
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key) && key.length > bestLen) {
      bestCat = cat
      bestLen = key.length
    }
  }
  return bestCat
}

export const ALL_CATEGORIES: MovementCategory[] = ['squat', 'hinge', 'push', 'pull', 'core', 'cardio', 'carry']

export function getFrequencyBreakdown(
  logs: { exercises?: { movementName: string }[]; completedAt: string }[],
  days: number = 30,
): Record<MovementCategory, number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString()

  const result: Record<MovementCategory, number> = {
    squat: 0, hinge: 0, push: 0, pull: 0, carry: 0, cardio: 0, core: 0, other: 0,
  }

  for (const log of logs) {
    if (log.completedAt < cutoffStr) continue
    if (!log.exercises) continue
    // Count unique categories per session (not per exercise)
    const sessionCats = new Set<MovementCategory>()
    for (const ex of log.exercises) {
      sessionCats.add(categorizeMovement(ex.movementName))
    }
    for (const cat of sessionCats) {
      result[cat]++
    }
  }

  return result
}

export function getGaps(
  breakdown: Record<MovementCategory, number>,
  threshold: number = 2,
): MovementCategory[] {
  return ALL_CATEGORIES.filter((cat) => breakdown[cat] < threshold)
}
