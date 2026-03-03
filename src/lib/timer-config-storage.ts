import { STORAGE_KEYS } from './constants'

export interface SavedTimerConfig {
  mode: string
  minutes?: number
  intervalMinutes?: number
  rounds?: number
  workSeconds?: number
  restSeconds?: number
}

export function saveTimerConfig(config: SavedTimerConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_TIMER_CONFIG, JSON.stringify(config))
  } catch {
    /* ignore quota errors */
  }
}

export function loadTimerConfig(): SavedTimerConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_TIMER_CONFIG)
    if (!raw) return null
    return JSON.parse(raw) as SavedTimerConfig
  } catch {
    return null
  }
}
