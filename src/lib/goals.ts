export type GoalType = 'weight' | 'time' | 'skill'

export interface Goal {
  id: string
  type: GoalType
  movementName: string
  targetValue: number // lbs for weight, seconds for time, reps for skill
  currentValue?: number
  unit: string
  deadline?: string // YYYY-MM-DD
  createdAt: string
  completedAt?: string
}

export function createGoal(params: Omit<Goal, 'id' | 'createdAt'>): Goal {
  return { ...params, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
}

export function calculateProgress(goal: Goal): {
  percentage: number
  remaining: number
  isComplete: boolean
} {
  if (!goal.currentValue) return { percentage: 0, remaining: goal.targetValue, isComplete: false }
  const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100)
  return {
    percentage: Math.round(pct),
    remaining: Math.max(0, goal.targetValue - goal.currentValue),
    isComplete: pct >= 100,
  }
}

export function updateGoalProgress(
  goal: Goal,
  prs: Map<string, { weight: number; reps: number }>,
): Goal {
  const pr = prs.get(goal.movementName.toLowerCase())
  if (!pr) return goal
  if (goal.type === 'weight') {
    const updated = { ...goal, currentValue: pr.weight }
    if (pr.weight >= goal.targetValue && !goal.completedAt) {
      updated.completedAt = new Date().toISOString()
    }
    return updated
  }
  return goal
}

export function getDaysRemaining(goal: Goal): number | null {
  if (!goal.deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(goal.deadline + 'T00:00:00')
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function sortGoals(goals: Goal[]): Goal[] {
  // Active goals first (no completedAt), sorted by deadline (soonest first, null last)
  // Then completed goals sorted by completedAt descending
  return [...goals].sort((a, b) => {
    if (a.completedAt && !b.completedAt) return 1
    if (!a.completedAt && b.completedAt) return -1
    if (!a.completedAt && !b.completedAt) {
      // Both active — sort by deadline
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
      if (a.deadline) return -1
      if (b.deadline) return 1
      return 0
    }
    // Both completed — sort by completedAt descending
    return (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
  })
}
