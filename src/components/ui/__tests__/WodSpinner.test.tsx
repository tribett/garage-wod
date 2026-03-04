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
})
