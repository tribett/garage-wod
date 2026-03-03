import { describe, test, expect } from 'vitest'
import { buildResultCard } from '../result-card'
import type { ResultCardData } from '../result-card'

describe('buildResultCard', () => {
  test('returns card data with title, date, and score', () => {
    const card: ResultCardData = buildResultCard({
      title: 'Fran',
      date: '2025-06-15T10:00:00Z',
      score: '2:53',
    })
    expect(card.title).toBe('Fran')
    expect(card.score).toBe('2:53')
    expect(card.date).toContain('Jun')
    expect(card.date).toContain('15')
  })

  test('includes scaling when provided', () => {
    const card = buildResultCard({
      title: 'Fran',
      date: '2025-06-15T10:00:00Z',
      score: '4:10',
      scaling: 'Scaled',
    })
    expect(card.scaling).toBe('Scaled')
  })

  test('defaults scaling to undefined if not provided', () => {
    const card = buildResultCard({
      title: 'Murph',
      date: '2025-06-15T10:00:00Z',
      score: '42:30',
    })
    expect(card.scaling).toBeUndefined()
  })

  test('includes movements when provided', () => {
    const card = buildResultCard({
      title: 'Custom WOD',
      date: '2025-06-15T10:00:00Z',
      score: '5+3',
      movements: ['21-15-9', 'Thrusters 95#', 'Pull-ups'],
    })
    expect(card.movements).toHaveLength(3)
    expect(card.movements![0]).toBe('21-15-9')
  })

  test('includes PR flag when set', () => {
    const card = buildResultCard({
      title: 'Fran',
      date: '2025-06-15T10:00:00Z',
      score: '2:53',
      isPR: true,
    })
    expect(card.isPR).toBe(true)
  })

  test('app branding is always present', () => {
    const card = buildResultCard({
      title: 'Test',
      date: '2025-06-15T10:00:00Z',
      score: '10:00',
    })
    expect(card.appName).toBe('GRGWOD')
  })

  test('formats long date nicely', () => {
    const card = buildResultCard({
      title: 'Test',
      date: '2025-12-25T10:00:00Z',
      score: '5:00',
    })
    expect(card.date).toContain('Dec')
    expect(card.date).toContain('25')
    expect(card.date).toContain('2025')
  })
})
