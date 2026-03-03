import { describe, test, expect } from 'vitest'
import { exportProgramJSON } from '../program-export'
import type { Program } from '@/types/program'

const MINIMAL_PROGRAM: Program = {
  id: 'test-1',
  name: 'Test Program',
  author: 'Tester',
  description: 'A test',
  version: '1.0',
  phases: [
    {
      name: 'Phase 1',
      description: 'First phase',
      weekStart: 1,
      weekEnd: 2,
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              dayNumber: 1,
              name: 'Day A',
              blocks: [],
            },
          ],
        },
        {
          weekNumber: 2,
          days: [
            {
              dayNumber: 1,
              name: 'Day A',
              blocks: [],
            },
          ],
        },
      ],
    },
  ],
}

describe('exportProgramJSON', () => {
  test('returns valid JSON string', () => {
    const json = exportProgramJSON(MINIMAL_PROGRAM)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  test('exported JSON contains program data', () => {
    const json = exportProgramJSON(MINIMAL_PROGRAM)
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('Test Program')
    expect(parsed.description).toBe('A test')
    expect(parsed.phases).toHaveLength(1)
  })

  test('exported JSON is pretty-printed', () => {
    const json = exportProgramJSON(MINIMAL_PROGRAM)
    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })

  test('returns empty string for null input', () => {
    expect(exportProgramJSON(null as unknown as Program)).toBe('')
  })
})
