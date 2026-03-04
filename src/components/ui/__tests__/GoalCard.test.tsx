import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GoalCard } from '../GoalCard'
import type { Goal } from '@/lib/goals'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    type: 'weight',
    movementName: 'Back Squat',
    targetValue: 300,
    currentValue: 225,
    unit: 'lbs',
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('GoalCard', () => {
  it('renders movement name', () => {
    const goal = makeGoal({ movementName: 'Deadlift' })
    render(<GoalCard goal={goal} onDelete={vi.fn()} />)
    expect(screen.getByText('Deadlift')).toBeDefined()
  })

  it('shows progress percentage', () => {
    const goal = makeGoal({ currentValue: 225, targetValue: 300 })
    render(<GoalCard goal={goal} onDelete={vi.fn()} />)
    // 225/300 = 75%
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('shows "Complete" badge when goal is complete', () => {
    const goal = makeGoal({
      currentValue: 300,
      targetValue: 300,
      completedAt: '2025-06-01T00:00:00Z',
    })
    render(<GoalCard goal={goal} onDelete={vi.fn()} />)
    expect(screen.getByText('Complete')).toBeDefined()
  })

  it('shows days remaining when deadline exists', () => {
    // Set deadline to 10 days from now
    const future = new Date()
    future.setDate(future.getDate() + 10)
    const deadlineStr = future.toISOString().slice(0, 10)

    const goal = makeGoal({ deadline: deadlineStr })
    render(<GoalCard goal={goal} onDelete={vi.fn()} />)
    expect(screen.getByText(/10d left/)).toBeDefined()
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    const goal = makeGoal({ id: 'goal-42' })
    render(<GoalCard goal={goal} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith('goal-42')
  })

  it('shows current/target values with unit', () => {
    const goal = makeGoal({ currentValue: 225, targetValue: 300, unit: 'lbs' })
    render(<GoalCard goal={goal} onDelete={vi.fn()} />)
    expect(screen.getByText(/225/)).toBeDefined()
    expect(screen.getByText(/300 lbs/)).toBeDefined()
  })

  it('shows goal type badge', () => {
    const goal = makeGoal({ type: 'weight' })
    render(<GoalCard goal={goal} onDelete={vi.fn()} />)
    expect(screen.getByText(/weight/i)).toBeDefined()
  })
})
