import { type MovementCategory, categorizeMovement } from '@/lib/movement-frequency'

export interface WarmUpExercise {
  name: string
  duration: string
  category: 'general' | 'mobility' | 'activation' | 'buildup'
}

export interface WarmUpRoutine {
  exercises: WarmUpExercise[]
  estimatedMinutes: number
  targetAreas: string[]
}

export const WARMUP_LIBRARY: Record<string, WarmUpExercise[]> = {
  general: [
    { name: 'Jumping Jacks', duration: '30 seconds', category: 'general' },
    { name: 'High Knees', duration: '30 seconds', category: 'general' },
    { name: 'Arm Circles', duration: '20 seconds', category: 'general' },
  ],
  squat: [
    { name: 'Hip Circles', duration: '10 each side', category: 'mobility' },
    { name: 'Ankle Rocks', duration: '10 each side', category: 'mobility' },
    { name: 'Bodyweight Squats', duration: '10 reps', category: 'activation' },
    { name: 'Goblet Squat Hold', duration: '30 seconds', category: 'activation' },
  ],
  hinge: [
    { name: 'Cat-Cow Stretch', duration: '10 reps', category: 'mobility' },
    { name: 'Good Mornings', duration: '10 reps', category: 'activation' },
    { name: 'Single-Leg RDL', duration: '8 each side', category: 'activation' },
  ],
  push: [
    { name: 'Shoulder Pass-Throughs', duration: '10 reps', category: 'mobility' },
    { name: 'Scapular Push-ups', duration: '10 reps', category: 'activation' },
    { name: 'PVC Overhead Press', duration: '10 reps', category: 'activation' },
  ],
  pull: [
    { name: 'Band Pull-Aparts', duration: '15 reps', category: 'activation' },
    { name: 'Scapular Pull-ups', duration: '10 reps', category: 'activation' },
    { name: 'Lat Stretch', duration: '30 seconds each', category: 'mobility' },
  ],
  cardio: [
    { name: 'Easy Jog', duration: '2 minutes', category: 'general' },
    { name: 'Jump Rope', duration: '1 minute', category: 'general' },
  ],
  core: [
    { name: 'Dead Bug', duration: '10 reps', category: 'activation' },
    { name: 'Plank Hold', duration: '30 seconds', category: 'activation' },
  ],
}

const BARBELL_MOVEMENTS = [
  'squat', 'press', 'deadlift', 'clean', 'snatch', 'jerk', 'thruster', 'bench',
]

const CATEGORY_TO_TARGET_AREA: Record<string, string> = {
  squat: 'hips',
  hinge: 'posterior chain',
  push: 'shoulders',
  pull: 'back',
  cardio: 'cardiovascular',
  core: 'core',
  carry: 'grip',
}

function isBarbellMovement(name: string): boolean {
  const lower = name.toLowerCase()
  return BARBELL_MOVEMENTS.some((keyword) => lower.includes(keyword))
}

function addExercise(
  exercises: WarmUpExercise[],
  exercise: WarmUpExercise,
): void {
  if (!exercises.some((e) => e.name === exercise.name)) {
    exercises.push(exercise)
  }
}

export function generateWarmUp(
  movements: { name: string }[],
  durationMinutes: number = 8,
): WarmUpRoutine {
  if (movements.length === 0) {
    return { exercises: [], estimatedMinutes: 0, targetAreas: [] }
  }

  const exercises: WarmUpExercise[] = []

  // 1. Always start with 1-2 general warm-up exercises
  const generalExercises = WARMUP_LIBRARY.general
  addExercise(exercises, generalExercises[0]) // Jumping Jacks
  addExercise(exercises, generalExercises[1]) // High Knees

  // 2. Categorize each movement and collect unique categories
  const categories = new Set<MovementCategory>()
  for (const movement of movements) {
    categories.add(categorizeMovement(movement.name))
  }

  // 3. Add mobility + activation exercises for each unique category
  for (const category of categories) {
    const categoryExercises = WARMUP_LIBRARY[category]
    if (categoryExercises) {
      for (const exercise of categoryExercises) {
        addExercise(exercises, exercise)
      }
    }
  }

  // 4. Add buildup exercise if barbell movements detected
  const hasBarbellMovement = movements.some((m) => isBarbellMovement(m.name))
  if (hasBarbellMovement) {
    addExercise(exercises, {
      name: 'Empty Bar Warm-up Sets',
      duration: '3 sets of 5',
      category: 'buildup',
    })
  }

  // 5. Limit total exercises to fit within durationMinutes (~1 min each)
  const maxExercises = durationMinutes
  const limitedExercises = exercises.slice(0, maxExercises)

  // 6. Track target areas based on categories found
  const targetAreas: string[] = []
  for (const category of categories) {
    const area = CATEGORY_TO_TARGET_AREA[category]
    if (area && !targetAreas.includes(area)) {
      targetAreas.push(area)
    }
  }

  // 7. Estimate total duration (count exercises * ~1 min each)
  const estimatedMinutes = limitedExercises.length

  return {
    exercises: limitedExercises,
    estimatedMinutes,
    targetAreas,
  }
}
