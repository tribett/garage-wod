import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Settings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SettingsContext = createContext<Settings | null>(null)
const UpdateSettingsContext = createContext<((partial: Partial<Settings>) => void) | null>(null)
const ReplaceSettingsContext = createContext<((settings: Settings) => void) | null>(null)

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext)
  if (ctx === null) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}

export function useUpdateSettings(): (partial: Partial<Settings>) => void {
  const ctx = useContext(UpdateSettingsContext)
  if (ctx === null) {
    throw new Error('useUpdateSettings must be used within a SettingsProvider')
  }
  return ctx
}

export function useReplaceSettings(): (settings: Settings) => void {
  const ctx = useContext(ReplaceSettingsContext)
  if (ctx === null) {
    throw new Error('useReplaceSettings must be used within a SettingsProvider')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------

const DARK_CLASS = 'dark'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function resolveEffectiveTheme(theme: Settings['theme']): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
  }
  return theme
}

function applyThemeClass(effective: 'light' | 'dark'): void {
  const root = document.documentElement
  if (effective === 'dark') {
    root.classList.add(DARK_CLASS)
  } else {
    root.classList.remove(DARK_CLASS)
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    storage.load<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  )

  // Persist whenever settings change
  useEffect(() => {
    storage.save(STORAGE_KEYS.SETTINGS, settings)
  }, [settings])

  // Apply theme class and listen for system preference changes
  useEffect(() => {
    applyThemeClass(resolveEffectiveTheme(settings.theme))

    if (settings.theme !== 'system') return

    const mql = window.matchMedia(MEDIA_QUERY)
    const handler = (e: MediaQueryListEvent) => {
      applyThemeClass(e.matches ? 'dark' : 'light')
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [settings.theme])

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  const replaceSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings)
  }, [])

  return (
    <SettingsContext value={settings}>
      <UpdateSettingsContext value={updateSettings}>
        <ReplaceSettingsContext value={replaceSettings}>
          {children}
        </ReplaceSettingsContext>
      </UpdateSettingsContext>
    </SettingsContext>
  )
}
