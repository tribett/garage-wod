import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WhiteboardMode } from '../WhiteboardMode'

const movements = [
  { name: 'Thrusters', reps: '21', weight: '95 lbs' },
  { name: 'Pull-ups', reps: '21' },
]

describe('WhiteboardMode', () => {
  it('renders WOD name in large text', () => {
    render(
      <WhiteboardMode
        wodName="Fran"
        movements={movements}
        onClose={() => {}}
      />,
    )
    expect(screen.getByText('Fran')).toBeDefined()
  })

  it('renders all movements', () => {
    render(
      <WhiteboardMode
        wodName="Fran"
        movements={movements}
        onClose={() => {}}
      />,
    )
    expect(screen.getByText(/Thrusters/)).toBeDefined()
    expect(screen.getByText(/Pull-ups/)).toBeDefined()
  })

  it('shows weights for movements that have weight', () => {
    render(
      <WhiteboardMode
        wodName="Fran"
        movements={movements}
        onClose={() => {}}
      />,
    )
    expect(screen.getByText(/\(95 lbs\)/)).toBeDefined()
  })

  it('shows "Tap to close" hint text', () => {
    render(
      <WhiteboardMode
        wodName="Fran"
        movements={movements}
        onClose={() => {}}
      />,
    )
    expect(screen.getByText('Tap to close')).toBeDefined()
  })

  it('uses dark background', () => {
    render(
      <WhiteboardMode
        wodName="Fran"
        movements={movements}
        onClose={() => {}}
      />,
    )
    const overlay = screen.getByTestId('whiteboard-overlay')
    expect(overlay.className).toContain('bg-zinc-950')
  })

  it('fires onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    render(
      <WhiteboardMode
        wodName="Fran"
        movements={movements}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByTestId('whiteboard-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
