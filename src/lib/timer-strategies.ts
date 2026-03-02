import type { TimerConfig } from '@/types/timer'

export interface TimerDisplay {
  displayTime: number
  currentRound: number
  totalRounds: number
  intervalRemaining: number
  isWorkInterval: boolean
  isComplete: boolean
}

export interface TimerStrategy {
  computeDisplay(elapsed: number, config: TimerConfig): TimerDisplay
  getBeepPoints(config: TimerConfig): number[]
}

const amrapStrategy: TimerStrategy = {
  computeDisplay(elapsed, config) {
    const remaining = Math.max(0, config.totalDuration - elapsed)
    return {
      displayTime: remaining,
      currentRound: 0,
      totalRounds: 0,
      intervalRemaining: remaining,
      isWorkInterval: true,
      isComplete: remaining <= 0,
    }
  },
  getBeepPoints(config) {
    // Beep at 3, 2, 1 seconds remaining + final
    const d = config.totalDuration
    return [d - 3000, d - 2000, d - 1000, d]
  },
}

const emomStrategy: TimerStrategy = {
  computeDisplay(elapsed, config) {
    const interval = config.intervalDuration ?? 60000
    const totalRounds = config.rounds ?? Math.floor(config.totalDuration / interval)
    const remaining = Math.max(0, config.totalDuration - elapsed)
    const currentRound = Math.min(Math.floor(elapsed / interval) + 1, totalRounds)
    const elapsedInInterval = elapsed % interval
    const intervalRemaining = Math.max(0, interval - elapsedInInterval)

    return {
      displayTime: remaining,
      currentRound,
      totalRounds,
      intervalRemaining,
      isWorkInterval: true,
      isComplete: remaining <= 0,
    }
  },
  getBeepPoints(config) {
    const interval = config.intervalDuration ?? 60000
    const totalRounds = config.rounds ?? Math.floor(config.totalDuration / interval)
    const points: number[] = []
    // Beep at the start of each new interval
    for (let i = 1; i < totalRounds; i++) {
      points.push(i * interval)
    }
    // 3-2-1 countdown before each interval switch
    for (let i = 1; i <= totalRounds; i++) {
      const switchPoint = i * interval
      points.push(switchPoint - 3000, switchPoint - 2000, switchPoint - 1000)
    }
    // Final beep
    points.push(config.totalDuration)
    return [...new Set(points)].filter((p) => p > 0 && p <= config.totalDuration).sort((a, b) => a - b)
  },
}

const forTimeStrategy: TimerStrategy = {
  computeDisplay(elapsed, config) {
    const remaining = Math.max(0, config.totalDuration - elapsed)
    return {
      displayTime: elapsed,
      currentRound: 0,
      totalRounds: 0,
      intervalRemaining: remaining,
      isWorkInterval: true,
      isComplete: remaining <= 0,
    }
  },
  getBeepPoints(config) {
    // Only beep at time cap
    return [config.totalDuration]
  },
}

const tabataStrategy: TimerStrategy = {
  computeDisplay(elapsed, config) {
    const work = config.intervalDuration ?? 20000
    const rest = config.restDuration ?? 10000
    const cycleLength = work + rest
    const totalRounds = config.rounds ?? 8
    const totalDuration = totalRounds * cycleLength

    const remaining = Math.max(0, totalDuration - elapsed)
    const currentCycle = Math.floor(elapsed / cycleLength)
    const currentRound = Math.min(currentCycle + 1, totalRounds)
    const elapsedInCycle = elapsed % cycleLength
    const isWorkInterval = elapsedInCycle < work
    const intervalRemaining = isWorkInterval
      ? Math.max(0, work - elapsedInCycle)
      : Math.max(0, cycleLength - elapsedInCycle)

    return {
      displayTime: remaining,
      currentRound,
      totalRounds,
      intervalRemaining,
      isWorkInterval,
      isComplete: remaining <= 0,
    }
  },
  getBeepPoints(config) {
    const work = config.intervalDuration ?? 20000
    const rest = config.restDuration ?? 10000
    const cycleLength = work + rest
    const totalRounds = config.rounds ?? 8
    const points: number[] = []

    for (let i = 0; i < totalRounds; i++) {
      const cycleStart = i * cycleLength
      // Work start
      points.push(cycleStart)
      // Rest start (work end)
      points.push(cycleStart + work)
      // 3-2-1 before transitions
      points.push(cycleStart + work - 3000, cycleStart + work - 2000, cycleStart + work - 1000)
      points.push(cycleStart + cycleLength - 3000, cycleStart + cycleLength - 2000, cycleStart + cycleLength - 1000)
    }
    // Final
    points.push(totalRounds * cycleLength)

    return [...new Set(points)].filter((p) => p > 0).sort((a, b) => a - b)
  },
}

const roundsStrategy: TimerStrategy = {
  computeDisplay(elapsed, config) {
    // Rounds mode counts up with no time cap — user marks complete manually
    // If totalDuration is set, use it as a reference time
    const remaining = config.totalDuration > 0 ? Math.max(0, config.totalDuration - elapsed) : 0
    return {
      displayTime: elapsed,
      currentRound: 0,
      totalRounds: config.rounds ?? 0,
      intervalRemaining: remaining,
      isWorkInterval: true,
      isComplete: config.totalDuration > 0 && remaining <= 0,
    }
  },
  getBeepPoints(config) {
    if (config.totalDuration > 0) {
      return [config.totalDuration]
    }
    return []
  },
}

const restStrategy: TimerStrategy = {
  computeDisplay(elapsed, config) {
    const remaining = Math.max(0, config.totalDuration - elapsed)
    return {
      displayTime: remaining,
      currentRound: 0,
      totalRounds: 0,
      intervalRemaining: remaining,
      isWorkInterval: false,
      isComplete: remaining <= 0,
    }
  },
  getBeepPoints(config) {
    return [config.totalDuration - 3000, config.totalDuration - 2000, config.totalDuration - 1000, config.totalDuration]
      .filter((p) => p > 0)
  },
}

const strategies: Record<string, TimerStrategy> = {
  amrap: amrapStrategy,
  emom: emomStrategy,
  forTime: forTimeStrategy,
  tabata: tabataStrategy,
  rounds: roundsStrategy,
  rest: restStrategy,
}

export function getStrategy(mode: string): TimerStrategy {
  return strategies[mode] ?? amrapStrategy
}
