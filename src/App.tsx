import { HashRouter, Routes, Route } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { DashboardPage } from '@/pages/DashboardPage'
import { WorkoutPage } from '@/pages/WorkoutPage'
import { TimerPage } from '@/pages/TimerPage'
import { LogPage } from '@/pages/LogPage'
import { ProgramPage } from '@/pages/ProgramPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/workout/:weekNumber/:dayNumber" element={<WorkoutPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/log/:weekNumber/:dayNumber" element={<LogPage />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:movementName" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Shell>
    </HashRouter>
  )
}

export default App
