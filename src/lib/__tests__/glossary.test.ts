import { describe, test, expect } from 'vitest'
import { getDefinition, getAllTerms } from '../glossary'

describe('getDefinition', () => {
  test('returns definition for exact match', () => {
    const def = getDefinition('AMRAP')
    expect(def).toBeTruthy()
    expect(typeof def).toBe('string')
  })

  test('is case-insensitive', () => {
    const def1 = getDefinition('AMRAP')
    const def2 = getDefinition('amrap')
    expect(def1).toBe(def2)
  })

  test('returns null for unknown term', () => {
    expect(getDefinition('XYZABC')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getDefinition('')).toBeNull()
  })
})

describe('getAllTerms', () => {
  test('returns non-empty array', () => {
    const terms = getAllTerms()
    expect(terms.length).toBeGreaterThan(0)
  })

  test('terms are sorted alphabetically', () => {
    const terms = getAllTerms()
    for (let i = 1; i < terms.length; i++) {
      expect(
        terms[i - 1].term.localeCompare(terms[i].term) <= 0,
        `${terms[i - 1].term} should come before ${terms[i].term}`,
      ).toBe(true)
    }
  })
})
