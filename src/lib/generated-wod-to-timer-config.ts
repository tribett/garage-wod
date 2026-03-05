import type { TimerConfig } from '@/types/timer'
import type { GeneratedWod } from './wod-generator'

interface TimerNavState {
  config: TimerConfig
  wodName: string
  movements: string[]
}

/**
 * Converts a generated WOD into timer configuration + navigation state
 * so the timer can auto-start with the right mode and duration.
 */
export function generatedWodToTimerConfig(wod: GeneratedWod): TimerNavState {
  const movements = wod.movements.map((m) => `${m.reps} ${m.name}`)
  const wodName = wod.name

  let config: TimerConfig

  switch (wod.type) {
    case 'amrap':
      config = {
        mode: 'amrap',
        totalDuration: (wod.duration ?? 10) * 60000,
      }
      break

    case 'emom': {
      const durationMin = wod.duration ?? 10
      config = {
        mode: 'emom',
        totalDuration: durationMin * 60000,
        intervalDuration: 60000,
        rounds: durationMin,
      }
      break
    }

    case 'forTime':
      config = {
        mode: 'forTime',
        totalDuration: 20 * 60000,
      }
      break

    default:
      config = {
        mode: 'amrap',
        totalDuration: 10 * 60000,
      }
  }

  return { config, wodName, movements }
}

/**
 * Builds the navigation state for the WOD logging page after timer completion.
 * Passes through the generatedWod so the form can auto-fill.
 */
export function buildWodLogNavState(params: {
  timerScore: string
  timerMode: string
  timerElapsed: number
  timerRounds?: number
  timerExtraReps?: number
  generatedWod?: GeneratedWod
}) {
  return {
    timerScore: params.timerScore,
    timerMode: params.timerMode,
    timerElapsed: params.timerElapsed,
    timerRounds: params.timerRounds,
    timerExtraReps: params.timerExtraReps,
    generatedWod: params.generatedWod,
  }
}
