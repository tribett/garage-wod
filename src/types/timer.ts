export type TimerMode = 'amrap' | 'emom' | 'forTime' | 'tabata' | 'rounds' | 'rest'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  elapsed: number
  totalDuration: number
  currentRound: number
  totalRounds: number
  intervalRemaining: number
  intervalDuration: number
  isWorkInterval: boolean
}

export interface TimerConfig {
  mode: TimerMode
  totalDuration: number
  rounds?: number
  intervalDuration?: number
  restDuration?: number
}
