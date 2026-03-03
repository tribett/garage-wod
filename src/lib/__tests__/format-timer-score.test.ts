import { describe, test, expect } from 'vitest'
import { formatTimerScore } from '../format-timer-score'

describe('formatTimerScore', () => {
  describe('forTime mode', () => {
    test('formats standard elapsed time', () => {
      expect(formatTimerScore(522000, 'forTime')).toBe('8:42')
    })

    test('formats 0ms as 0:00', () => {
      expect(formatTimerScore(0, 'forTime')).toBe('0:00')
    })

    test('formats exact minutes', () => {
      expect(formatTimerScore(600000, 'forTime')).toBe('10:00')
    })

    test('pads seconds with leading zero', () => {
      expect(formatTimerScore(63000, 'forTime')).toBe('1:03')
    })

    test('handles large values (90 minutes)', () => {
      expect(formatTimerScore(5400000, 'forTime')).toBe('90:00')
    })

    test('handles just under a minute', () => {
      expect(formatTimerScore(59000, 'forTime')).toBe('0:59')
    })
  })

  describe('amrap mode', () => {
    test('formats same as forTime (MM:SS)', () => {
      expect(formatTimerScore(522000, 'amrap')).toBe('8:42')
    })

    test('formats 0ms', () => {
      expect(formatTimerScore(0, 'amrap')).toBe('0:00')
    })

    test('formats partial minutes', () => {
      expect(formatTimerScore(150000, 'amrap')).toBe('2:30')
    })
  })

  describe('emom mode', () => {
    test('returns "completed" regardless of elapsed', () => {
      expect(formatTimerScore(600000, 'emom')).toBe('completed')
    })

    test('returns "completed" for 0ms', () => {
      expect(formatTimerScore(0, 'emom')).toBe('completed')
    })
  })

  describe('tabata mode', () => {
    test('returns "completed" regardless of elapsed', () => {
      expect(formatTimerScore(240000, 'tabata')).toBe('completed')
    })

    test('returns "completed" for 0ms', () => {
      expect(formatTimerScore(0, 'tabata')).toBe('completed')
    })
  })

  describe('unknown mode', () => {
    test('falls back to MM:SS format', () => {
      expect(formatTimerScore(522000, 'rounds')).toBe('8:42')
    })

    test('handles empty string mode', () => {
      expect(formatTimerScore(300000, '')).toBe('5:00')
    })
  })
})
