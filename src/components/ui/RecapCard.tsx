import { Card } from '@/components/ui/Card'

interface RecapCardProps {
  month: string
  totalWorkouts: number
  prsHit: number
  topMovement: string | null
  comparedToLastMonth?: { workoutDelta: number }
}

export function RecapCard({ month, totalWorkouts, prsHit, topMovement, comparedToLastMonth }: RecapCardProps) {
  const delta = comparedToLastMonth?.workoutDelta

  return (
    <Card padding="md">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
        {month}
      </h3>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {totalWorkouts}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Workouts</span>
        </div>
        <div>
          <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {prsHit}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">PRs</span>
        </div>
        {topMovement && (
          <div>
            <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {topMovement}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Top Movement</span>
          </div>
        )}
      </div>

      {delta !== undefined && (
        <div className="mt-3">
          <span
            className={`
              inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold
              ${delta >= 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
              }
            `}
          >
            {delta >= 0 ? `+${delta}` : `${delta}`} vs last month
          </span>
        </div>
      )}
    </Card>
  )
}
