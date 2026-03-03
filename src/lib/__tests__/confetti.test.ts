import { describe, test, expect } from 'vitest'
import { generateConfettiParticles } from '../confetti'

describe('generateConfettiParticles', () => {
  test('generates the requested number of particles', () => {
    const particles = generateConfettiParticles(20)
    expect(particles).toHaveLength(20)
  })

  test('each particle has required properties', () => {
    const particles = generateConfettiParticles(5)
    for (const p of particles) {
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('x')
      expect(p).toHaveProperty('y')
      expect(p).toHaveProperty('color')
      expect(p).toHaveProperty('rotation')
      expect(p).toHaveProperty('scale')
      expect(p).toHaveProperty('delay')
    }
  })

  test('x values are between 0 and 100 (percentage)', () => {
    const particles = generateConfettiParticles(50)
    for (const p of particles) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(100)
    }
  })

  test('colors come from a predefined palette', () => {
    const particles = generateConfettiParticles(100)
    const validColors = ['#f97316', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#e11d48', '#a78bfa']
    for (const p of particles) {
      expect(validColors).toContain(p.color)
    }
  })

  test('defaults to 30 particles when no count given', () => {
    const particles = generateConfettiParticles()
    expect(particles).toHaveLength(30)
  })
})
