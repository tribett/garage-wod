import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from './constants'

interface StorageMeta {
  schemaVersion: number
  createdAt: string
  lastUpdatedAt: string
}

export const storage = {
  load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      const meta = storage.load<StorageMeta>(STORAGE_KEYS.META, {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      })
      meta.lastUpdatedAt = new Date().toISOString()
      localStorage.setItem(STORAGE_KEYS.META, JSON.stringify(meta))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },

  exportAll(): string {
    const data: Record<string, unknown> = {}
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        data[name] = JSON.parse(raw)
      }
    })
    return JSON.stringify(data, null, 2)
  },

  getUsageBytes(): number {
    let total = 0
    Object.values(STORAGE_KEYS).forEach((key) => {
      const raw = localStorage.getItem(key)
      if (raw) total += raw.length * 2 // UTF-16
    })
    return total
  },

  migrate(): void {
    const meta = storage.load<StorageMeta>(STORAGE_KEYS.META, {
      schemaVersion: 0,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    })

    if (meta.schemaVersion === 0) {
      // First time — initialize
      storage.save(STORAGE_KEYS.META, {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      })
      return
    }

    // Future migrations go here:
    // if (meta.schemaVersion < 2) { migrateV1ToV2(); }
  },
}
