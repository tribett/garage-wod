import { describe, test, expect, vi, afterEach } from 'vitest'
import {
  addEntry,
  getLatestWeight,
  getTrend,
  getToday,
} from '../bodyweight-log'
import type { BodyweightEntry } from '../bodyweight-log'

// ── addEntry ─────────────────────────────────────────────────

describe('addEntry', () => {
  test('inserts new entry, sorted', () => {
    const log: BodyweightEntry[] = [{ date: '2025-01-01', weight: 180 }]
    const result = addEntry(log, { date: '2025-01-03', weight: 178 })
    expect(result).toEqual([
      { date: '2025-01-01', weight: 180 },
      { date: '2025-01-03', weight: 178 },
    ])
  })

  test('upserts same date (replaces existing)', () => {
    const log: BodyweightEntry[] = [
      { date: '2025-01-01', weight: 180 },
      { date: '2025-01-02', weight: 179 },
    ]
    const result = addEntry(log, { date: '2025-01-01', weight: 175 })
    expect(result).toEqual([
      { date: '2025-01-01', weight: 175 },
      { date: '2025-01-02', weight: 179 },
    ])
  })

  test('maintains sort order across multiple entries', () => {
    let log: BodyweightEntry[] = []
    log = addEntry(log, { date: '2025-01-05', weight: 180 })
    log = addEntry(log, { date: '2025-01-01', weight: 182 })
    log = addEntry(log, { date: '2025-01-03', weight: 181 })
    expect(log).toEqual([
      { date: '2025-01-01', weight: 182 },
      { date: '2025-01-03', weight: 181 },
      { date: '2025-01-05', weight: 180 },
    ])
  })
})

// ── getLatestWeight ──────────────────────────────────────────

describe('getLatestWeight', () => {
  test('returns last entry weight', () => {
    const log: BodyweightEntry[] = [
      { date: '2025-01-01', weight: 180 },
      { date: '2025-01-05', weight: 178 },
    ]
    expect(getLatestWeight(log)).toBe(178)
  })

  test('returns null for empty log', () => {
    expect(getLatestWeight([])).toBeNull()
  })
})

// ── getTrend ─────────────────────────────────────────────────

describe('getTrend', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns entries within last N days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-30T12:00:00Z'))

    const log: BodyweightEntry[] = [
      { date: '2025-01-01', weight: 185 },
      { date: '2025-01-10', weight: 183 },
      { date: '2025-01-25', weight: 181 },
      { date: '2025-01-28', weight: 180 },
    ]
    const result = getTrend(log, 7)
    expect(result.entries).toEqual([
      { date: '2025-01-25', weight: 181 },
      { date: '2025-01-28', weight: 180 },
    ])
  })

  test('computes change from first to last entry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-30T12:00:00Z'))

    const log: BodyweightEntry[] = [
      { date: '2025-01-01', weight: 185 },
      { date: '2025-01-25', weight: 182 },
      { date: '2025-01-28', weight: 180 },
    ]
    const result = getTrend(log, 7)
    expect(result.change).toBe(-2) // 180 - 182
  })

  test('returns null change when < 2 entries in range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-30T12:00:00Z'))

    const log: BodyweightEntry[] = [
      { date: '2025-01-28', weight: 180 },
    ]
    const result = getTrend(log, 7)
    expect(result.change).toBeNull()
    expect(result.entries).toEqual([{ date: '2025-01-28', weight: 180 }])
  })
})

// ── getToday ─────────────────────────────────────────────────

describe('getToday', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns weight if today exists in log', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))

    const log: BodyweightEntry[] = [
      { date: '2025-01-14', weight: 180 },
      { date: '2025-01-15', weight: 179 },
    ]
    expect(getToday(log)).toBe(179)
  })

  test('returns null if today not in log', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))

    const log: BodyweightEntry[] = [
      { date: '2025-01-14', weight: 180 },
    ]
    expect(getToday(log)).toBeNull()
  })
})
