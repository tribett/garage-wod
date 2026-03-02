import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ProgramProvider } from '@/contexts/ProgramContext'
import { WorkoutLogProvider } from '@/contexts/WorkoutLogContext'
import { HistoryPage } from '../HistoryPage'
import type { WorkoutLog } from '@/types/workout-log'
import type { Settings } from '@/types/settings'

const LOG_WITH_WEIGHTS: WorkoutLog = {
  id: 'test-log-1',
  programId: 'return-to-crossfit',
  weekNumber: 1,
  dayNumber: 1,
  completedAt: '2026-02-28T12:00:00.000Z',
  completed: true,
  exercises: [
    {
      movementId: 'back-squat',
      movementName: 'Back Squat',
      sets: [{ weight: 100, reps: 5, completed: true }],
    },
  ],
}

// Mock the storage module so we can control what contexts receive
vi.mock('@/lib/storage', () => ({
  storage: {
    load: (key: string, fallback: unknown) => {
      const store = (globalThis as Record<string, unknown>).__TEST_STORE__ as Record<string, unknown> | undefined
      return store?.[key] ?? fallback
    },
    save: () => {},
    remove: () => {},
    clear: () => {},
    exportAll: () => '{}',
    getUsageBytes: () => 0,
    migrate: () => {},
  },
}))

function setTestStore(data: Record<string, unknown>) {
  ;(globalThis as Record<string, unknown>).__TEST_STORE__ = data
}

function renderHistoryPage(opts: { weightUnit?: 'lbs' | 'kg'; logs?: WorkoutLog[] } = {}) {
  const { weightUnit = 'lbs', logs = [LOG_WITH_WEIGHTS] } = opts

  const settings: Settings = {
    theme: 'light',
    soundEnabled: true,
    weightUnit,
    keepScreenAwake: true,
    autoBackup: false,
  }

  setTestStore({
    gw_settings: settings,
    gw_workout_logs: logs,
    gw_program: null,
    gw_custom_programs: [],
  })

  return render(
    <MemoryRouter initialEntries={['/history']}>
      <SettingsProvider>
        <ProgramProvider>
          <WorkoutLogProvider>
            <HistoryPage />
          </WorkoutLogProvider>
        </ProgramProvider>
      </SettingsProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).__TEST_STORE__
})

describe('HistoryPage', () => {
  test('displays weight unit from settings as "kg" when user prefers kg', () => {
    renderHistoryPage({ weightUnit: 'kg' })

    // The PR section should show "100 kg" not "100 lbs"
    const prValue = screen.getByText('100 kg')
    expect(prValue).toBeInTheDocument()

    // Should NOT show "lbs" anywhere
    const lbsElements = screen.queryAllByText(/lbs/)
    expect(lbsElements).toHaveLength(0)
  })

  test('displays weight unit from settings as "lbs" when user prefers lbs', () => {
    renderHistoryPage({ weightUnit: 'lbs' })

    const prValue = screen.getByText('100 lbs')
    expect(prValue).toBeInTheDocument()
  })
})
