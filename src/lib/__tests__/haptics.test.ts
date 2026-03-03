import { describe, test, expect, vi, beforeEach } from 'vitest'
import { triggerHaptic } from '../haptics'

describe('triggerHaptic', () => {
  beforeEach(() => {
    // Reset navigator.vibrate mock
    vi.stubGlobal('navigator', {
      ...navigator,
      vibrate: vi.fn(() => true),
    })
  })

  test('calls navigator.vibrate for "tap" pattern', () => {
    triggerHaptic('tap')
    expect(navigator.vibrate).toHaveBeenCalledWith(10)
  })

  test('calls navigator.vibrate for "success" pattern', () => {
    triggerHaptic('success')
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 50, 10])
  })

  test('calls navigator.vibrate for "warning" pattern', () => {
    triggerHaptic('warning')
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 50, 30])
  })

  test('calls navigator.vibrate for "celebration" pattern', () => {
    triggerHaptic('celebration')
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10, 30, 50])
  })

  test('does not throw if vibrate is not supported', () => {
    vi.stubGlobal('navigator', { ...navigator, vibrate: undefined })
    expect(() => triggerHaptic('tap')).not.toThrow()
  })

  test('does not throw if navigator is missing', () => {
    vi.stubGlobal('navigator', {})
    expect(() => triggerHaptic('tap')).not.toThrow()
  })
})
