import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppProviders } from '@/contexts/AppProviders'
import { storage } from '@/lib/storage'
import './index.css'
import App from './App'

// Run storage migrations on boot
storage.migrate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
)
