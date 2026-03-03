import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon="🏋️"
        title="Your story starts here"
        description="Log some workouts to see your progress."
      />,
    )
    expect(screen.getByText('🏋️')).toBeDefined()
    expect(screen.getByText('Your story starts here')).toBeDefined()
    expect(screen.getByText('Log some workouts to see your progress.')).toBeDefined()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon="💪"
        title="Ready to start?"
        description="Load a program to begin."
        action={{ label: 'Get Started', onClick }}
      />,
    )
    const button = screen.getByText('Get Started')
    expect(button).toBeDefined()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(
      <EmptyState
        icon="📊"
        title="No data"
        description="Nothing here yet."
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})
