/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { Day, Phase, Program, Week } from '@/types/program'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { returnToCrossfitProgram } from '@/data/return-to-crossfit'

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

interface ProgramPosition {
  week: number
  day: number
}

interface ProgramState {
  program: Program | null
  position: ProgramPosition
  customPrograms: Program[]
}

type ProgramAction =
  | { type: 'SET_POSITION'; payload: ProgramPosition }
  | { type: 'ADVANCE_DAY' }
  | { type: 'LOAD_PROGRAM'; payload: Program }
  | { type: 'RESET_POSITION' }
  | { type: 'RELOAD_FROM_STORAGE' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTotalWeeks(program: Program | null): number {
  if (!program) return 0
  return program.phases.reduce((sum, phase) => sum + phase.weeks.length, 0)
}

function findPhase(program: Program | null, weekNumber: number): Phase | null {
  if (!program) return null
  return (
    program.phases.find(
      (phase) => weekNumber >= phase.weekStart && weekNumber <= phase.weekEnd,
    ) ?? null
  )
}

function findWeek(program: Program | null, weekNumber: number): Week | null {
  if (!program) return null
  for (const phase of program.phases) {
    const week = phase.weeks.find((w) => w.weekNumber === weekNumber)
    if (week) return week
  }
  return null
}

function findDay(
  program: Program | null,
  weekNumber: number,
  dayNumber: number,
): Day | null {
  const week = findWeek(program, weekNumber)
  if (!week) return null
  return week.days.find((d) => d.dayNumber === dayNumber) ?? null
}

function computeNextPosition(
  program: Program | null,
  current: ProgramPosition,
): ProgramPosition {
  if (!program) return current

  const currentWeek = findWeek(program, current.week)
  if (!currentWeek) return current

  // Try to advance within the same week
  const nextDayInWeek = currentWeek.days.find(
    (d) => d.dayNumber > current.day,
  )
  if (nextDayInWeek) {
    return { week: current.week, day: nextDayInWeek.dayNumber }
  }

  // Try to advance to the next week
  const totalWeeks = getTotalWeeks(program)
  if (current.week < totalWeeks) {
    const nextWeek = findWeek(program, current.week + 1)
    const firstDay = nextWeek?.days[0]
    if (firstDay) {
      return { week: current.week + 1, day: firstDay.dayNumber }
    }
  }

  // Already at the end of the program — stay put
  return current
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function programReducer(state: ProgramState, action: ProgramAction): ProgramState {
  switch (action.type) {
    case 'SET_POSITION':
      return { ...state, position: action.payload }

    case 'ADVANCE_DAY':
      return {
        ...state,
        position: computeNextPosition(state.program, state.position),
      }

    case 'LOAD_PROGRAM': {
      const updated = state.customPrograms.some((p) => p.id === action.payload.id)
        ? state.customPrograms.map((p) =>
            p.id === action.payload.id ? action.payload : p,
          )
        : [...state.customPrograms, action.payload]

      return {
        program: action.payload,
        position: { week: 1, day: 1 },
        customPrograms: updated,
      }
    }

    case 'RESET_POSITION':
      return { ...state, position: { week: 1, day: 1 } }

    case 'RELOAD_FROM_STORAGE':
      return initProgramState()

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ProgramContextValue {
  program: Program | null
  position: ProgramPosition
  currentPhase: Phase | null
  currentWeek: Week | null
  currentDay: Day | null
  totalWeeks: number
}

const ProgramValueContext = createContext<ProgramContextValue | null>(null)
const ProgramDispatchContext = createContext<React.Dispatch<ProgramAction> | null>(null)

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useProgram(): ProgramContextValue {
  const ctx = useContext(ProgramValueContext)
  if (ctx === null) {
    throw new Error('useProgram must be used within a ProgramProvider')
  }
  return ctx
}

export function useProgramDispatch(): React.Dispatch<ProgramAction> {
  const ctx = useContext(ProgramDispatchContext)
  if (ctx === null) {
    throw new Error('useProgramDispatch must be used within a ProgramProvider')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Initializer
// ---------------------------------------------------------------------------

function initProgramState(): ProgramState {
  const savedPosition = storage.load<ProgramPosition | null>(STORAGE_KEYS.PROGRAM, null)
  const customPrograms = storage.load<Program[]>(STORAGE_KEYS.CUSTOM_PROGRAMS, [])

  // Determine which program to load: prefer a custom program that was last active,
  // fall back to the default built-in program.
  let program: Program | null = null

  if (customPrograms.length > 0) {
    // If there are custom programs, use the first one (or the one matching saved state).
    // A more sophisticated approach could store the active program ID separately.
    program = customPrograms[0]
  } else {
    program = returnToCrossfitProgram
  }

  const position = savedPosition ?? { week: 1, day: 1 }

  return { program, position, customPrograms }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(programReducer, undefined, initProgramState)

  // Persist position whenever it changes
  useEffect(() => {
    storage.save(STORAGE_KEYS.PROGRAM, state.position)
  }, [state.position])

  // Persist custom programs whenever they change
  useEffect(() => {
    storage.save(STORAGE_KEYS.CUSTOM_PROGRAMS, state.customPrograms)
  }, [state.customPrograms])

  const value = useMemo<ProgramContextValue>(
    () => ({
      program: state.program,
      position: state.position,
      currentPhase: findPhase(state.program, state.position.week),
      currentWeek: findWeek(state.program, state.position.week),
      currentDay: findDay(state.program, state.position.week, state.position.day),
      totalWeeks: getTotalWeeks(state.program),
    }),
    [state.program, state.position],
  )

  return (
    <ProgramValueContext value={value}>
      <ProgramDispatchContext value={dispatch}>
        {children}
      </ProgramDispatchContext>
    </ProgramValueContext>
  )
}
