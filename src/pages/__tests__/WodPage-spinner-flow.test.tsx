import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ProgramProvider } from '@/contexts/ProgramContext'
import { WorkoutLogProvider } from '@/contexts/WorkoutLogContext'
import { WodPage } from '../WodPage'
import type { GeneratedWod } from '@/lib/wod-generator'

// Mock HTMLDialogElement methods for jsdom
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

// Mock storage to prevent localStorage errors in tests
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

const MOCK_GENERATED_WOD: GeneratedWod = {
  name: 'Garage Grinder #42',
  type: 'amrap',
  duration: 12,
  movements: [
    { name: 'Air Squat', reps: 15, category: 'squat' },
    { name: 'Push-up', reps: 12, category: 'push' },
    { name: 'Kettlebell Swing', reps: 10, category: 'hinge' },
  ],
  targetCategories: ['squat', 'push', 'hinge'],
  reasoning: 'Targeting gaps.',
}

function renderWodPage(locationState?: Record<string, unknown>) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/wod', state: locationState ?? null }]}
    >
      <SettingsProvider>
        <ProgramProvider>
          <WorkoutLogProvider>
            <WodPage />
          </WorkoutLogProvider>
        </ProgramProvider>
      </SettingsProvider>
    </MemoryRouter>,
  )
}

describe('WodPage – generated WOD auto-fill', () => {
  it('auto-fills title from generatedWod in location state', () => {
    renderWodPage({ generatedWod: MOCK_GENERATED_WOD })

    const titleInput = screen.getByPlaceholderText(/fran/i) as HTMLInputElement
    expect(titleInput.value).toBe('Garage Grinder #42')
  })

  it('auto-fills movements description from generatedWod', () => {
    renderWodPage({ generatedWod: MOCK_GENERATED_WOD })

    const descArea = screen.getByPlaceholderText(/thrusters/i) as HTMLTextAreaElement
    expect(descArea.value).toContain('15 Air Squat')
    expect(descArea.value).toContain('12 Push-up')
    expect(descArea.value).toContain('10 Kettlebell Swing')
  })

  it('auto-fills WOD type from generatedWod', () => {
    renderWodPage({ generatedWod: MOCK_GENERATED_WOD })

    // The AMRAP type button in the form should be selected (has accent bg)
    // Multiple elements may contain "AMRAP" text, so find the type selector buttons
    const typeButtons = screen.getAllByText('AMRAP')
    const selectedButton = typeButtons.find((el) =>
      el.className.includes('bg-accent'),
    )
    expect(selectedButton).toBeDefined()
  })

  it('does not auto-fill when no generatedWod is present', () => {
    renderWodPage()

    const titleInput = screen.getByPlaceholderText(/fran/i) as HTMLInputElement
    expect(titleInput.value).toBe('')
  })
})
