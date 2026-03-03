import { describe, test, expect } from 'vitest'
import { GLOSSARY } from '../glossary'
import type { GlossaryEntry } from '../glossary'

describe('GLOSSARY', () => {
  test('is a non-empty array', () => {
    expect(GLOSSARY.length).toBeGreaterThan(0)
  })

  test('contains at least 20 terms', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(20)
  })

  test('each entry has term and definition', () => {
    for (const entry of GLOSSARY) {
      expect(entry.term).toBeTruthy()
      expect(entry.definition).toBeTruthy()
      expect(typeof entry.term).toBe('string')
      expect(typeof entry.definition).toBe('string')
    }
  })

  test('contains essential CrossFit terms', () => {
    const required = ['AMRAP', 'EMOM', 'Rx', 'WOD', 'PR', 'For Time', 'Rep', 'Set']
    const terms = GLOSSARY.map((e: GlossaryEntry) => e.term.toLowerCase())
    for (const term of required) {
      expect(terms, `should contain "${term}"`).toContain(term.toLowerCase())
    }
  })

  test('has no duplicate terms (case-insensitive)', () => {
    const seen = new Set<string>()
    for (const entry of GLOSSARY) {
      const lower = entry.term.toLowerCase()
      expect(seen.has(lower), `duplicate term: ${entry.term}`).toBe(false)
      seen.add(lower)
    }
  })
})
