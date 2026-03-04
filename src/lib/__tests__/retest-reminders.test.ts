import { describe, test, expect, vi, afterEach } from 'vitest'
import { getRetestSuggestions } from '../retest-reminders'

// Helper to create a date string N days ago
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

describe('getRetestSuggestions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns empty array when no named WODs exist', () => {
    const logs = [
      { completedAt: daysAgo(90) },
      { title: '', completedAt: daysAgo(90) },
    ]
    expect(getRetestSuggestions(logs)).toEqual([])
  })

  test('returns empty when WOD done yesterday (under threshold)', () => {
    const logs = [
      { title: 'Fran', wodResult: { score: '3:45' }, completedAt: daysAgo(1) },
    ]
    expect(getRetestSuggestions(logs)).toEqual([])
  })

  test('returns suggestion for WOD done 90 days ago with correct daysSince', () => {
    const logs = [
      { title: 'Fran', wodResult: { score: '3:45', scaling: 'Rx' }, completedAt: daysAgo(90) },
    ]
    const result = getRetestSuggestions(logs)
    expect(result).toHaveLength(1)
    expect(result[0].wodName).toBe('Fran')
    expect(result[0].lastScore).toBe('3:45')
    expect(result[0].lastScaling).toBe('Rx')
    expect(result[0].daysSince).toBe(90)
  })

  test('includes WOD done exactly at threshold (60 days)', () => {
    const logs = [
      { title: 'Murph', wodResult: { score: '45:00' }, completedAt: daysAgo(60) },
    ]
    const result = getRetestSuggestions(logs, 60)
    expect(result).toHaveLength(1)
    expect(result[0].wodName).toBe('Murph')
    expect(result[0].daysSince).toBe(60)
  })

  test('uses most recent log when multiple WODs share the same name', () => {
    const logs = [
      { title: 'Fran', wodResult: { score: '5:00' }, completedAt: daysAgo(120) },
      { title: 'Fran', wodResult: { score: '3:45' }, completedAt: daysAgo(70) },
    ]
    const result = getRetestSuggestions(logs)
    expect(result).toHaveLength(1)
    expect(result[0].lastScore).toBe('3:45')
    expect(result[0].daysSince).toBe(70)
  })

  test('respects the limit parameter', () => {
    const logs = [
      { title: 'Fran', completedAt: daysAgo(90) },
      { title: 'Murph', completedAt: daysAgo(100) },
      { title: 'Grace', completedAt: daysAgo(80) },
      { title: 'Diane', completedAt: daysAgo(110) },
    ]
    const result = getRetestSuggestions(logs, 60, 3)
    expect(result).toHaveLength(3)
  })

  test('sorts by daysSince descending (longest ago first)', () => {
    const logs = [
      { title: 'Fran', completedAt: daysAgo(70) },
      { title: 'Murph', completedAt: daysAgo(100) },
      { title: 'Grace', completedAt: daysAgo(85) },
    ]
    const result = getRetestSuggestions(logs)
    expect(result[0].wodName).toBe('Murph')
    expect(result[1].wodName).toBe('Grace')
    expect(result[2].wodName).toBe('Fran')
  })

  test('skips logs without a title', () => {
    const logs = [
      { completedAt: daysAgo(90) },
      { title: '', completedAt: daysAgo(90) },
      { title: '  ', completedAt: daysAgo(90) },
      { title: 'Fran', wodResult: { score: '3:45' }, completedAt: daysAgo(90) },
    ]
    const result = getRetestSuggestions(logs)
    expect(result).toHaveLength(1)
    expect(result[0].wodName).toBe('Fran')
  })

  test('extracts score and scaling correctly', () => {
    const logs = [
      {
        title: 'Helen',
        wodResult: { score: '11:30', scaling: 'Scaled' },
        completedAt: daysAgo(65),
      },
    ]
    const result = getRetestSuggestions(logs)
    expect(result).toHaveLength(1)
    expect(result[0].lastScore).toBe('11:30')
    expect(result[0].lastScaling).toBe('Scaled')
  })

  test('defaults score to empty string when wodResult has no score', () => {
    const logs = [
      { title: 'Custom WOD', wodResult: {}, completedAt: daysAgo(90) },
    ]
    const result = getRetestSuggestions(logs)
    expect(result).toHaveLength(1)
    expect(result[0].lastScore).toBe('')
  })

  test('defaults score to empty string when wodResult is undefined', () => {
    const logs = [
      { title: 'Custom WOD', completedAt: daysAgo(90) },
    ]
    const result = getRetestSuggestions(logs)
    expect(result).toHaveLength(1)
    expect(result[0].lastScore).toBe('')
  })
})
