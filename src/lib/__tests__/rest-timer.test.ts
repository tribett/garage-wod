import { describe, test, expect } from 'vitest'
import { formatRestTime, REST_PRESETS } from '../rest-timer'

describe('formatRestTime', () => {
  test('formats 0 seconds', () => {
    expect(formatRestTime(0)).toBe('0:00')
  })

  test('formats seconds under a minute', () => {
    expect(formatRestTime(30)).toBe('0:30')
  })

  test('formats exactly one minute', () => {
    expect(formatRestTime(60)).toBe('1:00')
  })

  test('formats minutes and seconds', () => {
    expect(formatRestTime(90)).toBe('1:30')
  })

  test('formats 3 minutes', () => {
    expect(formatRestTime(180)).toBe('3:00')
  })
})

describe('REST_PRESETS', () => {
  test('has standard rest intervals', () => {
    expect(REST_PRESETS.length).toBeGreaterThanOrEqual(3)
    expect(REST_PRESETS).toContainEqual(expect.objectContaining({ seconds: 60 }))
    expect(REST_PRESETS).toContainEqual(expect.objectContaining({ seconds: 90 }))
    expect(REST_PRESETS).toContainEqual(expect.objectContaining({ seconds: 120 }))
  })

  test('all presets have label and seconds', () => {
    for (const preset of REST_PRESETS) {
      expect(preset.label).toBeTruthy()
      expect(preset.seconds).toBeGreaterThan(0)
    }
  })
})
