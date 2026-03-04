import { useState } from 'react'
import { calculatePlates, formatPlateLoadout } from '@/lib/plate-calculator'
import type { PlateLoadout } from '@/lib/plate-calculator'

interface PlateCalculatorProps {
  unit?: 'lbs' | 'kg'
  initialWeight?: number
}

const PLATE_HEIGHTS: Record<number, number> = {
  55: 80,
  45: 72,
  35: 64,
  25: 56,
  20: 72,
  15: 48,
  10: 40,
  5: 32,
  2.5: 24,
  1.25: 20,
}

function getPlateHeight(weight: number): number {
  return PLATE_HEIGHTS[weight] ?? 36
}

function PlateStack({ loadout, reverse }: { loadout: PlateLoadout; reverse: boolean }) {
  const plates: { weight: number; color: string }[] = []
  for (const set of loadout.perSide) {
    for (let i = 0; i < set.count; i++) {
      plates.push({ weight: set.weight, color: set.color })
    }
  }

  const ordered = reverse ? [...plates].reverse() : plates

  return (
    <div className="flex items-center gap-0.5">
      {ordered.map((plate, idx) => (
        <div
          key={idx}
          data-testid="plate"
          className="rounded"
          style={{
            backgroundColor: plate.color,
            width: 12,
            height: getPlateHeight(plate.weight),
          }}
        />
      ))}
    </div>
  )
}

export function PlateCalculator({ unit = 'lbs', initialWeight }: PlateCalculatorProps) {
  const defaultBar = unit === 'kg' ? 20 : 45
  const [weight, setWeight] = useState<number>(initialWeight ?? defaultBar)

  const loadout = calculatePlates(weight, undefined, unit)
  const breakdown = formatPlateLoadout(loadout)

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <div className="mb-3">
        <label htmlFor="plate-calc-weight" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Target Weight ({unit})
        </label>
        <input
          id="plate-calc-weight"
          type="number"
          min={0}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-24 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* Visual barbell */}
      <div className="flex items-center justify-center gap-1 my-4">
        <PlateStack loadout={loadout} reverse={true} />
        <div className="h-3 w-32 rounded bg-zinc-400 dark:bg-zinc-500" />
        <PlateStack loadout={loadout} reverse={false} />
      </div>

      {/* Text breakdown */}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {breakdown}
      </p>
    </div>
  )
}
