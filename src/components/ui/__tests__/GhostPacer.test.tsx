import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GhostPacer } from '../GhostPacer'

interface PacerState {
  isActive: boolean
  paceStatus: 'ahead' | 'behind' | 'tied'
  deltaFormatted: string
  progressPct: number
}

function makeState(overrides: Partial<PacerState> = {}): PacerState {
  return {
    isActive: true,
    paceStatus: 'ahead',
    deltaFormatted: '+0:23',
    progressPct: 45,
    ...overrides,
  }
}

describe('GhostPacer', () => {
  it('renders "ahead" indicator with green text when paceStatus is ahead', () => {
    render(<GhostPacer state={makeState({ paceStatus: 'ahead' })} />)
    const delta = screen.getByTestId('ghost-delta')
    expect(delta.className).toContain('text-emerald')
  })

  it('renders "behind" indicator with red text when paceStatus is behind', () => {
    render(
      <GhostPacer
        state={makeState({ paceStatus: 'behind', deltaFormatted: '-0:05' })}
      />,
    )
    const delta = screen.getByTestId('ghost-delta')
    expect(delta.className).toContain('text-red')
  })

  it('shows formatted time delta text', () => {
    render(<GhostPacer state={makeState({ deltaFormatted: '+1:15' })} />)
    expect(screen.getByText('+1:15')).toBeDefined()
  })

  it('shows progress bar with width style based on progressPct', () => {
    render(<GhostPacer state={makeState({ progressPct: 72 })} />)
    const bar = screen.getByTestId('ghost-progress-bar')
    expect(bar.style.width).toBe('72%')
  })

  it('shows "No previous attempt" when state is null', () => {
    render(<GhostPacer state={null} />)
    expect(screen.getByText('No previous attempt')).toBeDefined()
  })
})
