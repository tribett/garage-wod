import { useState, useEffect, useCallback, useRef } from 'react'
import { REST_PRESETS, formatRestTime } from '@/lib/rest-timer'
import type { RestPreset } from '@/lib/rest-timer'

/**
 * RestTimer — compact countdown timer for rest periods between sets.
 *
 * Flow:
 * 1. User taps a preset (0:30, 1:00, etc.) to start a countdown.
 * 2. Timer counts down; a ring progress arc shows remaining time.
 * 3. When done, a short visual pulse indicates "go!".
 * 4. Tapping the running timer cancels it.
 */
export function RestTimer() {
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(
    (preset: RestPreset) => {
      clearTimer()
      setRemaining(preset.seconds)
      setTotal(preset.seconds)
      setIsRunning(true)
      setIsDone(false)
    },
    [clearTimer],
  )

  const cancelTimer = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setRemaining(0)
    setTotal(0)
    setIsDone(false)
  }, [clearTimer])

  // Tick effect
  useEffect(() => {
    if (!isRunning || remaining <= 0) return

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          setIsDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isRunning, remaining > 0, clearTimer]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss "done" state after 3s
  useEffect(() => {
    if (!isDone) return
    const id = setTimeout(() => setIsDone(false), 3000)
    return () => clearTimeout(id)
  }, [isDone])

  // SVG ring progress
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? remaining / total : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="space-y-3" data-testid="rest-timer">
      {/* Preset buttons — shown when not running */}
      {!isRunning && !isDone && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0">
            Rest
          </span>
          <div className="flex gap-2 flex-1 justify-end">
            {REST_PRESETS.map((preset) => (
              <button
                key={preset.seconds}
                onClick={() => startTimer(preset)}
                className="
                  h-8 px-3 rounded-lg text-xs font-semibold
                  bg-zinc-100 text-zinc-600 hover:bg-zinc-200
                  dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700
                  transition-colors
                "
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active countdown */}
      {isRunning && (
        <button
          onClick={cancelTimer}
          className="
            w-full flex items-center justify-center gap-3 py-3 rounded-xl
            bg-accent/5 dark:bg-accent/10 border border-accent/20
            transition-colors hover:bg-accent/10 dark:hover:bg-accent/20
          "
          aria-label="Cancel rest timer"
        >
          {/* Ring */}
          <svg width="64" height="64" className="shrink-0 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-zinc-200 dark:text-zinc-700"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="text-accent dark:text-accent-light transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="text-left">
            <div className="font-display font-extrabold text-2xl tabular-nums text-accent dark:text-accent-light">
              {formatRestTime(remaining)}
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Tap to cancel</p>
          </div>
        </button>
      )}

      {/* Done flash */}
      {isDone && (
        <div className="w-full flex items-center justify-center py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 animate-scale-in">
          <span className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Go!
          </span>
        </div>
      )}
    </div>
  )
}
