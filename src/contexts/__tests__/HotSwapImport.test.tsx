import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { WorkoutLogProvider, useWorkoutLogs, useWorkoutLogDispatch } from '../WorkoutLogContext'
import { SettingsProvider, useSettings, useReplaceSettings } from '../SettingsContext'
import type { WorkoutLog } from '@/types/workout-log'
import type { Settings } from '@/types/settings'

// In-memory localStorage stub
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

// Helper to test REPLACE_ALL
function LogReplacer() {
  const logs = useWorkoutLogs()
  const dispatch = useWorkoutLogDispatch()

  const replaceLogs = () => {
    const newLogs: WorkoutLog[] = [
      { id: 'new-1', programId: 'p1', weekNumber: 1, dayNumber: 1, completedAt: '2026-01-01', completed: true },
      { id: 'new-2', programId: 'p1', weekNumber: 1, dayNumber: 2, completedAt: '2026-01-02', completed: true },
    ]
    dispatch({ type: 'REPLACE_ALL', payload: newLogs })
  }

  return (
    <div>
      <span data-testid="log-count">{logs.length}</span>
      <button onClick={replaceLogs}>Replace</button>
    </div>
  )
}

// Helper to test replaceSettings
function SettingsReplacer() {
  const settings = useSettings()
  const replaceSettings = useReplaceSettings()

  const doReplace = () => {
    replaceSettings({
      theme: 'dark',
      soundEnabled: false,
      weightUnit: 'kg',
      keepScreenAwake: false,
      autoBackup: true,
    })
  }

  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="unit">{settings.weightUnit}</span>
      <button onClick={doReplace}>Replace Settings</button>
    </div>
  )
}

describe('WorkoutLogContext REPLACE_ALL', () => {
  test('replaces all logs with new array', () => {
    render(
      <WorkoutLogProvider>
        <LogReplacer />
      </WorkoutLogProvider>
    )

    // Initially empty (no localStorage data)
    expect(screen.getByTestId('log-count').textContent).toBe('0')

    act(() => {
      fireEvent.click(screen.getByText('Replace'))
    })

    expect(screen.getByTestId('log-count').textContent).toBe('2')
  })
})

describe('SettingsContext replaceSettings', () => {
  test('replaces all settings wholesale', () => {
    render(
      <SettingsProvider>
        <SettingsReplacer />
      </SettingsProvider>
    )

    // Default values
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('unit').textContent).toBe('lbs')

    act(() => {
      fireEvent.click(screen.getByText('Replace Settings'))
    })

    // After replace
    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('unit').textContent).toBe('kg')
  })
})
