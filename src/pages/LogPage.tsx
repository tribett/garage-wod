import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs, useWorkoutLogDispatch } from '@/contexts/WorkoutLogContext'
import { useSettings } from '@/contexts/SettingsContext'
import { generateId } from '@/lib/id'
import { WEIGHT_INCREMENTS } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { NumberInput } from '@/components/ui/NumberInput'
import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import type { WorkoutLog, ExerciseLog, SetLog, WodResult } from '@/types/workout-log'
import type { Movement, WodScoring } from '@/types/program'

export function LogPage() {
  const { weekNumber, dayNumber } = useParams<{ weekNumber: string; dayNumber: string }>()
  const navigate = useNavigate()
  const { program } = useProgram()
  const logs = useWorkoutLogs()
  const dispatch = useWorkoutLogDispatch()
  const settings = useSettings()

  const week = Number(weekNumber)
  const day = Number(dayNumber)

  const workout = useMemo(() => {
    if (!program) return null
    for (const phase of program.phases) {
      for (const w of phase.weeks) {
        if (w.weekNumber === week) {
          return w.days.find((d) => d.dayNumber === day) ?? null
        }
      }
    }
    return null
  }, [program, week, day])

  const existingLog = useMemo(
    () => logs.find((l) => l.programId === program?.id && l.weekNumber === week && l.dayNumber === day),
    [logs, program, week, day],
  )

  // Get previous weights for pre-filling
  const previousWeights = useMemo(() => {
    const weights = new Map<string, number>()
    const sorted = [...logs]
      .filter((l) => l.completed && l.exercises)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    for (const log of sorted) {
      for (const ex of log.exercises ?? []) {
        if (!weights.has(ex.movementId)) {
          const maxWeight = Math.max(...ex.sets.filter((s) => s.weight).map((s) => s.weight ?? 0), 0)
          if (maxWeight > 0) weights.set(ex.movementId, maxWeight)
        }
      }
    }
    return weights
  }, [logs])

  const [completed, setCompleted] = useState(!!existingLog?.completed)
  const [exerciseData, setExerciseData] = useState<Map<string, number | undefined>>(() => {
    const map = new Map<string, number | undefined>()
    if (existingLog?.exercises) {
      for (const ex of existingLog.exercises) {
        const maxW = Math.max(...ex.sets.filter((s) => s.weight).map((s) => s.weight ?? 0), 0)
        if (maxW > 0) map.set(ex.movementId, maxW)
      }
    }
    return map
  })
  const [wodScore, setWodScore] = useState(existingLog?.wodResult?.score ?? '')
  const [notes, setNotes] = useState(existingLog?.notes ?? '')
  const [showCelebration, setShowCelebration] = useState(false)

  if (!workout || !program) {
    return (
      <div className="p-5">
        <p className="text-zinc-500">Workout not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    )
  }

  const wodBlock = workout.blocks.find((b) => b.type === 'wod')
  const allMovements = workout.blocks.flatMap((b) => b.movements).filter((m) => m.weight || m.sets)
  const wodScoring: WodScoring | undefined = wodBlock?.scoring

  const handleQuickComplete = () => {
    const log: WorkoutLog = {
      id: existingLog?.id ?? generateId(),
      programId: program.id,
      weekNumber: week,
      dayNumber: day,
      completedAt: new Date().toISOString(),
      completed: true,
    }

    if (existingLog) {
      dispatch({ type: 'UPDATE_LOG', payload: log })
    } else {
      dispatch({ type: 'LOG_WORKOUT', payload: log })
    }

    setCompleted(true)
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 2000)
  }

  const handleSaveDetails = () => {
    const exercises: ExerciseLog[] = []
    for (const mov of allMovements) {
      const weight = exerciseData.get(mov.id)
      if (weight !== undefined) {
        const sets: SetLog[] = []
        const numSets = mov.sets ?? 1
        for (let i = 0; i < numSets; i++) {
          sets.push({
            weight,
            reps: typeof mov.reps === 'number' ? mov.reps : undefined,
            completed: true,
          })
        }
        exercises.push({ movementId: mov.id, movementName: mov.name, sets })
      }
    }

    let wodResult: WodResult | undefined
    if (wodScoring && wodScore) {
      wodResult = { type: wodScoring.type, score: wodScore }
    }

    const log: WorkoutLog = {
      id: existingLog?.id ?? generateId(),
      programId: program.id,
      weekNumber: week,
      dayNumber: day,
      completedAt: existingLog?.completedAt ?? new Date().toISOString(),
      completed: true,
      exercises: exercises.length > 0 ? exercises : undefined,
      wodResult,
      notes: notes.trim() || undefined,
    }

    if (existingLog) {
      dispatch({ type: 'UPDATE_LOG', payload: log })
    } else {
      dispatch({ type: 'LOG_WORKOUT', payload: log })
    }

    setCompleted(true)
  }

  const updateWeight = (movId: string, value: number | undefined) => {
    setExerciseData((prev) => {
      const next = new Map(prev)
      next.set(movId, value)
      return next
    })
  }

  const step = WEIGHT_INCREMENTS[settings.weightUnit]

  return (
    <div className="animate-fade-in">
      <Header
        title={`Week ${week} · Day ${day}`}
        subtitle={workout.name}
        rightAction={
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm">
            Back
          </button>
        }
      />

      <div className="px-5 space-y-4 pb-8">
        {/* Level 0: Quick Complete */}
        {!completed ? (
          <Card padding="lg" className="animate-slide-up">
            <div className="text-center space-y-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Finished your workout? Tap to log it.
              </p>
              <Button size="xl" fullWidth onClick={handleQuickComplete}>
                Complete Workout
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="lg" className="animate-scale-in border-emerald-200 dark:border-emerald-800">
            <div className="text-center space-y-1">
              <div className="text-3xl">
                {showCelebration ? '🎉' : '✓'}
              </div>
              <p className="font-display font-bold text-emerald-600 dark:text-emerald-400">
                Workout Complete!
              </p>
            </div>
          </Card>
        )}

        {/* Level 1: Weight Entry */}
        {allMovements.length > 0 && (
          <Accordion
            title="Log Weights"
            badge={<Badge variant="muted">Optional</Badge>}
            className="animate-slide-up delay-1"
          >
            <div className="space-y-3 pb-3">
              {allMovements.map((mov: Movement) => (
                <NumberInput
                  key={mov.id}
                  label={mov.name}
                  value={exerciseData.get(mov.id)}
                  onChange={(v) => updateWeight(mov.id, v)}
                  placeholder={previousWeights.has(mov.id) ? String(previousWeights.get(mov.id)) : undefined}
                  step={step}
                  unit={settings.weightUnit}
                />
              ))}
            </div>
          </Accordion>
        )}

        {/* Level 2: Detailed Log */}
        <Accordion
          title="More Details"
          badge={<Badge variant="muted">Optional</Badge>}
          className="animate-slide-up delay-2"
        >
          <div className="space-y-3 pb-3">
            {wodScoring && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  WOD Score ({wodScoring.type === 'amrap' ? 'rounds + reps' : wodScoring.type === 'forTime' ? 'time' : 'result'})
                </label>
                <input
                  type="text"
                  value={wodScore}
                  onChange={(e) => setWodScore(e.target.value)}
                  placeholder={wodScoring.type === 'amrap' ? 'e.g., 5+3' : wodScoring.type === 'forTime' ? 'e.g., 8:42' : 'Score'}
                  className="
                    w-full h-10 px-3 rounded-xl text-sm
                    bg-zinc-50 border border-zinc-200 text-zinc-900
                    dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                    placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                  "
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel? Anything to remember next time?"
                rows={3}
                className="
                  w-full px-3 py-2 rounded-xl text-sm resize-none
                  bg-zinc-50 border border-zinc-200 text-zinc-900
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                "
              />
            </div>
            <Button variant="secondary" fullWidth onClick={handleSaveDetails}>
              Save Details
            </Button>
          </div>
        </Accordion>

        {/* Navigation */}
        <div className="pt-4">
          <Button variant="ghost" fullWidth onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
