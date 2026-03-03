import { useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings, useUpdateSettings, useReplaceSettings } from '@/contexts/SettingsContext'
import { useProgramDispatch } from '@/contexts/ProgramContext'
import { useWorkoutLogDispatch } from '@/contexts/WorkoutLogContext'
import { useToast } from '@/contexts/ToastContext'
import { validateProgram } from '@/lib/schema-validator'
import { storage } from '@/lib/storage'
import { checkStorageQuota } from '@/lib/storage-quota'
import { generateBackupFilename } from '@/lib/backup-filename'
import { previewImport } from '@/lib/import-preview'
import type { ImportPreview } from '@/lib/import-preview'
import { STORAGE_KEYS } from '@/lib/constants'
import { DEFAULT_SETTINGS } from '@/types/settings'
import type { Settings } from '@/types/settings'
import type { WorkoutLog } from '@/types/workout-log'
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
  const replaceSettings = useReplaceSettings()
  const programDispatch = useProgramDispatch()
  const logDispatch = useWorkoutLogDispatch()
  const { addToast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [pendingRestore, setPendingRestore] = useState<string | null>(null)
  const [importPreviewData, setImportPreviewData] = useState<ImportPreview | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null)

  const quota = useMemo(() => checkStorageQuota(storage.getUsageBytes()), [])

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
    a.download = generateBackupFilename()
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
      const preview = previewImport(text)
      if (!preview) {
        setRestoreError('Invalid backup file. Please select a valid backup.')
        return
      }
      setPendingRestore(text)
      setImportPreviewData(preview)
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
    setImportPreviewData(null)

    if (result.success) {
      // Hot-swap: re-read all contexts from localStorage instead of reloading
      const restoredLogs = storage.load<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, [])
      logDispatch({ type: 'REPLACE_ALL', payload: restoredLogs })

      const restoredSettings = storage.load<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
      replaceSettings(restoredSettings)

      programDispatch({ type: 'RELOAD_FROM_STORAGE' })

      addToast('Backup restored!', 'success')
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

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Bodyweight</span>
                  <p className="text-xs text-zinc-400">Used for BW-ratio calculations</p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={settings.bodyweight ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined
                      updateSettings({ bodyweight: val })
                    }}
                    placeholder="—"
                    className="
                      w-16 h-8 px-2 text-right text-sm font-semibold rounded-lg
                      bg-zinc-50 border border-zinc-200 text-zinc-900
                      dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                      placeholder:text-zinc-300 dark:placeholder:text-zinc-600
                      focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                    "
                  />
                  <span className="text-xs text-zinc-400">{settings.weightUnit}</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Reference */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Reference
          </h3>
          <Card interactive onClick={() => navigate('/glossary')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">CrossFit Glossary</p>
                <p className="text-xs text-zinc-400">Common CrossFit terms & abbreviations</p>
              </div>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Card>
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
                  <span className="text-sm font-medium">Auto-Backup</span>
                  <p className="text-xs text-zinc-400">Download a backup after each workout</p>
                </div>
                <Toggle
                  checked={settings.autoBackup}
                  onChange={(v) => updateSettings({ autoBackup: v })}
                />
              </div>
            </Card>

            <Card>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Storage Used</p>
                    <p className="text-xs text-zinc-400">
                      {quota.usedFormatted} of {quota.totalFormatted}
                    </p>
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

                {/* Storage quota bar */}
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      quota.level === 'critical'
                        ? 'bg-red-500'
                        : quota.level === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, quota.percentage)}%` }}
                  />
                </div>

                {quota.level !== 'ok' && (
                  <p className={`text-xs font-medium ${
                    quota.level === 'critical'
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {quota.level === 'critical'
                      ? '⚠ Storage nearly full — export a backup and clear old data.'
                      : '⚠ Storage usage is getting high — consider exporting a backup.'}
                  </p>
                )}
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
              <p className="text-xs text-zinc-400">v1.0.0</p>
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

      {/* Restore Confirmation Modal — with import preview (Improvement 6) */}
      <Modal open={showRestoreModal} onClose={() => { setShowRestoreModal(false); setPendingRestore(null); setImportPreviewData(null) }}>
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg">Restore from Backup?</h2>
          {importPreviewData && (
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Backup Contents
              </p>
              <div className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                <p>
                  <span className="font-medium">{importPreviewData.logCount}</span> workout log{importPreviewData.logCount !== 1 ? 's' : ''}
                </p>
                {importPreviewData.programName && (
                  <p>
                    Program: <span className="font-medium">{importPreviewData.programName}</span>
                  </p>
                )}
                {importPreviewData.hasCustomPrograms && !importPreviewData.programName && (
                  <p>Custom program data included</p>
                )}
                <p>
                  Settings: <span className="font-medium">{importPreviewData.settingsPresent ? 'included' : 'not included'}</span>
                </p>
              </div>
            </div>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This will replace your current settings, workout logs, and program data with the backup.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => { setShowRestoreModal(false); setPendingRestore(null); setImportPreviewData(null) }}>
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
