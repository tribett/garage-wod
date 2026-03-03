import type { ReactNode } from 'react'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ProgramProvider } from '@/contexts/ProgramContext'
import { WorkoutLogProvider } from '@/contexts/WorkoutLogContext'
import { ToastProvider } from '@/contexts/ToastContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ProgramProvider>
        <WorkoutLogProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WorkoutLogProvider>
      </ProgramProvider>
    </SettingsProvider>
  )
}
