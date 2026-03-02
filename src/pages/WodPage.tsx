import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/contexts/SettingsContext'
import { useWorkoutLogs, useWorkoutLogDispatch } from '@/contexts/WorkoutLogContext'
import { generateId } from '@/lib/id'
import { storage } from '@/lib/storage'
import { STANDALONE_PROGRAM_ID } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { WorkoutLog, WodResult } from '@/types/workout-log'
import type { WodType } from '@/types/program'

const WOD_TYPES: { value: WodType; label: string; scorePlaceholder: string }[] = [
  { value: 'forTime', label: 'For Time', scorePlaceholder: 'e.g., 8:42' },
  { value: 'amrap', label: 'AMRAP', scorePlaceholder: 'e.g., 5+3' },
  { value: 'emom', label: 'EMOM', scorePlaceholder: 'e.g., completed Rx' },
  { value: 'tabata', label: 'Tabata', scorePlaceholder: 'e.g., 84 total reps' },
  { value: 'rounds', label: 'Rounds', scorePlaceholder: 'e.g., 5 rounds' },
]

export function WodPage() {
  const navigate = useNavigate()
  const settings = useSettings()
  const logs = useWorkoutLogs()
  const dispatch = useWorkoutLogDispatch()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [wodType, setWodType] = useState<WodType>('forTime')
  const [score, setScore] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  // Count standalone WODs for generating weekNumber/dayNumber
  const standaloneCount = logs.filter((l) => l.programId === STANDALONE_PROGRAM_ID).length

  const selectedType = WOD_TYPES.find((t) => t.value === wodType)!

  const handleSave = () => {
    if (!title.trim()) return

    let wodResult: WodResult | undefined
    if (score.trim()) {
      wodResult = { type: wodType, score: score.trim() }
    }

    const log: WorkoutLog = {
      id: generateId(),
      programId: STANDALONE_PROGRAM_ID,
      weekNumber: 0,
      dayNumber: standaloneCount + 1,
      completedAt: new Date().toISOString(),
      completed: true,
      wodResult,
      notes: notes.trim() || undefined,
      title: title.trim(),
      description: description.trim() || undefined,
    }

    dispatch({ type: 'LOG_WORKOUT', payload: log })
    setSaved(true)

    if (settings.autoBackup) storage.triggerAutoBackup()
  }

  if (saved) {
    return (
      <div className="animate-fade-in">
        <Header
          title="Log a WOD"
          rightAction={
            <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm">
              Back
            </button>
          }
        />
        <div className="px-5 space-y-4 pb-8">
          <Card padding="lg" className="animate-scale-in border-emerald-200 dark:border-emerald-800">
            <div className="text-center space-y-2">
              <div className="text-3xl">🎉</div>
              <p className="font-display font-bold text-emerald-600 dark:text-emerald-400">
                WOD Logged!
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {title}
              </p>
            </div>
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => {
              setTitle('')
              setDescription('')
              setScore('')
              setNotes('')
              setSaved(false)
            }}>
              Log Another
            </Button>
            <Button fullWidth onClick={() => navigate('/')}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Log a WOD"
        rightAction={
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm">
            Back
          </button>
        }
      />

      <div className="px-5 space-y-4 pb-8">
        {/* CrossFit.com link */}
        <Card padding="md" className="animate-slide-up">
          <a
            href="https://www.crossfit.com/workout/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
                Today&apos;s CrossFit WOD
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                crossfit.com/workout
              </p>
            </div>
            <svg className="w-4 h-4 text-zinc-400 group-hover:text-accent dark:group-hover:text-accent-light transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </Card>

        {/* WOD Entry Form */}
        <Card padding="lg" className="animate-slide-up delay-1">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                WOD Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Fran, Quarter Gone Bad, 260302"
                className="
                  w-full h-10 px-3 rounded-xl text-sm
                  bg-zinc-50 border border-zinc-200 text-zinc-900
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                "
              />
            </div>

            {/* WOD Type */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WOD_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setWodType(t.value)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                      ${wodType === t.value
                        ? 'bg-accent text-white dark:bg-accent-dark'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Movements / Prescription
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={"21-15-9\nThrusters (95/65)\nPull-ups"}
                rows={4}
                className="
                  w-full px-3 py-2 rounded-xl text-sm resize-none
                  bg-zinc-50 border border-zinc-200 text-zinc-900
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                "
              />
            </div>

            {/* Score */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Score
              </label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder={selectedType.scorePlaceholder}
                className="
                  w-full h-10 px-3 rounded-xl text-sm
                  bg-zinc-50 border border-zinc-200 text-zinc-900
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                "
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel? Scaled? Rx'd?"
                rows={2}
                className="
                  w-full px-3 py-2 rounded-xl text-sm resize-none
                  bg-zinc-50 border border-zinc-200 text-zinc-900
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                "
              />
            </div>

            <Button
              size="lg"
              fullWidth
              onClick={handleSave}
              disabled={!title.trim()}
            >
              Save WOD
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
