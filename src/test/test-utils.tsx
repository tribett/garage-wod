import type { ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ProgramProvider } from '@/contexts/ProgramContext'
import { WorkoutLogProvider } from '@/contexts/WorkoutLogContext'

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <SettingsProvider>
        <ProgramProvider>
          <WorkoutLogProvider>{children}</WorkoutLogProvider>
        </ProgramProvider>
      </SettingsProvider>
    </MemoryRouter>
  )
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string },
) {
  const { route, ...renderOptions } = options ?? {}

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={route ? [route] : ['/']}>
        <SettingsProvider>
          <ProgramProvider>
            <WorkoutLogProvider>{children}</WorkoutLogProvider>
          </ProgramProvider>
        </SettingsProvider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export { customRender as render }
export { AllProviders }
