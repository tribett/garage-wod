import { createContext, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { WorkoutLog } from '@/types/workout-log'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type WorkoutLogAction =
  | { type: 'LOG_WORKOUT'; payload: WorkoutLog }
  | { type: 'UPDATE_LOG'; payload: WorkoutLog }
  | { type: 'DELETE_LOG'; payload: string }
  | { type: 'RESET_ALL' }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function workoutLogReducer(
  state: WorkoutLog[],
  action: WorkoutLogAction,
): WorkoutLog[] {
  switch (action.type) {
    case 'LOG_WORKOUT':
      return [...state, action.payload]

    case 'UPDATE_LOG':
      return state.map((log) =>
        log.id === action.payload.id ? action.payload : log,
      )

    case 'DELETE_LOG':
      return state.filter((log) => log.id !== action.payload)

    case 'RESET_ALL':
      return []

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WorkoutLogValueContext = createContext<WorkoutLog[] | null>(null)
const WorkoutLogDispatchContext = createContext<React.Dispatch<WorkoutLogAction> | null>(null)

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useWorkoutLogs(): WorkoutLog[] {
  const ctx = useContext(WorkoutLogValueContext)
  if (ctx === null) {
    throw new Error('useWorkoutLogs must be used within a WorkoutLogProvider')
  }
  return ctx
}

export function useWorkoutLogDispatch(): React.Dispatch<WorkoutLogAction> {
  const ctx = useContext(WorkoutLogDispatchContext)
  if (ctx === null) {
    throw new Error(
      'useWorkoutLogDispatch must be used within a WorkoutLogProvider',
    )
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WorkoutLogProvider({ children }: { children: ReactNode }) {
  const [logs, dispatch] = useReducer(
    workoutLogReducer,
    undefined,
    () => storage.load<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []),
  )

  // Persist to localStorage whenever logs change
  useEffect(() => {
    storage.save(STORAGE_KEYS.WORKOUT_LOGS, logs)
  }, [logs])

  return (
    <WorkoutLogValueContext value={logs}>
      <WorkoutLogDispatchContext value={dispatch}>
        {children}
      </WorkoutLogDispatchContext>
    </WorkoutLogValueContext>
  )
}
