import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings, useUpdateSettings } from '@/contexts/SettingsContext'
import { useProgramDispatch } from '@/contexts/ProgramContext'
import { useWorkoutLogDispatch } from '@/contexts/WorkoutLogContext'
import { validateProgram } from '@/lib/schema-validator'
import { storage } from '@/lib/storage'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const THEME_OPTIONS: { value: 'light' | 'dark' | 'system'; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const UNIT_OPTIONS: { value: 'lbs' | 'kg'; label: string }[] = [
  { value: 'lbs', label: 'lbs' },
  { value: 'kg', label: 'kg' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const programDispatch = useProgramDispatch()
  const logDispatch = useWorkoutLogDispatch()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [pendingRestore, setPendingRestore] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null)

  const storageUsed = storage.getUsageBytes()
  const storageKB = (storageUsed / 1024).toFixed(1)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const result = validateProgram(data)

      if (!result.valid) {
        setUploadError(result.errors.map((err) => `${err.path}: ${err.message}`).join('\n'))
        return
      }

      programDispatch({ type: 'LOAD_PROGRAM', payload: result.program! })
      setUploadSuccess(`Loaded "${result.program!.name}" — ${result.program!.phases.length} phases`)
    } catch {
      setUploadError('Invalid JSON file. Please check the format.')
    }

    // Reset file input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleReset() {
    logDispatch({ type: 'RESET_ALL' })
    programDispatch({ type: 'RESET_POSITION' })
    setShowResetModal(false)
  }

  function handleExport() {
    const data = storage.exportAll()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grgwod-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleRestoreFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setRestoreError(null)
    setRestoreSuccess(null)

    try {
      const text = await file.text()
      // Validate it's parseable JSON before showing the modal
      JSON.parse(text)
      setPendingRestore(text)
      setShowRestoreModal(true)
    } catch {
      setRestoreError('Invalid JSON file. Please select a valid backup.')
    }

    if (restoreInputRef.current) restoreInputRef.current.value = ''
  }

  function handleRestoreConfirm() {
    if (!pendingRestore) return

    const result = storage.importAll(pendingRestore)
    setShowRestoreModal(false)
    setPendingRestore(null)

    if (result.success) {
      setRestoreSuccess('Backup restored! Reloading...')
      // Reload after a short delay so the user sees the success message
      setTimeout(() => window.location.reload(), 800)
    } else {
      setRestoreError(result.error ?? 'Failed to restore backup.')
    }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Settings" />

      <div className="px-5 space-y-6 pb-8">
        {/* Appearance */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Appearance
          </h3>
          <Card>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ theme: opt.value })}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-md transition-all
                      ${settings.theme === opt.value
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Workout Preferences */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Workout Preferences
          </h3>
          <div className="space-y-2">
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weight Unit</span>
                <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                  {UNIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ weightUnit: opt.value })}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-md transition-all
                        ${settings.weightUnit === opt.value
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <Toggle
                label="Timer Sounds"
                checked={settings.soundEnabled}
                onChange={(v) => updateSettings({ soundEnabled: v })}
              />
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Keep Screen Awake</span>
                  <p className="text-xs text-zinc-400">Prevents dimming during workouts</p>
                </div>
                <Toggle
                  checked={settings.keepScreenAwake}
                  onChange={(v) => updateSettings({ keepScreenAwake: v })}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Custom Program */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Custom Program
          </h3>
          <Card>
            <div className="space-y-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Create a program in-app or upload a JSON file.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/program/create')}
                >
                  Create Program
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload JSON
                </Button>
              </div>
              {uploadError && (
                <p className="text-xs text-red-500 dark:text-red-400 whitespace-pre-wrap">
                  {uploadError}
                </p>
              )}
              {uploadSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {uploadSuccess}
                </p>
              )}
            </div>
          </Card>
        </section>

        {/* Data */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Data
          </h3>
          <div className="space-y-2">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Storage Used</p>
                  <p className="text-xs text-zinc-400">{storageKB} KB</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleExport}>
                    Export
                  </Button>
                  <input
                    ref={restoreInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => restoreInputRef.current?.click()}
                  >
                    Import
                  </Button>
                </div>
              </div>
              {restoreError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  {restoreError}
                </p>
              )}
              {restoreSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  {restoreSuccess}
                </p>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Reset All Data
                  </p>
                  <p className="text-xs text-zinc-400">
                    Clears all workout logs and progress
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowResetModal(true)}>
                  Reset
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            About
          </h3>
          <Card>
            <div className="space-y-1">
              <p className="font-display font-bold text-sm">GRGWOD</p>
              <p className="text-xs text-zinc-400">
                Garage gym workout tracker for CrossFit athletes.
              </p>
              <p className="text-xs text-zinc-400">v0.1.0</p>
            </div>
          </Card>
        </section>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)}>
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg">Reset All Data?</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This will permanently delete all your workout logs, PRs, and progress. This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleReset}>
              Reset Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal open={showRestoreModal} onClose={() => { setShowRestoreModal(false); setPendingRestore(null) }}>
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg">Restore from Backup?</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This will replace your current settings, workout logs, and program data with the
            backup. The page will reload after restoring.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => { setShowRestoreModal(false); setPendingRestore(null) }}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleRestoreConfirm}>
              Restore
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
