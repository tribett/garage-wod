import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTimer } from '@/hooks/useTimer'
import { useAudio } from '@/hooks/useAudio'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useSettings } from '@/contexts/SettingsContext'
import { formatMsPrecise } from '@/lib/date-utils'
import { formatTimerScore } from '@/lib/format-timer-score'
import { getMovementLabel } from '@/lib/emom-cycle'
import { incrementRound, decrementRound, setExtraReps, formatRoundCount } from '@/lib/round-counter'
import type { RoundCount } from '@/lib/round-counter'
import { saveTimerConfig, loadTimerConfig } from '@/lib/timer-config-storage'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NumberInput } from '@/components/ui/NumberInput'
import type { TimerConfig, TimerMode } from '@/types/timer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LocationState {
  config?: TimerConfig
  weekNumber?: number
  dayNumber?: number
  wodName?: string
  movements?: string[]
}

// ---------------------------------------------------------------------------
// Mode Setup Screen
// ---------------------------------------------------------------------------

const TIMER_MODES: { mode: TimerMode; label: string; description: string }[] = [
  { mode: 'amrap', label: 'AMRAP', description: 'As Many Rounds As Possible' },
  { mode: 'emom', label: 'EMOM', description: 'Every Minute On the Minute' },
  { mode: 'forTime', label: 'For Time', description: 'Complete workout ASAP' },
  { mode: 'tabata', label: 'Tabata', description: '20s work / 10s rest' },
]

