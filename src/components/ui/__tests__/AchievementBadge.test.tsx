import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AchievementBadge } from '../AchievementBadge'

describe('AchievementBadge', () => {
  it('renders achievement icon emoji and name text', () => {
    render(
      <AchievementBadge
        name="First WOD"
        icon="🎯"
        tier="bronze"
        description="Complete your first workout"
        unlockedAt="2026-01-15T00:00:00Z"
      />
    )
    expect(screen.getByText('🎯')).toBeDefined()
    expect(screen.getByText('First WOD')).toBeDefined()
  })

  it('shows tier-specific border color for gold tier', () => {
    const { container } = render(
      <AchievementBadge
        name="Gold Standard"
        icon="⭐"
        tier="gold"
        description="Achieve greatness"
        unlockedAt="2026-02-01T00:00:00Z"
      />
    )
    const badge = container.firstElementChild as HTMLElement
    expect(badge.style.borderColor).toBe('rgb(255, 215, 0)')
  })

  it('shows formatted unlock date when unlockedAt provided', () => {
    render(
      <AchievementBadge
        name="Streak Master"
        icon="🔥"
        tier="silver"
        description="7-day streak"
        unlockedAt="2026-02-14T12:00:00Z"
      />
    )
    expect(screen.getByText(/Feb 14, 2026/)).toBeDefined()
  })

  it('shows locked state when unlockedAt is undefined', () => {
    const { container } = render(
      <AchievementBadge
        name="Hidden Gem"
        icon="💎"
        tier="legendary"
        description="Secret achievement"
      />
    )
    expect(screen.getByText('🔒')).toBeDefined()
    const badge = container.firstElementChild as HTMLElement
    expect(badge.className).toContain('opacity-40')
  })

  it('shows description text', () => {
    render(
      <AchievementBadge
        name="PR Hunter"
        icon="🏆"
        tier="bronze"
        description="Set 10 personal records"
        unlockedAt="2026-03-01T00:00:00Z"
      />
    )
    expect(screen.getByText('Set 10 personal records')).toBeDefined()
  })
})
