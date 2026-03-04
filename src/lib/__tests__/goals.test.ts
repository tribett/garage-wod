import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createGoal,
  calculateProgress,
  updateGoalProgress,
  getDaysRemaining,
  sortGoals,
} from '../goals'
import type { Goal } from '../goals'

describe('createGoal', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'test-id' })
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  test('generates id and createdAt', () => {
    const goal = createGoal({
      type: 'weight',
      movementName: 'Back Squat',
      targetValue: 315,
      unit: 'lbs',
    })
    expect(goal.id).toBe('test-id')
    expect(goal.createdAt).toBe('2025-06-15T12:00:00.000Z')
  })

  test('preserves all input fields', () => {
    const goal = createGoal({
      type: 'weight',
      movementName: 'Bench Press',
      targetValue: 225,
      currentValue: 185,
      unit: 'lbs',
      deadline: '2025-12-31',
    })
    expect(goal.type).toBe('weight')
    expect(goal.movementName).toBe('Bench Press')
    expect(goal.targetValue).toBe(225)
    expect(goal.currentValue).toBe(185)
    expect(goal.unit).toBe('lbs')
    expect(goal.deadline).toBe('2025-12-31')
  })
})

describe('calculateProgress', () => {
  test('returns 0% when no currentValue', () => {
    const goal: Goal = {
      id: '1',
      type: 'weight',
      movementName: 'Deadlift',
      targetValue: 400,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const result = calculateProgress(goal)
    expect(result.percentage).toBe(0)
    expect(result.remaining).toBe(400)
    expect(result.isComplete).toBe(false)
  })

  test('returns 50% for 50/100', () => {
    const goal: Goal = {
      id: '2',
      type: 'weight',
      movementName: 'Deadlift',
      targetValue: 100,
      currentValue: 50,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const result = calculateProgress(goal)
    expect(result.percentage).toBe(50)
    expect(result.remaining).toBe(50)
    expect(result.isComplete).toBe(false)
  })

  test('returns 100% and isComplete for 100/100', () => {
    const goal: Goal = {
      id: '3',
      type: 'weight',
      movementName: 'Deadlift',
      targetValue: 100,
      currentValue: 100,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const result = calculateProgress(goal)
    expect(result.percentage).toBe(100)
    expect(result.remaining).toBe(0)
    expect(result.isComplete).toBe(true)
  })

  test('caps at 100% when over target', () => {
    const goal: Goal = {
      id: '4',
      type: 'weight',
      movementName: 'Deadlift',
      targetValue: 100,
      currentValue: 150,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const result = calculateProgress(goal)
    expect(result.percentage).toBe(100)
    expect(result.remaining).toBe(0)
    expect(result.isComplete).toBe(true)
  })
})

describe('getDaysRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns positive number for future deadline', () => {
    const goal: Goal = {
      id: '5',
      type: 'weight',
      movementName: 'Squat',
      targetValue: 300,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
      deadline: '2025-06-25',
    }
    const days = getDaysRemaining(goal)
    expect(days).toBe(10)
  })

  test('returns null when no deadline', () => {
    const goal: Goal = {
      id: '6',
      type: 'weight',
      movementName: 'Squat',
      targetValue: 300,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const days = getDaysRemaining(goal)
    expect(days).toBeNull()
  })

  test('returns 0 for today deadline', () => {
    const goal: Goal = {
      id: '7',
      type: 'weight',
      movementName: 'Squat',
      targetValue: 300,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
      deadline: '2025-06-15',
    }
    const days = getDaysRemaining(goal)
    expect(days).toBe(0)
  })

  test('returns negative number for past deadline', () => {
    const goal: Goal = {
      id: '8',
      type: 'weight',
      movementName: 'Squat',
      targetValue: 300,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
      deadline: '2025-06-10',
    }
    const days = getDaysRemaining(goal)
    expect(days).toBe(-5)
  })
})

describe('updateGoalProgress', () => {
  test('updates weight from PR map', () => {
    const goal: Goal = {
      id: '9',
      type: 'weight',
      movementName: 'Back Squat',
      targetValue: 315,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const prs = new Map([['back squat', { weight: 275, reps: 3 }]])
    const updated = updateGoalProgress(goal, prs)
    expect(updated.currentValue).toBe(275)
  })

  test('marks complete when PR meets target', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))

    const goal: Goal = {
      id: '10',
      type: 'weight',
      movementName: 'Back Squat',
      targetValue: 315,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const prs = new Map([['back squat', { weight: 320, reps: 1 }]])
    const updated = updateGoalProgress(goal, prs)
    expect(updated.currentValue).toBe(320)
    expect(updated.completedAt).toBe('2025-06-15T12:00:00.000Z')

    vi.useRealTimers()
  })

  test('returns unchanged for missing PR', () => {
    const goal: Goal = {
      id: '11',
      type: 'weight',
      movementName: 'Overhead Press',
      targetValue: 185,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
    }
    const prs = new Map([['back squat', { weight: 275, reps: 3 }]])
    const updated = updateGoalProgress(goal, prs)
    expect(updated).toEqual(goal)
  })

  test('does not overwrite existing completedAt', () => {
    const goal: Goal = {
      id: '12',
      type: 'weight',
      movementName: 'Back Squat',
      targetValue: 315,
      unit: 'lbs',
      createdAt: '2025-01-01T00:00:00Z',
      completedAt: '2025-05-01T00:00:00Z',
      currentValue: 315,
    }
    const prs = new Map([['back squat', { weight: 325, reps: 1 }]])
    const updated = updateGoalProgress(goal, prs)
    expect(updated.completedAt).toBe('2025-05-01T00:00:00Z')
  })
})

describe('sortGoals', () => {
  test('puts active before completed, deadline ordering', () => {
    const goals: Goal[] = [
      {
        id: 'completed-1',
        type: 'weight',
        movementName: 'Deadlift',
        targetValue: 400,
        unit: 'lbs',
        createdAt: '2025-01-01T00:00:00Z',
        completedAt: '2025-03-01T00:00:00Z',
      },
      {
        id: 'active-no-deadline',
        type: 'skill',
        movementName: 'Pull-ups',
        targetValue: 20,
        unit: 'reps',
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'active-soon',
        type: 'weight',
        movementName: 'Back Squat',
        targetValue: 315,
        unit: 'lbs',
        createdAt: '2025-01-01T00:00:00Z',
        deadline: '2025-07-01',
      },
      {
        id: 'active-later',
        type: 'weight',
        movementName: 'Bench Press',
        targetValue: 225,
        unit: 'lbs',
        createdAt: '2025-01-01T00:00:00Z',
        deadline: '2025-12-31',
      },
      {
        id: 'completed-2',
        type: 'time',
        movementName: 'Fran',
        targetValue: 180,
        unit: 'seconds',
        createdAt: '2025-01-01T00:00:00Z',
        completedAt: '2025-04-01T00:00:00Z',
      },
    ]

    const sorted = sortGoals(goals)

    // Active goals first, sorted by deadline (soonest first, null last)
    expect(sorted[0].id).toBe('active-soon')
    expect(sorted[1].id).toBe('active-later')
    expect(sorted[2].id).toBe('active-no-deadline')

    // Completed goals last, sorted by completedAt descending (most recent first)
    expect(sorted[3].id).toBe('completed-2')
    expect(sorted[4].id).toBe('completed-1')
  })

  test('returns empty array for empty input', () => {
    expect(sortGoals([])).toEqual([])
  })

  test('does not mutate original array', () => {
    const goals: Goal[] = [
      {
        id: 'a',
        type: 'weight',
        movementName: 'Squat',
        targetValue: 300,
        unit: 'lbs',
        createdAt: '2025-01-01T00:00:00Z',
        completedAt: '2025-02-01T00:00:00Z',
      },
      {
        id: 'b',
        type: 'weight',
        movementName: 'Deadlift',
        targetValue: 400,
        unit: 'lbs',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ]
    const original = [...goals]
    sortGoals(goals)
    expect(goals).toEqual(original)
  })
})
