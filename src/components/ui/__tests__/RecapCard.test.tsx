import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecapCard } from '../RecapCard'

describe('RecapCard', () => {
  it('renders month name', () => {
    render(
      <RecapCard
        month="February 2026"
        totalWorkouts={12}
        prsHit={3}
        topMovement="Back Squat"
      />
    )
    expect(screen.getByText('February 2026')).toBeDefined()
  })

  it('shows total workouts count', () => {
    render(
      <RecapCard
        month="January 2026"
        totalWorkouts={18}
        prsHit={5}
        topMovement="Deadlift"
      />
    )
    expect(screen.getByText('18')).toBeDefined()
  })

  it('shows PR count', () => {
    render(
      <RecapCard
        month="January 2026"
        totalWorkouts={10}
        prsHit={7}
        topMovement="Clean & Jerk"
      />
    )
    expect(screen.getByText('7')).toBeDefined()
  })

  it('shows comparison delta to previous month', () => {
    render(
      <RecapCard
        month="February 2026"
        totalWorkouts={15}
        prsHit={4}
        topMovement="Snatch"
        comparedToLastMonth={{ workoutDelta: 3 }}
      />
    )
    expect(screen.getByText('+3 vs last month')).toBeDefined()
  })

  it('shows top movement name', () => {
    render(
      <RecapCard
        month="March 2026"
        totalWorkouts={20}
        prsHit={6}
        topMovement="Front Squat"
      />
    )
    expect(screen.getByText('Front Squat')).toBeDefined()
  })
})
