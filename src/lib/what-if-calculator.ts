import { estimate1RM, getPercentages } from '@/lib/one-rm-calculator'

export interface WhatIfResult {
  movement: string
  hypotheticalWeight: number
  currentPR: number | null
  prImprovement: number | null
  prImprovementPct: number | null
  bodyweightRatio: number | null
  estimated1RM: number
  percentageTable: { percentage: number; weight: number }[]
}

export function calculateWhatIf(
  movement: string,
  hypotheticalWeight: number,
  reps: number,
  currentPR: number | null,
  bodyweight?: number,
): WhatIfResult {
  const estimated1RM = estimate1RM(hypotheticalWeight, reps)

  let prImprovement: number | null = null
  let prImprovementPct: number | null = null

  if (currentPR !== null && estimated1RM > 0) {
    prImprovement = estimated1RM - currentPR
    prImprovementPct = Math.round(((estimated1RM - currentPR) / currentPR) * 100 * 100) / 100
  }

  const bodyweightRatio =
    bodyweight !== undefined && bodyweight > 0
      ? Math.round((estimated1RM / bodyweight) * 100) / 100
      : null

  const percentageTable = getPercentages(estimated1RM)

  return {
    movement,
    hypotheticalWeight,
    currentPR,
    prImprovement,
    prImprovementPct,
    bodyweightRatio,
    estimated1RM,
    percentageTable,
  }
}
