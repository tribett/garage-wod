import type { ReactNode } from 'react'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ProgramProvider } from '@/contexts/ProgramContext'
import { WorkoutLogProvider } from '@/contexts/WorkoutLogContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ProgramProvider>
        <WorkoutLogProvider>
          {children}
        </WorkoutLogProvider>
      </ProgramProvider>
    </SettingsProvider>
  )
}
