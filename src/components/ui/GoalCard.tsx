import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calculateProgress, getDaysRemaining } from '@/lib/goals'
import type { Goal } from '@/lib/goals'

interface GoalCardProps {
  goal: Goal
  onDelete: (id: string) => void
}

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  weight: { icon: '🏋️', label: 'Weight' },
  time: { icon: '⏱️', label: 'Time' },
  skill: { icon: '💪', label: 'Skill' },
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const { percentage, isComplete } = calculateProgress(goal)
  const daysLeft = getDaysRemaining(goal)
  const typeInfo = TYPE_LABELS[goal.type] ?? TYPE_LABELS.weight

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Movement name + type badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {goal.movementName}
            </span>
            {isComplete ? (
              <Badge variant="success">Complete</Badge>
            ) : (
              <Badge variant="default">
                {typeInfo.icon} {typeInfo.label}
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          <ProgressBar value={goal.currentValue ?? 0} max={goal.targetValue} className="mb-1" />

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {goal.currentValue ?? 0} / {goal.targetValue} {goal.unit}
            </span>
            <div className="flex items-center gap-2">
              {daysLeft !== null && !isComplete && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {daysLeft}d left
                </span>
              )}
              <span className="text-xs font-semibold text-accent dark:text-accent-light">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(goal.id)}
          aria-label="Delete goal"
          className="text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors p-0.5 -mt-0.5 -mr-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Card>
  )
}
