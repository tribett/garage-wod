export interface StrengthSet {
  setNumber: number
  completed: boolean
  weight?: number
  reps?: number
}

export interface StrengthSession {
  movementName: string
  totalSets: number
  restSeconds: number
  sets: StrengthSet[]
  currentSet: number
  isResting: boolean
}

export function createSession(movementName: string, totalSets: number, restSeconds: number): StrengthSession {
  return {
    movementName,
    totalSets,
    restSeconds,
    sets: Array.from({ length: totalSets }, (_, i) => ({
      setNumber: i + 1,
      completed: false,
    })),
    currentSet: 1,
    isResting: false,
  }
}

export function completeSet(session: StrengthSession): StrengthSession {
  const updated = {
    ...session,
    sets: session.sets.map((s) =>
      s.setNumber === session.currentSet ? { ...s, completed: true } : s,
    ),
  }
  if (session.currentSet < session.totalSets) {
    updated.isResting = true
  } else {
    updated.isResting = false
  }
  return updated
}

export function finishRest(session: StrengthSession): StrengthSession {
  return {
    ...session,
    isResting: false,
    currentSet: session.currentSet + 1,
  }
}

export function isSessionComplete(session: StrengthSession): boolean {
  return session.sets.every((s) => s.completed)
}

export function getSessionProgress(session: StrengthSession): {
  completedSets: number
  percentage: number
} {
  const completedSets = session.sets.filter((s) => s.completed).length
  return {
    completedSets,
    percentage: Math.round((completedSets / session.totalSets) * 100),
  }
}
