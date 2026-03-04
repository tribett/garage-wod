import type { WorkoutLog } from '@/types/workout-log'
import type { WodType } from '@/types/program'
import type { MovementCategory } from '@/lib/movement-frequency'
import { getFrequencyBreakdown, getGaps } from '@/lib/movement-frequency'

export interface GeneratedMovement {
  name: string
  reps: number
  category: MovementCategory
}

export interface GeneratedWod {
  name: string
  type: WodType
  duration?: number
  rounds?: number
  movements: GeneratedMovement[]
  targetCategories: MovementCategory[]
  reasoning: string
}

export const MOVEMENT_POOL: Record<MovementCategory, string[]> = {
  squat: ['Air Squat', 'Goblet Squat', 'Wall Ball', 'Thruster'],
  hinge: ['Kettlebell Swing', 'Deadlift', 'Power Clean'],
  push: ['Push-up', 'Push Press', 'Shoulder Press', 'Dip'],
  pull: ['Pull-up', 'Ring Row', 'Bent Over Row'],
  carry: ['Farmer Carry', 'Overhead Carry', 'Suitcase Carry'],
  cardio: ['Run', 'Row', 'Bike', 'Jump Rope', 'Burpee'],
  core: ['Sit-up', 'Toes-to-Bar', 'Plank Hold', 'V-up'],
  other: ['Box Jump', 'Wall Walk'],
}

/** Weighted movements: bodyweight gets higher reps, weighted gets lower */
const WEIGHTED_MOVEMENTS = new Set([
  'Goblet Squat', 'Wall Ball', 'Thruster',
  'Kettlebell Swing', 'Deadlift', 'Power Clean',
  'Push Press', 'Shoulder Press',
  'Bent Over Row',
  'Farmer Carry', 'Overhead Carry', 'Suitcase Carry',
])

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const WOD_TYPES: WodType[] = ['amrap', 'forTime', 'emom']

export function generateWod(
  recentLogs: WorkoutLog[],
  _availableEquipment?: string[],
  preferredType?: WodType,
  seed?: number,
): GeneratedWod {
  const effectiveSeed = seed ?? Math.floor(Math.random() * 2147483646) + 1
  const rand = seededRandom(effectiveSeed)

  // Warm up the RNG to get past the low-entropy initial state
  for (let i = 0; i < 5; i++) rand()

  // Find gap categories
  const breakdown = getFrequencyBreakdown(recentLogs)
  const gaps = getGaps(breakdown)

  // Determine WOD type
  const wodType = preferredType ?? WOD_TYPES[Math.floor(rand() * WOD_TYPES.length)]

  // Pick number of movements: 3-5
  const numMovements = 3 + Math.floor(rand() * 3) // 3, 4, or 5

  // Build weighted category list: gap categories get 3x weight
  const allCategories: MovementCategory[] = (Object.keys(MOVEMENT_POOL) as MovementCategory[])
  const weightedCategories: MovementCategory[] = []
  for (const cat of allCategories) {
    const weight = gaps.includes(cat) ? 3 : 1
    for (let i = 0; i < weight; i++) {
      weightedCategories.push(cat)
    }
  }

  // Pick movements, avoiding duplicates
  const chosenMovements: GeneratedMovement[] = []
  const usedNames = new Set<string>()

  // Target categories for the response
  const targetCategories = gaps.length > 0 ? [...gaps] : []

  for (let i = 0; i < numMovements; i++) {
    let category: MovementCategory

    // For the first few movements when there are gaps, prioritize gap categories
    if (i < gaps.length && gaps.length > 0) {
      category = gaps[i % gaps.length]
    } else {
      // Pick from weighted categories
      category = weightedCategories[Math.floor(rand() * weightedCategories.length)]
    }

    const pool = MOVEMENT_POOL[category]
    // Try to pick a movement not already used
    let movement: string | undefined
    const shuffledPool = [...pool].sort(() => rand() - 0.5)
    for (const m of shuffledPool) {
      if (!usedNames.has(m)) {
        movement = m
        break
      }
    }

    // If all movements in this category are used, try another category
    if (!movement) {
      for (const cat of allCategories) {
        const altPool = MOVEMENT_POOL[cat]
        const shuffledAlt = [...altPool].sort(() => rand() - 0.5)
        for (const m of shuffledAlt) {
          if (!usedNames.has(m)) {
            movement = m
            category = cat
            break
          }
        }
        if (movement) break
      }
    }

    if (!movement) break // No more unique movements available

    usedNames.add(movement)

    // Determine reps
    const isWeighted = WEIGHTED_MOVEMENTS.has(movement)
    const reps = isWeighted
      ? 5 + Math.floor(rand() * 11) // 5-15
      : 12 + Math.floor(rand() * 10) // 12-21

    chosenMovements.push({
      name: movement,
      reps,
      category,
    })
  }

  // Determine duration/rounds
  let duration: number | undefined
  let rounds: number | undefined

  if (wodType === 'amrap') {
    duration = 8 + Math.floor(rand() * 13) // 8-20
  } else if (wodType === 'emom') {
    duration = 10 + Math.floor(rand() * 11) // 10-20
  } else if (wodType === 'forTime') {
    rounds = 3 + Math.floor(rand() * 3) // 3-5
  }

  // Build reasoning
  let reasoning: string
  if (gaps.length > 0) {
    reasoning = `Targeting gaps in ${gaps.join(', ')}. These categories have been underrepresented in recent training.`
  } else {
    reasoning = 'No significant gaps detected. Generated a balanced random workout.'
  }

  const name = `Garage Grinder #${effectiveSeed % 1000}`

  return {
    name,
    type: wodType,
    duration,
    rounds,
    movements: chosenMovements,
    targetCategories,
    reasoning,
  }
}
