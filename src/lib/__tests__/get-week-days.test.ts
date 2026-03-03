import { describe, it, expect } from 'vitest'
import { getWeekDays } from '../get-week-days'
import type { Program } from '@/types/program'

const mockProgram: Program = {
  id: 'test',
  name: 'Test',
  author: 'Test',
  description: 'Test',
  version: '1',
  phases: [{
    name: 'Phase 1',
    description: 'Test',
    weekStart: 1,
    weekEnd: 2,
    weeks: [
      {
        weekNumber: 1,
        days: [
          { dayNumber: 1, name: 'Back Squat', blocks: [] },
          { dayNumber: 2, name: 'Fran', blocks: [] },
          { dayNumber: 3, name: 'Deadlift', blocks: [] },
        ],
      },
      {
        weekNumber: 2,
        days: [
          { dayNumber: 1, name: 'Clean', blocks: [] },
        ],
      },
    ],
  }],
}

describe('getWeekDays', () => {
  it('returns days for existing week', () => {
    const result = getWeekDays(mockProgram, 1)
    expect(result).toHaveLength(3)
  })

  it('returns correct dayNumber and name', () => {
    const result = getWeekDays(mockProgram, 1)
    expect(result).toEqual([
      { dayNumber: 1, name: 'Back Squat' },
      { dayNumber: 2, name: 'Fran' },
      { dayNumber: 3, name: 'Deadlift' },
    ])
  })

  it('returns days for a different week', () => {
    const result = getWeekDays(mockProgram, 2)
    expect(result).toEqual([
      { dayNumber: 1, name: 'Clean' },
    ])
  })

  it('returns empty array for non-existent week', () => {
    const result = getWeekDays(mockProgram, 99)
    expect(result).toEqual([])
  })

  it('returns empty array for null program', () => {
    const result = getWeekDays(null, 1)
    expect(result).toEqual([])
  })
})
