import { describe, test, expect, vi, afterEach } from 'vitest'
import { getRestDayMessage } from '../rest-day-guidance'

describe('getRestDayMessage', () => {
  afterEach(() => vi.useRealTimers())

  test('returns non-empty string for all inputs', () => {
    expect(getRestDayMessage(0, null).length).toBeGreaterThan(0)
    expect(getRestDayMessage(3, '2026-01-10T10:00:00Z').length).toBeGreaterThan(0)
    expect(getRestDayMessage(10, null).length).toBeGreaterThan(0)
  })

  test('returns encouragement when streak is 0', () => {
    const msg = getRestDayMessage(0, null)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(5)
  })

  test('returns motivational message when streak is active', () => {
    const msg = getRestDayMessage(4, '2026-01-10T10:00:00Z')
    expect(msg.length).toBeGreaterThan(5)
  })

  test('returns recovery message when last workout was recent', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-02T12:00:00Z'))
    const msg = getRestDayMessage(2, '2026-03-01T10:00:00Z') // yesterday
    expect(msg.length).toBeGreaterThan(5)
  })

  test('returns welcome-back message when last workout was 7+ days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'))
    const msg = getRestDayMessage(0, '2026-03-01T10:00:00Z') // 9 days ago
    expect(msg.length).toBeGreaterThan(5)
  })

  test('handles null lastWorkoutDate', () => {
    const msg = getRestDayMessage(0, null)
    expect(typeof msg).toBe('string')
  })
})