function TimerSetup({ onStart }: { onStart: (config: TimerConfig) => void }) {
  // Load last-used config for pre-fill (Improvement 3)
  const saved = useMemo(() => loadTimerConfig(), [])

  const [selectedMode, setSelectedMode] = useState<TimerMode | null>(
    saved?.mode ? (saved.mode as TimerMode) : null,
  )
  const [minutes, setMinutes] = useState<number | undefined>(saved?.minutes ?? 10)
  const [intervalMinutes, setIntervalMinutes] = useState<number | undefined>(saved?.intervalMinutes ?? 1)
  const [rounds, setRounds] = useState<number | undefined>(saved?.rounds ?? 8)
  const [workSeconds, setWorkSeconds] = useState<number | undefined>(saved?.workSeconds ?? 20)
  const [restSeconds, setRestSeconds] = useState<number | undefined>(saved?.restSeconds ?? 10)

  const handleStart = () => {
    if (!selectedMode) return

    // Save config for next session (Improvement 3)
    saveTimerConfig({
      mode: selectedMode,
      minutes,
      intervalMinutes,
      rounds,
      workSeconds,
      restSeconds,
    })

    let config: TimerConfig

    switch (selectedMode) {
      case 'amrap':
        config = { mode: 'amrap', totalDuration: (minutes ?? 10) * 60000 }
        break
      case 'emom': {
        const intMs = (intervalMinutes ?? 1) * 60000
        const totalRounds = rounds ?? 10
        config = {
          mode: 'emom',
          totalDuration: totalRounds * intMs,
          intervalDuration: intMs,
          rounds: totalRounds,
        }
        break
      }
      case 'forTime':
        config = { mode: 'forTime', totalDuration: (minutes ?? 20) * 60000 }
        break
      case 'tabata': {
        const w = (workSeconds ?? 20) * 1000
        const r = (restSeconds ?? 10) * 1000
        const totalRnds = rounds ?? 8
        config = {
          mode: 'tabata',
          totalDuration: totalRnds * (w + r),
          rounds: totalRnds,
          intervalDuration: w,
          restDuration: r,
        }
        break
      }
      default:
        config = { mode: 'amrap', totalDuration: 600000 }
    }

    onStart(config)
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <BackButton />
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Set Up Timer
        </h2>
        <div className="w-10" /> {/* spacer */}
      </div>

      <div className="flex-1 px-5 pt-4 pb-8 overflow-y-auto">
        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {TIMER_MODES.map((tm) => (
            <button
              key={tm.mode}
              onClick={() => setSelectedMode(tm.mode)}
              className={`
                p-4 rounded-2xl border-2 text-left transition-all duration-150
                ${selectedMode === tm.mode
                  ? 'border-accent bg-accent/5 dark:border-accent-dark dark:bg-accent/10'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              <span className={`
                font-display font-extrabold text-lg block
                ${selectedMode === tm.mode
                  ? 'text-accent dark:text-accent-light'
                  : 'text-zinc-900 dark:text-zinc-50'
                }
              `}>
                {tm.label}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{tm.description}</span>
            </button>
          ))}
        </div>

        {/* Config fields */}
        {selectedMode && (
          <div className="space-y-4 animate-fade-in">
            {(selectedMode === 'amrap' || selectedMode === 'forTime') && (
              <NumberInput
                label="Duration"
                value={minutes}
                onChange={setMinutes}
                step={1}
                min={1}
                unit="min"
                placeholder="10"
              />
            )}

            {selectedMode === 'emom' && (
              <>
                <NumberInput
                  label="Interval"
                  value={intervalMinutes}
                  onChange={setIntervalMinutes}
                  step={1}
                  min={1}
                  unit="min"
                  placeholder="1"
                />
                <NumberInput
                  label="Rounds"
                  value={rounds}
                  onChange={setRounds}
                  step={1}
                  min={1}
                  placeholder="10"
                />
              </>
            )}

            {selectedMode === 'tabata' && (
              <>
                <NumberInput
                  label="Work"
                  value={workSeconds}
                  onChange={setWorkSeconds}
                  step={5}
                  min={5}
                  unit="sec"
                  placeholder="20"
                />
                <NumberInput
                  label="Rest"
                  value={restSeconds}
                  onChange={setRestSeconds}
                  step={5}
                  min={5}
                  unit="sec"
                  placeholder="10"
                />
                <NumberInput
                  label="Rounds"
                  value={rounds}
                  onChange={setRounds}
                  step={1}
                  min={1}
                  placeholder="8"
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Start button */}
      <div className="px-5 pb-6 pt-2">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          disabled={!selectedMode}
          onClick={handleStart}
        >
          Start Timer
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Back Button (shared)
// ---------------------------------------------------------------------------

function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Timer Display
// ---------------------------------------------------------------------------

function modeLabel(mode: TimerMode): string {
  switch (mode) {
    case 'amrap': return 'AMRAP'
    case 'emom': return 'EMOM'
    case 'forTime': return 'FOR TIME'
    case 'tabata': return 'TABATA'
    case 'rounds': return 'ROUNDS'
    case 'rest': return 'REST'
    default: return mode satisfies never
  }
}

function ActiveTimer({
  config,
  weekNumber,
  dayNumber,
  wodName,
  movements,
}: {
  config: TimerConfig
  weekNumber?: number
  dayNumber?: number
  wodName?: string
  movements?: string[]
}) {
  const [showMovements, setShowMovements] = useState(true)
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)
  const [roundCount, setRoundCount] = useState<RoundCount>({ rounds: 0, extraReps: 0 })
  const pendingNavRef = useRef<(() => void) | null>(null)
  const navigate = useNavigate()
  const settings = useSettings()
  const { preload, playBeep, playLongBeep, playCelebration } = useAudio()
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock()

  const onComplete = useCallback(() => {
    if (settings.soundEnabled) playCelebration()
    releaseWakeLock()
  }, [settings.soundEnabled, playCelebration, releaseWakeLock])

  const beep = useCallback(() => {
    if (settings.soundEnabled) playBeep()
  }, [settings.soundEnabled, playBeep])

  const longBeep = useCallback(() => {
    if (settings.soundEnabled) playLongBeep()
  }, [settings.soundEnabled, playLongBeep])

  const { state, start, pause, resume, reset, markComplete } = useTimer(
    config,
    beep,
    longBeep,
    onComplete,
  )

  // Preload audio on mount
  useEffect(() => {
    preload()
  }, [preload])

  // Manage wake lock
  useEffect(() => {
    if (state.status === 'running') {
      requestWakeLock()
    }
    return () => {
      releaseWakeLock()
    }
    // Only trigger on status changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  // Warn on browser close/refresh when timer active (Improvement 10)
  useEffect(() => {
    if (state.status !== 'running' && state.status !== 'paused') return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.status])

  // Determine what time to display
  const displayMs = useMemo(() => {
    // For countdown modes (amrap, emom, tabata, rest): show interval remaining
    // For count-up modes (forTime, rounds): show elapsed
    if (config.mode === 'forTime' || config.mode === 'rounds') {
      return state.elapsed
    }
    if (config.mode === 'emom' || config.mode === 'tabata') {
      return state.intervalRemaining
    }
    // amrap, rest
    return state.intervalRemaining
  }, [config.mode, state.elapsed, state.intervalRemaining])

  const { minutes, seconds, tenths } = formatMsPrecise(displayMs)

  // Determine if we're in the final 10 seconds
  const isUrgent =
    state.status === 'running' &&
    state.intervalRemaining > 0 &&
    state.intervalRemaining <= 10000

  // EMOM movement cycling label
  const emomMovementLabel = useMemo(() => {
    if (config.mode !== 'emom' || !movements || movements.length === 0) return ''
    const movementObjects = movements.map((name) => ({ name }))
    return getMovementLabel(movementObjects, state.currentRound, state.totalRounds)
  }, [config.mode, movements, state.currentRound, state.totalRounds])

  const handleNavigateAway = useCallback((navFn: () => void) => {
    if (state.status === 'running' || state.status === 'paused') {
      pendingNavRef.current = navFn
      setShowLeaveWarning(true)
    } else {
      navFn()
    }
  }, [state.status])

  const confirmLeave = useCallback(() => {
    setShowLeaveWarning(false)
    releaseWakeLock()
    pendingNavRef.current?.()
    pendingNavRef.current = null
  }, [releaseWakeLock])

  const cancelLeave = useCallback(() => {
    setShowLeaveWarning(false)
    pendingNavRef.current = null
  }, [])

  const handleReset = () => {
    reset()
  }

  const handleTimerAreaClick = () => {
    if (state.status === 'running') {
      pause()
    }
  }

  // Navigate home or to log
  const handleDone = () => {
    navigate('/')
  }

  const handleLogWorkout = () => {
    const timerScore = formatTimerScore(state.elapsed, config.mode)
    if (weekNumber && dayNumber) {
      // Pass timer result to LogPage for auto-fill (Improvement 1)
      navigate(`/log/${weekNumber}/${dayNumber}`, {
        state: {
          timerScore,
          timerMode: config.mode,
          timerElapsed: state.elapsed,
          timerRounds: roundCount.rounds,
          timerExtraReps: roundCount.extraReps,
        },
      })
    } else {
      // Navigate to WOD page with timer score pre-filled
      navigate('/wod', {
        state: {
          timerScore,
          timerMode: config.mode,
          timerElapsed: state.elapsed,
          timerRounds: roundCount.rounds,
          timerExtraReps: roundCount.extraReps,
        },
      })
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <button
          onClick={() => handleNavigateAway(() => navigate(-1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="font-display font-bold text-sm uppercase tracking-[0.15em] text-zinc-400">
          {modeLabel(state.mode)}
        </span>
        <button
          onClick={handleReset}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          aria-label="Reset timer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </div>

      {/* Movement list (collapsible) */}
      {movements && movements.length > 0 && (
        <div className="shrink-0 px-5">
          <button
            onClick={() => setShowMovements((v) => !v)}
            className="w-full flex items-center justify-between py-2 group"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {wodName || 'Workout'}
            </span>
            <svg
              className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${showMovements ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {showMovements && (
            <div className="pb-3 space-y-1 animate-fade-in max-h-40 overflow-y-auto">
              {movements.map((line, i) => (
                <p key={i} className="text-sm text-zinc-400 leading-snug">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AMRAP round counter */}
      {config.mode === 'amrap' && state.status !== 'idle' && (
        <div className="shrink-0 px-5 pb-3">
          {/* Round display + label */}
          <div className="text-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rounds
            </span>
            <div className="font-display font-extrabold text-4xl tabular-nums text-white">
              {formatRoundCount(roundCount)}
            </div>
          </div>

          {/* Big + button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setRoundCount((prev) => incrementRound(prev))
            }}
            className="
              w-full min-h-16 rounded-2xl flex items-center justify-center
              text-2xl font-bold
              bg-accent text-white
              active:scale-95 transition-transform duration-100 select-none
            "
            aria-label="Add round"
          >
            + Round
          </button>

          {/* Small row: decrement + extra reps */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setRoundCount((prev) => decrementRound(prev))
              }}
              className="
                w-12 h-10 rounded-xl flex items-center justify-center text-lg font-bold
                bg-zinc-800 text-zinc-400 hover:bg-zinc-700
                active:scale-95 transition-all duration-100 select-none
              "
              aria-label="Remove round"
            >
              −
            </button>
            <div className="flex-1" onClick={(e) => e.stopPropagation()}>
              <NumberInput
                label="Extra Reps"
                value={roundCount.extraReps || undefined}
                onChange={(v) => setRoundCount((prev) => setExtraReps(prev, v ?? 0))}
                step={1}
                min={0}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Timer display area — tappable when running */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 relative"
        onClick={handleTimerAreaClick}
        role={state.status === 'running' ? 'button' : undefined}
        aria-label={state.status === 'running' ? 'Tap to pause' : undefined}
      >
        {state.status === 'complete' ? (
          /* Complete state */
          <div className="text-center animate-scale-in">
            <div className="font-display font-extrabold text-7xl sm:text-8xl tracking-tighter text-emerald-400">
              DONE
            </div>
            <p className="text-zinc-500 mt-2 text-sm">
              {config.mode === 'forTime' || config.mode === 'rounds'
                ? `${minutes}:${seconds}`
                : 'Time!'
              }
            </p>
          </div>
        ) : (
          /* Active / idle / paused timer */
          <>
            {/* Pause icon overlay */}
            {state.status === 'running' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </div>
              </div>
            )}

            {/* EMOM movement cycling indicator */}
            {emomMovementLabel && state.status !== 'idle' && (
              <div className="mb-4 px-5 py-2.5 rounded-2xl bg-accent/10 dark:bg-accent/15 text-center animate-fade-in">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-accent dark:text-accent-light tracking-wide">
                  {emomMovementLabel}
                </span>
              </div>
            )}

            {/* Big numbers */}
            <div
              className={`
                text-center transition-colors duration-200
                ${state.status === 'paused' ? 'text-zinc-400' : ''}
                ${isUrgent ? 'animate-timer-urgent' : ''}
              `}
            >
              <div className="font-display font-extrabold text-[5.5rem] sm:text-[7rem] leading-none tracking-tighter tabular-nums">
                {minutes}:{seconds}
              </div>
              <div className="font-display font-bold text-2xl sm:text-3xl text-zinc-500 -mt-1 tabular-nums">
                .{tenths}
              </div>
            </div>

            {/* Tabata work/rest indicator */}
            {config.mode === 'tabata' && state.status === 'running' && (
              <div className="mt-6 animate-fade-in">
                <span
                  className={`
                    font-display font-extrabold text-3xl uppercase tracking-wider
                    ${state.isWorkInterval ? 'text-emerald-400' : 'text-amber-400'}
                  `}
                >
                  {state.isWorkInterval ? 'WORK' : 'REST'}
                </span>
              </div>
            )}

            {/* For Time: mark complete button */}
            {(config.mode === 'forTime' || config.mode === 'rounds') && state.status === 'running' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  markComplete()
                }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-display font-bold text-sm uppercase tracking-wider hover:bg-emerald-500/30 transition-colors"
              >
                Mark Complete
              </button>
            )}
          </>
        )}
      </div>

      {/* Round indicator */}
      {state.totalRounds > 0 && state.status !== 'complete' && (
        <div className="text-center pb-2 shrink-0">
          <span className="font-display font-bold text-sm text-zinc-500">
            Round {state.currentRound}
            <span className="text-zinc-600"> / </span>
            {state.totalRounds}
          </span>
          {/* Dot indicators for small round counts */}
          {state.totalRounds <= 12 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {Array.from({ length: state.totalRounds }, (_, i) => (
                <div
                  key={i}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-200
                    ${i < state.currentRound
                      ? 'bg-accent dark:bg-accent-light scale-110'
                      : 'bg-zinc-700'
                    }
                  `}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="px-5 pb-8 pt-4 shrink-0">
        {state.status === 'idle' && (
          <Button variant="primary" size="xl" fullWidth onClick={start}>
            START
          </Button>
        )}

        {state.status === 'paused' && (
          <div className="flex gap-3">
            <Button variant="ghost" size="xl" fullWidth onClick={handleReset} className="text-zinc-400 border border-zinc-800">
              Reset
            </Button>
            <Button variant="primary" size="xl" fullWidth onClick={resume}>
              Resume
            </Button>
          </div>
        )}

        {state.status === 'running' && (
          <p className="text-center text-xs text-zinc-600 py-3">
            Tap timer to pause
          </p>
        )}

        {state.status === 'complete' && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="xl"
              fullWidth
              onClick={handleDone}
              className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            >
              Done
            </Button>
            <Button variant="primary" size="xl" fullWidth onClick={handleLogWorkout}>
              Log Workout
            </Button>
          </div>
        )}
      </div>

      {/* Navigation warning when timer is active (Improvement 10) */}
      <Modal open={showLeaveWarning} onClose={cancelLeave} title="Timer Running">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Your timer is still {state.status === 'paused' ? 'paused' : 'running'}. Leaving will lose your progress.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={cancelLeave}>
            Stay
          </Button>
          <Button variant="primary" fullWidth onClick={confirmLeave} className="bg-red-600 hover:bg-red-700">
            Leave
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page (entry point)
// ---------------------------------------------------------------------------

export function TimerPage() {
  const location = useLocation()
  const locationState = location.state as LocationState | null

  const [config, setConfig] = useState<TimerConfig | null>(
    locationState?.config ?? null,
  )

  if (!config) {
    return <TimerSetup onStart={setConfig} />
  }

  return (
    <ActiveTimer
      config={config}
      weekNumber={locationState?.weekNumber}
      dayNumber={locationState?.dayNumber}
      wodName={locationState?.wodName}
      movements={locationState?.movements}
    />
  )
}
