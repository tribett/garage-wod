import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/contexts/SettingsContext'
import { useWorkoutLogs, useWorkoutLogDispatch } from '@/contexts/WorkoutLogContext'
import { generateId } from '@/lib/id'
import { storage } from '@/lib/storage'
import { STANDALONE_PROGRAM_ID } from '@/lib/constants'
import { BENCHMARK_WODS, type BenchmarkWod } from '@/data/benchmark-wods'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { WorkoutLog, WodResult } from '@/types/workout-log'
import type { WodType } from '@/types/program'

const WOD_TYPES: { value: WodType; label: string; scorePlaceholder: string }[] = [
  { value: 'forTime', label: 'For Time', scorePlaceholder: 'e.g., 8:42' },
  { value: 'amrap', label: 'AMRAP', scorePlaceholder: 'e.g., 5+3' },
  { value: 'emom', label: 'EMOM', scorePlaceholder: 'e.g., completed Rx' },
  { value: 'tabata', label: 'Tabata', scorePlaceholder: 'e.g., 84 total reps' },
  { value: 'rounds', label: 'Rounds', scorePlaceholder: 'e.g., 5 rounds' },
]

const CATEGORY_TABS: { value: BenchmarkWod['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'girl', label: 'Girls' },
  { value: 'hero', label: 'Heroes' },
  { value: 'classic', label: 'Classics' },
  { value: 'open', label: 'Open' },
]

const TYPE_LABELS: Record<WodType, string> = {
  forTime: 'For Time',
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
  rounds: 'Rounds',
}

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

  // Benchmark picker state
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<BenchmarkWod['category'] | 'all'>('all')

  // Count standalone WODs for generating weekNumber/dayNumber
  const standaloneCount = logs.filter((l) => l.programId === STANDALONE_PROGRAM_ID).length

  const selectedType = WOD_TYPES.find((t) => t.value === wodType)!

  // Filtered benchmark list
  const filteredBenchmarks = useMemo(() => {
    let list = BENCHMARK_WODS
    if (categoryFilter !== 'all') {
      list = list.filter((w) => w.category === categoryFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, categoryFilter])

  const handleSelectBenchmark = (wod: BenchmarkWod) => {
    setTitle(wod.name)
    setDescription(wod.description)
    setWodType(wod.type)
    setShowPicker(false)
    setSearch('')
    setCategoryFilter('all')
  }

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
        {/* Quick Actions Row */}
        <div className="flex gap-2 animate-slide-up">
          <Card padding="sm" className="flex-1">
            <button
              onClick={() => setShowPicker(true)}
              className="w-full flex items-center gap-2 group"
            >
              <span className="text-lg">🏋️</span>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
                  Benchmarks
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  Girls, Heroes, Open
                </p>
              </div>
            </button>
          </Card>
          <Card padding="sm" className="flex-1">
            <a
              href="https://www.crossfit.com/workout/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 group"
            >
              <span className="text-lg">📋</span>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
                  Today&apos;s WOD
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  crossfit.com
                </p>
              </div>
            </a>
          </Card>
        </div>

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

      {/* Benchmark Picker Modal */}
      <Modal open={showPicker} onClose={() => { setShowPicker(false); setSearch(''); setCategoryFilter('all') }}>
        <div className="space-y-3">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">
            Pick a Benchmark
          </h2>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workouts..."
            className="
              w-full h-9 px-3 rounded-lg text-sm
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCategoryFilter(tab.value)}
                className={`
                  px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap
                  ${categoryFilter === tab.value
                    ? 'bg-accent text-white dark:bg-accent-dark'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto -mx-5 px-5 space-y-1.5">
            {filteredBenchmarks.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">
                No workouts found
              </p>
            ) : (
              filteredBenchmarks.map((wod) => (
                <button
                  key={wod.name}
                  onClick={() => handleSelectBenchmark(wod)}
                  className="
                    w-full text-left p-3 rounded-xl transition-colors
                    hover:bg-zinc-50 dark:hover:bg-zinc-800
                    active:bg-zinc-100 dark:active:bg-zinc-700
                  "
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {wod.name}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 mt-0.5 whitespace-pre-line">
                        {wod.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                      {TYPE_LABELS[wod.type]}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
