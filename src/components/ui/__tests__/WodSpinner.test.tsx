import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WodSpinner } from '../WodSpinner'
import type { GeneratedWod } from '@/lib/wod-generator'

function makeMockWod(overrides: Partial<GeneratedWod> = {}): GeneratedWod {
  return {
    name: 'Garage Grinder #42',
    type: 'amrap',
    duration: 12,
    movements: [
      { name: 'Air Squat', reps: 15, category: 'squat' },
      { name: 'Push-up', reps: 12, category: 'push' },
      { name: 'Kettlebell Swing', reps: 10, category: 'hinge' },
    ],
    targetCategories: ['squat', 'hinge'],
    reasoning: 'Targeting gaps in squat, hinge.',
    ...overrides,
  }
}

describe('WodSpinner', () => {
  it('renders spin button with "Spin" text', () => {
    const onGenerate = vi.fn(() => makeMockWod())
    render(<WodSpinner onGenerate={onGenerate} />)
    expect(screen.getByRole('button', { name: /spin/i })).toBeDefined()
  })

  it('shows generated WOD name after button click', () => {
    const onGenerate = vi.fn(() => makeMockWod({ name: 'Garage Grinder #99' }))
    render(<WodSpinner onGenerate={onGenerate} />)
    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    expect(screen.getByText('Garage Grinder #99')).toBeDefined()
  })

  it('shows movement list with reps after spin', () => {
    const onGenerate = vi.fn(() =>
      makeMockWod({
        movements: [
          { name: 'Air Squat', reps: 15, category: 'squat' },
          { name: 'Push-up', reps: 12, category: 'push' },
        ],
      }),
    )
    render(<WodSpinner onGenerate={onGenerate} />)
    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    expect(screen.getByText(/15.+Air Squat/)).toBeDefined()
    expect(screen.getByText(/12.+Push-up/)).toBeDefined()
  })

  it('shows reasoning text in italic', () => {
    const onGenerate = vi.fn(() =>
      makeMockWod({ reasoning: 'Targeting gaps in squat, hinge.' }),
    )
    render(<WodSpinner onGenerate={onGenerate} />)
    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    const reasoning = screen.getByText('Targeting gaps in squat, hinge.')
    expect(reasoning.tagName).toBe('EM')
  })

  it('shows WOD type badge', () => {
    const onGenerate = vi.fn(() => makeMockWod({ type: 'emom' }))
    render(<WodSpinner onGenerate={onGenerate} />)
    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    expect(screen.getByText(/emom/i)).toBeDefined()
  })

  it('shows Start Timer button after spin when onStartTimer is provided', () => {
    const onGenerate = vi.fn(() => makeMockWod())
    const onStartTimer = vi.fn()
    render(<WodSpinner onGenerate={onGenerate} onStartTimer={onStartTimer} />)

    // No start button before spinning
    expect(screen.queryByRole('button', { name: /start timer/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    expect(screen.getByRole('button', { name: /start timer/i })).toBeDefined()
  })

  it('does not show Start Timer button when onStartTimer is not provided', () => {
    const onGenerate = vi.fn(() => makeMockWod())
    render(<WodSpinner onGenerate={onGenerate} />)
    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    expect(screen.queryByRole('button', { name: /start timer/i })).toBeNull()
  })

  it('calls onStartTimer with generated WOD when Start Timer clicked', () => {
    const mockWod = makeMockWod({ name: 'Garage Grinder #77' })
    const onGenerate = vi.fn(() => mockWod)
    const onStartTimer = vi.fn()
    render(<WodSpinner onGenerate={onGenerate} onStartTimer={onStartTimer} />)

    fireEvent.click(screen.getByRole('button', { name: /spin/i }))
    fireEvent.click(screen.getByRole('button', { name: /start timer/i }))

    expect(onStartTimer).toHaveBeenCalledWith(mockWod)
  })
})
