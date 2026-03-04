import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs, useWorkoutLogDispatch } from '@/contexts/WorkoutLogContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useToast } from '@/contexts/ToastContext'
import { generateId } from '@/lib/id'
import { storage } from '@/lib/storage'
import { WEIGHT_INCREMENTS } from '@/lib/constants'
import { detectNewPRs } from '@/lib/pr-calculator'
import { triggerHaptic } from '@/lib/haptics'
import { RPE_LABELS } from '@/lib/rpe'
import type { PR } from '@/lib/pr-calculator'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { NumberInput } from '@/components/ui/NumberInput'
import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { RestTimer } from '@/components/ui/RestTimer'
import { Confetti } from '@/components/ui/Confetti'
import { WodScoreInput } from '@/components/ui/WodScoreInput'
import type { WorkoutLog, ExerciseLog, SetLog, WodResult } from '@/types/workout-log'
import type { Movement, WodScoring } from '@/types/program'

interface LogLocationState {
  timerScore?: string
  timerMode?: string
  timerElapsed?: number
  timerRounds?: number
  timerExtraReps?: number
}

export function LogPage() {
  const { weekNumber, dayNumber } = useParams<{ weekNumber: string; dayNumber: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LogLocationState | null
  const { program } = useProgram()
  const logs = useWorkoutLogs()
  const dispatch = useWorkoutLogDispatch()
  const settings = useSettings()
  const { addToast } = useToast()

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
  // Per-set weight tracking (Improvement 12)
  const [perSetMode, setPerSetMode] = useState<Set<string>>(() => {
    // Initialize from existing log if it had per-set data
    const set = new Set<string>()
    if (existingLog?.exercises) {
      for (const ex of existingLog.exercises) {
        const weights = ex.sets.map((s) => s.weight).filter(Boolean)
        if (weights.length > 1 && new Set(weights).size > 1) {
          set.add(ex.movementId)
        }
      }
    }
    return set
  })
  const [perSetData, setPerSetData] = useState<Map<string, (number | undefined)[]>>(() => {
    const map = new Map<string, (number | undefined)[]>()
    if (existingLog?.exercises) {
      for (const ex of existingLog.exercises) {
        const weights = ex.sets.map((s) => s.weight).filter(Boolean)
        if (weights.length > 1 && new Set(weights).size > 1) {
          map.set(ex.movementId, ex.sets.map((s) => s.weight))
        }
      }
    }
    return map
  })
  // Pre-fill WOD score from timer result (Improvement 1) or existing log
  // When AMRAP round data is available from the timer, format it as the score
  const [wodScore, setWodScore] = useState(() => {
    if (existingLog?.wodResult?.score) return existingLog.wodResult.score
    if (
      locationState?.timerMode === 'amrap' &&
      locationState?.timerRounds != null &&
      locationState.timerRounds > 0
    ) {
      const r = locationState.timerRounds
      const er = locationState.timerExtraReps ?? 0
      return `${r}+${er}`
    }
    return locationState?.timerScore ?? ''
  })
  // Track structured WOD data for type-appropriate scoring (Improvement 2)
  // Pre-fill from timer round data if available
  const [wodStructured, setWodStructured] = useState<{
    roundsCompleted?: number
    extraReps?: number
    totalTime?: number
  } | undefined>(() => {
    if (
      locationState?.timerMode === 'amrap' &&
      locationState?.timerRounds != null &&
      locationState.timerRounds > 0
    ) {
      return {
        roundsCompleted: locationState.timerRounds,
        extraReps: locationState.timerExtraReps ?? 0,
      }
    }
    return undefined
  })
  const [notes, setNotes] = useState(existingLog?.notes ?? '')
  const [rpe, setRpe] = useState<number | undefined>(existingLog?.rpe)
  const [showCelebration, setShowCelebration] = useState(false)
  const [newPRs, setNewPRs] = useState<PR[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const handleConfettiDone = useCallback(() => setShowConfetti(false), [])

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
    const logId = existingLog?.id ?? generateId()
    const log: WorkoutLog = {
      id: logId,
      programId: program.id,
      weekNumber: week,
      dayNumber: day,
      completedAt: new Date().toISOString(),
      completed: true,
      rpe,
    }

    if (existingLog) {
      dispatch({ type: 'UPDATE_LOG', payload: log })
    } else {
      dispatch({ type: 'LOG_WORKOUT', payload: log })
    }

    setCompleted(true)
    setShowCelebration(true)
    triggerHaptic('success')
    setTimeout(() => setShowCelebration(false), 2000)

    // Toast with undo action — 10s window with countdown bar (Improvement 4)
    addToast('Workout logged!', 'success', {
      duration: 10000,
      showCountdown: true,
      action: {
        label: 'Undo',
        onClick: () => {
          dispatch({ type: 'DELETE_LOG', payload: logId })
          setCompleted(false)
          triggerHaptic('tap')
        },
      },
    })

    if (settings.autoBackup) storage.triggerAutoBackup()
  }

  const handleSaveDetails = () => {
    const exercises: ExerciseLog[] = []
    for (const mov of allMovements) {
      const numSets = mov.sets ?? 1
      const isPerSet = perSetMode.has(mov.id)

      if (isPerSet) {
        // Per-set mode: use individual weights per set (Improvement 12)
        const setWeights = perSetData.get(mov.id)
        if (setWeights && setWeights.some((w) => w !== undefined)) {
          const sets: SetLog[] = []
          for (let i = 0; i < numSets; i++) {
            const w = setWeights[i]
            if (w !== undefined) {
              sets.push({
                weight: w,
                reps: typeof mov.reps === 'number' ? mov.reps : undefined,
                completed: true,
              })
            }
          }
          if (sets.length > 0) {
            exercises.push({ movementId: mov.id, movementName: mov.name, sets })
          }
        }
      } else {
        // Same-weight mode: use single weight for all sets
        const weight = exerciseData.get(mov.id)
        if (weight !== undefined) {
          const sets: SetLog[] = []
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
    }

    let wodResult: WodResult | undefined
    if (wodScoring && wodScore) {
      wodResult = {
        type: wodScoring.type,
        score: wodScore,
        ...wodStructured,
      }
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
      rpe,
    }

    if (existingLog) {
      dispatch({ type: 'UPDATE_LOG', payload: log })
    } else {
      dispatch({ type: 'LOG_WORKOUT', payload: log })
    }

    // Detect new PRs by comparing each exercise against history
    const detectedPRs: PR[] = []
    for (const ex of exercises) {
      const maxWeight = Math.max(...ex.sets.filter((s) => s.weight).map((s) => s.weight ?? 0), 0)
      const maxReps = Math.max(...ex.sets.filter((s) => s.reps).map((s) => s.reps ?? 0), 0)
      if (maxWeight > 0) {
        const pr = detectNewPRs(ex.movementName, maxWeight, maxReps, logs, settings.weightUnit)
        if (pr) detectedPRs.push(pr)
      }
    }
    setNewPRs(detectedPRs)
    setCompleted(true)

    if (detectedPRs.length > 0) {
      triggerHaptic('celebration')
      setShowConfetti(true)
    } else {
      triggerHaptic('success')
    }

    addToast(
      detectedPRs.length > 0
        ? `Saved! ${detectedPRs.length} new PR${detectedPRs.length > 1 ? 's' : ''}! 🔥`
        : 'Details saved!',
      detectedPRs.length > 0 ? 'success' : 'info',
    )

    if (settings.autoBackup) storage.triggerAutoBackup()
  }

  const updateWeight = (movId: string, value: number | undefined) => {
    setExerciseData((prev) => {
      const next = new Map(prev)
      next.set(movId, value)
      return next
    })
  }

  const togglePerSetMode = (movId: string, numSets: number) => {
    setPerSetMode((prev) => {
      const next = new Set(prev)
      if (next.has(movId)) {
        next.delete(movId)
      } else {
        next.add(movId)
        // Initialize per-set data from single weight if available
        if (!perSetData.has(movId)) {
          const singleWeight = exerciseData.get(movId)
          setPerSetData((pd) => {
            const nextPd = new Map(pd)
            nextPd.set(movId, Array(numSets).fill(singleWeight))
            return nextPd
          })
        }
      }
      return next
    })
  }

  const updatePerSetWeight = (movId: string, setIdx: number, value: number | undefined) => {
    setPerSetData((prev) => {
      const next = new Map(prev)
      const arr = [...(next.get(movId) ?? [])]
      arr[setIdx] = value
      next.set(movId, arr)
      return next
    })
  }

  const step = WEIGHT_INCREMENTS[settings.weightUnit]

  return (
    <div className="animate-fade-in">
      {/* Confetti overlay on PR */}
      {showConfetti && <Confetti onDone={handleConfettiDone} />}

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

        {/* PR Celebration */}
        {newPRs.length > 0 && (
          <Card padding="lg" className="animate-scale-in border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="text-center space-y-2">
              <div className="text-3xl">🔥</div>
              <p className="font-display font-bold text-amber-700 dark:text-amber-400">
                {newPRs.length === 1 ? 'New Personal Record!' : `${newPRs.length} New PRs!`}
              </p>
              <div className="space-y-1">
                {newPRs.map((pr) => (
                  <p key={pr.movementName} className="text-sm font-medium text-amber-600 dark:text-amber-300">
                    {pr.movementName}: {pr.value} {pr.unit}
                  </p>
                ))}
              </div>
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
              {/* Quick Re-Log (Improvement 13) */}
              {previousWeights.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    for (const mov of allMovements) {
                      const prev = previousWeights.get(mov.id)
                      if (prev !== undefined) {
                        updateWeight(mov.id, prev)
                      }
                    }
                    addToast('Last weights loaded', 'info')
                  }}
                  className="
                    w-full py-2 px-3 rounded-xl text-xs font-semibold
                    bg-accent/5 text-accent border border-accent/20
                    dark:bg-accent/10 dark:text-accent-light dark:border-accent/30
                    hover:bg-accent/10 dark:hover:bg-accent/20
                    transition-colors
                  "
                >
                  ↻ Use Last Weights
                </button>
              )}
              {allMovements.map((mov: Movement) => {
                const numSets = mov.sets ?? 1
                const isPerSet = perSetMode.has(mov.id)

                return (
                  <div key={mov.id}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {mov.name}
                      </label>
                      {numSets > 1 && (
                        <button
                          type="button"
                          onClick={() => togglePerSetMode(mov.id, numSets)}
                          className={`
                            text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors
                            ${isPerSet
                              ? 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light'
                              : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                            }
                          `}
                        >
                          {isPerSet ? 'Per Set ✓' : 'Per Set'}
                        </button>
                      )}
                    </div>
                    {isPerSet ? (
                      <div className="space-y-1.5">
                        {Array.from({ length: numSets }, (_, i) => (
                          <NumberInput
                            key={`${mov.id}-set-${i}`}
                            label={`Set ${i + 1}`}
                            value={perSetData.get(mov.id)?.[i]}
                            onChange={(v) => updatePerSetWeight(mov.id, i, v)}
                            placeholder={previousWeights.has(mov.id) ? String(previousWeights.get(mov.id)) : undefined}
                            step={step}
                            unit={settings.weightUnit}
                          />
                        ))}
                      </div>
                    ) : (
                      <NumberInput
                        value={exerciseData.get(mov.id)}
                        onChange={(v) => updateWeight(mov.id, v)}
                        placeholder={previousWeights.has(mov.id) ? String(previousWeights.get(mov.id)) : undefined}
                        step={step}
                        unit={settings.weightUnit}
                      />
                    )}
                  </div>
                )
              })}
              {/* Rest timer for between sets */}
              <RestTimer />
            </div>
          </Accordion>
        )}

        {/* Quick Notes — always visible */}
        <Card padding="md" className="animate-slide-up delay-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quick notes — how did it feel?"
            rows={2}
            className="
              w-full px-3 py-2 rounded-xl text-sm resize-none
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />
        </Card>

        {/* RPE Rating */}
        <Card padding="md" className="animate-slide-up delay-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            How did it feel?
          </p>
          <div className="flex items-center justify-between gap-1">
            {[1, 2, 3, 4, 5].map((level) => {
              const info = RPE_LABELS[level]
              const isSelected = rpe === level
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRpe(isSelected ? undefined : level)}
                  className={`
                    flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-150
                    ${isSelected
                      ? 'bg-accent/10 dark:bg-accent/20 ring-2 ring-accent dark:ring-accent-dark scale-105'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }
                  `}
                >
                  <span className="text-xl">{info.emoji}</span>
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-accent dark:text-accent-light' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {info.label}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Level 2: Structured WOD Score (Improvement 2) */}
        {wodScoring && (
          <Accordion
            title="WOD Score"
            badge={wodScore ? <Badge variant="accent">{wodScore}</Badge> : <Badge variant="muted">Optional</Badge>}
            className="animate-slide-up delay-2"
          >
            <div className="space-y-3 pb-3">
              <WodScoreInput
                wodType={wodScoring.type}
                value={wodScore}
                onChange={(score, structured) => {
                  setWodScore(score)
                  setWodStructured(structured)
                }}
              />
            </div>
          </Accordion>
        )}

        {/* Save Details button */}
        <Button variant="secondary" fullWidth onClick={handleSaveDetails} className="animate-slide-up delay-3">
          Save Details
        </Button>

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
