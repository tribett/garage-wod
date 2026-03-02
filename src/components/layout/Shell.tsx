import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

interface ShellProps {
  children: ReactNode
}

// Timer page gets a full-screen experience with no nav
const FULL_SCREEN_PATHS = ['/timer']

export function Shell({ children }: ShellProps) {
  const location = useLocation()
  const isFullScreen = FULL_SCREEN_PATHS.some((p) => location.pathname.startsWith(p))

  if (isFullScreen) {
    return <div className="min-h-dvh flex flex-col">{children}</div>
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
