import type { WorkoutBlock } from '@/types/program'

export interface DifficultyFactor {
  description: string
  impact: 'low' | 'medium' | 'high'
}

export interface DifficultyPrediction {
  score: number
  label: string
  factors: DifficultyFactor[]
}

const COMPLEX_MOVEMENTS = [
  'muscle-up',
  'snatch',
  'handstand walk',
  'handstand push-up',
  'pistol squat',
  'ring muscle-up',
  'bar muscle-up',
]

function getLabel(score: number): string {
  if (score <= 3) return 'Light'
  if (score <= 5) return 'Moderate'
  if (score <= 7) return 'Challenging'
  if (score <= 9) return 'Brutal'
  return 'Competition-Level'
}

function isComplex(name: string): boolean {
  const lower = name.toLowerCase()
  return COMPLEX_MOVEMENTS.some((cm) => lower.includes(cm))
}

export function predictDifficulty(
  blocks: WorkoutBlock[],
  prs: Map<string, { value: number; reps: number }>,
  recentRPEs?: number[],
  _bodyweight?: number, // eslint-disable-line @typescript-eslint/no-unused-vars
): DifficultyPrediction {
  const factors: DifficultyFactor[] = []

  const allMovements = blocks.flatMap((b) => b.movements)
  const movementCount = allMovements.length

  // Calculate total volume
  let totalVolume = 0
  for (const mov of allMovements) {
    const sets = mov.sets ?? 1
    const reps = typeof mov.reps === 'number' ? mov.reps : 0
    totalVolume += sets * reps
  }

  // --- Base score from volume ---
  let score = 0
  if (totalVolume <= 20) {
    score = 1
  } else if (totalVolume <= 75) {
    score = 2
  } else if (totalVolume <= 150) {
    score = 3
  } else if (totalVolume <= 300) {
    score = 4
  } else {
    score = 5
  }

  // Movement count factor
  if (movementCount >= 5) {
    score += 1
    factors.push({ description: `High movement count (${movementCount} movements)`, impact: 'high' })
  } else if (movementCount >= 3) {
    factors.push({ description: `${movementCount} movements in workout`, impact: 'medium' })
  } else {
    factors.push({ description: `${totalVolume} total reps across ${movementCount} movement(s)`, impact: 'low' })
  }

  // --- Weight intensity relative to PRs ---
  let heavySets = 0
  let moderateSets = 0
  for (const mov of allMovements) {
    if (!mov.weight) continue
    const weight = parseFloat(mov.weight)
    if (isNaN(weight)) continue
    const pr = prs.get(mov.name)
    if (!pr) continue
    const pct = weight / pr.value
    const sets = mov.sets ?? 1
    if (pct >= 0.9) {
      heavySets += sets
    } else if (pct >= 0.8) {
      moderateSets += sets
    }
  }

  if (heavySets > 0) {
    const heavyPoints = heavySets >= 10 ? 5 : heavySets >= 6 ? 4 : heavySets >= 3 ? 3 : 2
    score += heavyPoints
    factors.push({ description: `Heavy loading (>90% of PR) across ${heavySets} sets`, impact: 'high' })
  }

  if (moderateSets > 0) {
    const modPoints = moderateSets >= 8 ? 4 : moderateSets >= 4 ? 3 : moderateSets >= 2 ? 2 : 1
    score += modPoints
    factors.push({ description: `Moderate loading (80-90% of PR) across ${moderateSets} sets`, impact: 'medium' })
  }

  // --- Complex movements ---
  const complexMovs = allMovements.filter((m) => isComplex(m.name))
  if (complexMovs.length > 0) {
    const complexPoints = complexMovs.length >= 3 ? 3 : complexMovs.length >= 2 ? 2 : 1
    score += complexPoints
    factors.push({
      description: `Complex movements (${complexMovs.map((m) => m.name).join(', ')})`,
      impact: 'high',
    })
  }

  // --- RPE calibration ---
  let rpeBump = 0
  if (recentRPEs && recentRPEs.length > 0) {
    const avgRPE = recentRPEs.reduce((a, b) => a + b, 0) / recentRPEs.length
    if (avgRPE >= 9) {
      rpeBump = 2
    } else if (avgRPE >= 8) {
      rpeBump = 1
    }
    if (rpeBump > 0) {
      score += rpeBump
      factors.push({ description: `Recent RPE average of ${avgRPE.toFixed(1)} indicates high fatigue`, impact: 'high' })
    }
  }

  // Clamp score 1-10
  score = Math.max(1, Math.min(10, score))

  return {
    score,
    label: getLabel(score),
    factors,
  }
}
