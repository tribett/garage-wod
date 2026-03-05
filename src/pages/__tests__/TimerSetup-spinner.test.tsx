import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ProgramProvider } from '@/contexts/ProgramContext'
import { WorkoutLogProvider } from '@/contexts/WorkoutLogContext'
import { TimerPage } from '../TimerPage'
import type { GeneratedWod } from '@/lib/wod-generator'

// Mock HTMLDialogElement
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

// Mock storage
vi.mock('@/lib/storage', () => ({
  storage: {
    load: (_key: string, fallback: unknown) => fallback,
    save: () => {},
    remove: () => {},
    clear: () => {},
    exportAll: () => '{}',
    getUsageBytes: () => 0,
    migrate: () => {},
    triggerAutoBackup: () => {},
  },
}))

// Mock timer config storage to return null (no saved config)
vi.mock('@/lib/timer-config-storage', () => ({
  saveTimerConfig: vi.fn(),
  loadTimerConfig: () => null,
}))

const MOCK_AMRAP_WOD: GeneratedWod = {
  name: 'Garage Grinder #42',
  type: 'amrap',
  duration: 15,
  movements: [
    { name: 'Air Squat', reps: 15, category: 'squat' },
    { name: 'Push-up', reps: 12, category: 'push' },
  ],
  targetCategories: ['squat', 'push'],
  reasoning: 'Targeting gaps.',
}

// Mock wod-generator to return our controlled WOD
vi.mock('@/lib/wod-generator', () => ({
  generateWod: () => MOCK_AMRAP_WOD,
}))

function renderTimerPage() {
  return render(
    <MemoryRouter initialEntries={['/timer']}>
      <SettingsProvider>
        <ProgramProvider>
          <WorkoutLogProvider>
            <TimerPage />
          </WorkoutLogProvider>
        </ProgramProvider>
      </SettingsProvider>
    </MemoryRouter>,
  )
}

describe('TimerSetup – WodSpinner integration', () => {
  it('renders Spin the WOD button on timer setup page', () => {
    renderTimerPage()
    expect(screen.getByRole('button', { name: /spin/i })).toBeDefined()
  })

  it('auto-selects AMRAP mode after spinning an AMRAP WOD', () => {
    renderTimerPage()

    fireEvent.click(screen.getByRole('button', { name: /spin/i }))

    // The AMRAP mode button should now be selected
    const amrapButton = screen.getByText('AMRAP')
    expect(amrapButton.closest('button')?.className).toContain('border-accent')
  })

  it('shows generated WOD card after spinning', () => {
    renderTimerPage()

    fireEvent.click(screen.getByRole('button', { name: /spin/i }))

    expect(screen.getByText('Garage Grinder #42')).toBeDefined()
  })
})
