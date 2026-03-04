import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlateCalculator } from '../PlateCalculator'

describe('PlateCalculator', () => {
  it('renders target weight input', () => {
    render(<PlateCalculator />)
    const input = screen.getByRole('spinbutton', { name: /target weight/i })
    expect(input).toBeDefined()
  })

  it('shows "Just the bar" text when weight is 45 (default bar weight)', () => {
    render(<PlateCalculator initialWeight={45} />)
    expect(screen.getByText('Just the bar')).toBeDefined()
  })

  it('shows colored plate visual elements for 225 lbs', () => {
    render(<PlateCalculator initialWeight={225} />)
    // 225 = 45 bar + 90 per side = 2x45 per side
    // PLATE_COLORS[45] = '#3b82f6' (blue)
    const plates = screen.getAllByTestId('plate')
    const hasBlue = plates.some((el) => {
      const bg = el.style.backgroundColor
      return bg === '#3b82f6' || bg === 'rgb(59, 130, 246)'
    })
    expect(hasBlue).toBe(true)
  })

  it('updates calculation on input change', () => {
    render(<PlateCalculator />)
    const input = screen.getByRole('spinbutton', { name: /target weight/i })
    fireEvent.change(input, { target: { value: '135' } })
    expect(screen.getByText('45 per side')).toBeDefined()
  })

  it('shows per-side breakdown text', () => {
    render(<PlateCalculator initialWeight={185} />)
    // 185 = 45 bar + 70 per side = 45 + 25 per side
    expect(screen.getByText('45 + 25 per side')).toBeDefined()
  })

  it('handles kg mode', () => {
    render(<PlateCalculator unit="kg" initialWeight={60} />)
    // 60 = 20 bar + 20 per side = 20 per side
    expect(screen.getByText('20 per side')).toBeDefined()
  })
})
