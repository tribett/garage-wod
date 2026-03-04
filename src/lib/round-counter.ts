export interface RoundCount {
  rounds: number
  extraReps: number
}

export function incrementRound(current: RoundCount): RoundCount {
  return { rounds: current.rounds + 1, extraReps: 0 }
}

export function decrementRound(current: RoundCount): RoundCount {
  return { rounds: Math.max(0, current.rounds - 1), extraReps: 0 }
}

export function setExtraReps(current: RoundCount, reps: number): RoundCount {
  return { ...current, extraReps: Math.max(0, reps) }
}

export function formatRoundCount(rc: RoundCount): string {
  if (rc.rounds === 0 && rc.extraReps === 0) return '0'
  if (rc.extraReps === 0) return `${rc.rounds}`
  return `${rc.rounds}+${rc.extraReps}`
}
