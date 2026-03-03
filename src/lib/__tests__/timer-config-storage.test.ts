import { describe, test, expect, vi, beforeEach } from 'vitest'
import { saveTimerConfig, loadTimerConfig } from '../timer-config-storage'
import { STORAGE_KEYS } from '../constants'

// Use an in-memory store to back localStorage (matches project pattern)
let store: Record<string, string> = {}

beforeEach(() => {
  store = {}
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  })
})

describe('saveTimerConfig', () => {
  test('writes correct JSON string to localStorage', () => {
    const config = { mode: 'amrap', minutes: 12 }
    saveTimerConfig(config)
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_TIMER_CONFIG)
    expect(stored).toBe(JSON.stringify(config))
  })

  test('saves config with all optional fields', () => {
    const config = {
      mode: 'tabata',
      minutes: 10,
      intervalMinutes: 1,
      rounds: 8,
      workSeconds: 20,
      restSeconds: 10,
    }
    saveTimerConfig(config)
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_TIMER_CONFIG)
    expect(JSON.parse(stored!)).toEqual(config)
  })

  test('overwrites previous config', () => {
    saveTimerConfig({ mode: 'amrap', minutes: 10 })
    saveTimerConfig({ mode: 'forTime', minutes: 20 })
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_TIMER_CONFIG)!)
    expect(stored.mode).toBe('forTime')
    expect(stored.minutes).toBe(20)
  })

  test('handles localStorage errors gracefully', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceededError') },
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    })
    expect(() => saveTimerConfig({ mode: 'amrap' })).not.toThrow()
  })
})

describe('loadTimerConfig', () => {
  test('returns parsed object from localStorage', () => {
    const config = { mode: 'emom', intervalMinutes: 2, rounds: 10 }
    localStorage.setItem(STORAGE_KEYS.LAST_TIMER_CONFIG, JSON.stringify(config))
    expect(loadTimerConfig()).toEqual(config)
  })

  test('returns null when no data is stored', () => {
    expect(loadTimerConfig()).toBeNull()
  })

  test('returns null for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.LAST_TIMER_CONFIG, '{bad json')
    expect(loadTimerConfig()).toBeNull()
  })

  test('returns null when localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    })
    expect(loadTimerConfig()).toBeNull()
  })
})
