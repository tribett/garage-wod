export interface PartnerState {
  activePartner: 'A' | 'B'
  partnerA: { rounds: number; totalWorkMs: number }
  partnerB: { rounds: number; totalWorkMs: number }
  switchCount: number
  lastSwitchAt: number
}

export function createPartnerState(): PartnerState {
  return {
    activePartner: 'A',
    partnerA: { rounds: 0, totalWorkMs: 0 },
    partnerB: { rounds: 0, totalWorkMs: 0 },
    switchCount: 0,
    lastSwitchAt: 0,
  }
}

export function switchPartner(
  state: PartnerState,
  elapsedMs: number,
): PartnerState {
  const workMs = elapsedMs - state.lastSwitchAt
  const isA = state.activePartner === 'A'

  return {
    activePartner: isA ? 'B' : 'A',
    partnerA: isA
      ? { rounds: state.partnerA.rounds + 1, totalWorkMs: state.partnerA.totalWorkMs + workMs }
      : state.partnerA,
    partnerB: isA
      ? state.partnerB
      : { rounds: state.partnerB.rounds + 1, totalWorkMs: state.partnerB.totalWorkMs + workMs },
    switchCount: state.switchCount + 1,
    lastSwitchAt: elapsedMs,
  }
}

export function getActivePartner(state: PartnerState): 'A' | 'B' {
  return state.activePartner
}

export function formatWorkTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getPartnerSummary(state: PartnerState): {
  partnerA: { rounds: number; workTime: string }
  partnerB: { rounds: number; workTime: string }
  totalSwitches: number
} {
  return {
    partnerA: {
      rounds: state.partnerA.rounds,
      workTime: formatWorkTime(state.partnerA.totalWorkMs),
    },
    partnerB: {
      rounds: state.partnerB.rounds,
      workTime: formatWorkTime(state.partnerB.totalWorkMs),
    },
    totalSwitches: state.switchCount,
  }
}
