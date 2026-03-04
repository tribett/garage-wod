import { describe, test, expect, vi, afterEach } from 'vitest'
import {
  buildCalendarData,
  getMonthLabels,
  getConsistencyScore,
} from '../training-calendar'

// ── buildCalendarData ───────────────────────────────────────────

describe('buildCalendarData', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('empty logs → all days have count 0, intensity 0', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const result = buildCalendarData([])
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((d) => d.count === 0)).toBe(true)
    expect(result.every((d) => d.intensity === 0)).toBe(true)
  })

  test('one workout → single day with count 1, intensity 1', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const logs = [{ completedAt: '2025-03-10T08:00:00Z' }]
    const result = buildCalendarData(logs)

    const march10 = result.find((d) => d.date === '2025-03-10')
    expect(march10).toBeDefined()
    expect(march10!.count).toBe(1)
    expect(march10!.intensity).toBe(1)
  })

  test('multiple workouts same day → count 2+, intensity 2', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const logs = [
      { completedAt: '2025-03-10T08:00:00Z' },
      { completedAt: '2025-03-10T18:00:00Z' },
    ]
    const result = buildCalendarData(logs)

    const march10 = result.find((d) => d.date === '2025-03-10')
    expect(march10).toBeDefined()
    expect(march10!.count).toBe(2)
    expect(march10!.intensity).toBe(2)
  })

  test('3+ workouts same day → intensity 3', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const logs = [
      { completedAt: '2025-03-10T06:00:00Z' },
      { completedAt: '2025-03-10T12:00:00Z' },
      { completedAt: '2025-03-10T18:00:00Z' },
    ]
    const result = buildCalendarData(logs)

    const march10 = result.find((d) => d.date === '2025-03-10')
    expect(march10).toBeDefined()
    expect(march10!.count).toBe(3)
    expect(march10!.intensity).toBe(3)
  })

  test('returns correct number of days (weeks * 7 + 1 for today)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const result12 = buildCalendarData([], 12)
    expect(result12.length).toBe(12 * 7 + 1)

    const result4 = buildCalendarData([], 4)
    expect(result4.length).toBe(4 * 7 + 1)
  })

  test('default weeks is 12', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const result = buildCalendarData([])
    expect(result.length).toBe(12 * 7 + 1)
  })

  test('days outside range are ignored', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    // This log is way before the 12-week window
    const logs = [{ completedAt: '2024-01-01T08:00:00Z' }]
    const result = buildCalendarData(logs)

    expect(result.every((d) => d.count === 0)).toBe(true)
  })
})

// ── getMonthLabels ──────────────────────────────────────────────

describe('getMonthLabels', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns correct labels at month boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const days = buildCalendarData([])
    const labels = getMonthLabels(days)

    // Should have at least 2 labels (going back 12 weeks from Mar 15)
    expect(labels.length).toBeGreaterThanOrEqual(2)

    // Each label should have a month abbreviation and a weekIndex
    labels.forEach((l) => {
      expect(l.label).toBeTruthy()
      expect(typeof l.weekIndex).toBe('number')
      expect(l.weekIndex).toBeGreaterThanOrEqual(0)
    })
  })

  test('labels include month abbreviations', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const days = buildCalendarData([])
    const labels = getMonthLabels(days)
    const labelTexts = labels.map((l) => l.label)

    // 12 weeks back from Mar 15 covers Dec, Jan, Feb, Mar
    expect(labelTexts).toContain('Mar')
  })
})

// ── getConsistencyScore ─────────────────────────────────────────

describe('getConsistencyScore', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('empty days → percentage 0', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const days = buildCalendarData([])
    const score = getConsistencyScore(days)

    expect(score.activeDays).toBe(0)
    expect(score.percentage).toBe(0)
  })

  test('some days active → correct percentage', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    // Create logs for 7 of the last 28 days
    const logs = []
    for (let i = 0; i < 7; i++) {
      const d = new Date('2025-03-15T12:00:00Z')
      d.setDate(d.getDate() - i * 3) // every 3 days
      logs.push({ completedAt: d.toISOString() })
    }

    const days = buildCalendarData(logs)
    const score = getConsistencyScore(days)

    expect(score.activeDays).toBe(7)
    expect(score.totalDays).toBe(28)
    expect(score.percentage).toBe(25)
  })

  test('respects weeksToCheck parameter', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    // Log a workout today only
    const logs = [{ completedAt: '2025-03-15T08:00:00Z' }]
    const days = buildCalendarData(logs)

    const score4 = getConsistencyScore(days, 4)
    expect(score4.totalDays).toBe(28)
    expect(score4.activeDays).toBe(1)

    const score2 = getConsistencyScore(days, 2)
    expect(score2.totalDays).toBe(14)
    expect(score2.activeDays).toBe(1)
  })

  test('default weeksToCheck is 4', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'))

    const days = buildCalendarData([])
    const score = getConsistencyScore(days)

    expect(score.totalDays).toBe(28)
  })
})
