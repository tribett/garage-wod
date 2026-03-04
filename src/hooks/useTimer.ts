import { useReducer, useRef, useCallback, useEffect } from 'react'
import type { TimerConfig, TimerState } from '@/types/timer'
import { getStrategy } from '@/lib/timer-strategies'

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'COMPLETE' }
  | { type: 'TICK'; elapsed: number; round: number; totalRounds: number; intervalRemaining: number; isWork: boolean }

function createInitialState(config: TimerConfig): TimerState {
  return {
    mode: config.mode,
    status: 'idle',
    elapsed: 0,
    totalDuration: config.totalDuration,
    currentRound: 1,
    totalRounds: config.rounds ?? 0,
    intervalRemaining: config.totalDuration,
    intervalDuration: config.intervalDuration ?? config.totalDuration,
    isWorkInterval: true,
  }
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'running' }
    case 'PAUSE':
      return { ...state, status: 'paused' }
    case 'RESUME':
      return { ...state, status: 'running' }
    case 'RESET':
      return {
        ...state,
        status: 'idle',
        elapsed: 0,
        currentRound: 1,
        intervalRemaining: state.totalDuration,
        isWorkInterval: true,
      }
    case 'COMPLETE':
      return { ...state, status: 'complete' }
    case 'TICK':
      return {
        ...state,
        elapsed: action.elapsed,
        currentRound: action.round,
        totalRounds: action.totalRounds,
        intervalRemaining: action.intervalRemaining,
        isWorkInterval: action.isWork,
      }
    default:
      return state
  }
}

interface UseTimerReturn {
  state: TimerState
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  markComplete: () => void
}

export function useTimer(
  config: TimerConfig,
  onBeep?: () => void,
  onLongBeep?: () => void,
  onComplete?: () => void,
): UseTimerReturn {
  const [state, dispatch] = useReducer(timerReducer, config, createInitialState)

  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const pausedElapsedRef = useRef<number>(0)
  const firedBeepsRef = useRef<Set<number>>(new Set())

  const strategy = getStrategy(config.mode)
  const beepPoints = useRef(strategy.getBeepPoints(config))

  // Update beep points when config changes
  useEffect(() => {
    beepPoints.current = strategy.getBeepPoints(config)
  }, [config, strategy])

  const tick = useCallback(() => {
    const now = performance.now()
    const elapsed = pausedElapsedRef.current + (now - startTimeRef.current)

    const display = strategy.computeDisplay(elapsed, config)

    // Check for beeps
    for (const bp of beepPoints.current) {
      if (!firedBeepsRef.current.has(bp) && elapsed >= bp) {
        firedBeepsRef.current.add(bp)
        if (bp === config.totalDuration) {
          onLongBeep?.()
        } else {
          onBeep?.()
        }
      }
    }

    dispatch({
      type: 'TICK',
      elapsed,
      round: display.currentRound,
      totalRounds: display.totalRounds,
      intervalRemaining: display.intervalRemaining,
      isWork: display.isWorkInterval,
    })

    if (display.isComplete) {
      dispatch({ type: 'COMPLETE' })
      onComplete?.()
    } else {
      rafRef.current = requestAnimationFrame(tick) // eslint-disable-line react-hooks/immutability
    }
  }, [config, strategy, onBeep, onLongBeep, onComplete])

  const start = useCallback(() => {
    startTimeRef.current = performance.now()
    pausedElapsedRef.current = 0
    firedBeepsRef.current.clear()
    dispatch({ type: 'START' })
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    pausedElapsedRef.current += performance.now() - startTimeRef.current
    dispatch({ type: 'PAUSE' })
  }, [])

  const resume = useCallback(() => {
    startTimeRef.current = performance.now()
    dispatch({ type: 'RESUME' })
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    pausedElapsedRef.current = 0
    firedBeepsRef.current.clear()
    dispatch({ type: 'RESET' })
  }, [])

  const markComplete = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    dispatch({ type: 'COMPLETE' })
    onLongBeep?.()
    onComplete?.()
  }, [onLongBeep, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return { state, start, pause, resume, reset, markComplete }
}
