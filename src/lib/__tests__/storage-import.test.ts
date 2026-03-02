import { describe, test, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '../constants'
import { storage } from '../storage'

// Use a simple in-memory store to back localStorage in tests
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

describe('storage.importAll', () => {
  test('restores exported data back into localStorage', () => {
    // Populate some data
    storage.save(STORAGE_KEYS.SETTINGS, { theme: 'dark', weightUnit: 'kg' })
    storage.save(STORAGE_KEYS.WORKOUT_LOGS, [{ id: 'log-1', completed: true }])

    // Export
    const exported = storage.exportAll()

    // Wipe everything
    storage.clear()
    expect(storage.load(STORAGE_KEYS.SETTINGS, null)).toBeNull()

    // Import
    const result = storage.importAll(exported)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()

    // Verify data is restored
    const restored = storage.load<{ theme: string }>(STORAGE_KEYS.SETTINGS, { theme: 'light' })
    expect(restored.theme).toBe('dark')

    const logs = storage.load<unknown[]>(STORAGE_KEYS.WORKOUT_LOGS, [])
    expect(logs).toHaveLength(1)
  })

  test('returns error for invalid JSON', () => {
    const result = storage.importAll('this is not json{{{')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('returns error for non-object data', () => {
    const result = storage.importAll('"just a string"')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('only imports known storage keys, ignoring unknown ones', () => {
    const data = JSON.stringify({
      SETTINGS: { theme: 'dark' },
      UNKNOWN_KEY: { evil: true },
    })

    const result = storage.importAll(data)
    expect(result.success).toBe(true)

    // Settings should be restored
    const settings = storage.load<{ theme: string }>(STORAGE_KEYS.SETTINGS, { theme: 'light' })
    expect(settings.theme).toBe('dark')

    // Unknown key should NOT be in localStorage
    expect(store['UNKNOWN_KEY']).toBeUndefined()
    expect(store['gw_UNKNOWN_KEY']).toBeUndefined()
  })
})
