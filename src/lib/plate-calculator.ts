export interface PlateSet {
  weight: number
  count: number
  color: string
}

export interface PlateLoadout {
  targetWeight: number
  barWeight: number
  perSide: PlateSet[]
  totalLoaded: number
  remainder: number
}

export const STANDARD_PLATES_LBS: number[] = [55, 45, 35, 25, 15, 10, 5, 2.5]
export const STANDARD_PLATES_KG: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]

const DEFAULT_PLATES_LBS: number[] = [45, 35, 25, 15, 10, 5, 2.5]

export const PLATE_COLORS: Record<number, string> = {
  55: '#ef4444',
  45: '#3b82f6',
  35: '#eab308',
  25: '#22c55e',
  15: '#f97316',
  10: '#6b7280',
  5: '#1f2937',
  2.5: '#9ca3af',
  20: '#3b82f6',
  1.25: '#9ca3af',
}

export function calculatePlates(
  targetWeight: number,
  barWeight?: number,
  unit?: 'lbs' | 'kg',
  availablePlates?: number[]
): PlateLoadout {
  const resolvedUnit = unit ?? 'lbs'
  const resolvedBar = barWeight ?? (resolvedUnit === 'kg' ? 20 : 45)
  const plates =
    availablePlates ??
    (resolvedUnit === 'kg' ? STANDARD_PLATES_KG : DEFAULT_PLATES_LBS)

  // If target is less than bar weight or zero, return empty loadout
  if (targetWeight <= 0 || targetWeight < resolvedBar) {
    return {
      targetWeight,
      barWeight: resolvedBar,
      perSide: [],
      totalLoaded: 0,
      remainder: 0,
    }
  }

  const weightToLoad = targetWeight - resolvedBar
  const perSideWeight = weightToLoad / 2

  // Greedy algorithm: pick largest plates first
  let remaining = perSideWeight
  const perSide: PlateSet[] = []

  // Sort plates descending to ensure greedy picks largest first
  const sortedPlates = [...plates].sort((a, b) => b - a)

  for (const plate of sortedPlates) {
    if (remaining <= 0) break
    const count = Math.floor(remaining / plate)
    if (count > 0) {
      perSide.push({
        weight: plate,
        count,
        color: PLATE_COLORS[plate] ?? '#6b7280',
      })
      remaining = Math.round((remaining - plate * count) * 100) / 100
    }
  }

  const loadedPerSide = perSide.reduce((sum, p) => sum + p.weight * p.count, 0)
  const totalLoaded = resolvedBar + loadedPerSide * 2
  const remainder = Math.round((targetWeight - totalLoaded) * 100) / 100

  return {
    targetWeight,
    barWeight: resolvedBar,
    perSide,
    totalLoaded,
    remainder,
  }
}

export function formatPlateLoadout(loadout: PlateLoadout): string {
  if (loadout.perSide.length === 0) {
    return 'Just the bar'
  }

  const parts: string[] = []
  for (const plateSet of loadout.perSide) {
    for (let i = 0; i < plateSet.count; i++) {
      parts.push(String(plateSet.weight))
    }
  }

  return `${parts.join(' + ')} per side`
}
