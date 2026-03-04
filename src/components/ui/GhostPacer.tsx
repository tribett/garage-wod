interface GhostPacerState {
  isActive: boolean
  paceStatus: 'ahead' | 'behind' | 'tied'
  deltaFormatted: string
  progressPct: number
}

interface GhostPacerProps {
  state: GhostPacerState | null
}

const paceColors: Record<string, string> = {
  ahead: 'text-emerald-600 dark:text-emerald-400',
  behind: 'text-red-600 dark:text-red-400',
  tied: 'text-zinc-500 dark:text-zinc-400',
}

const barColors: Record<string, string> = {
  ahead: 'bg-emerald-500',
  behind: 'bg-red-500',
  tied: 'bg-zinc-400',
}

export function GhostPacer({ state }: GhostPacerProps) {
  if (!state || !state.isActive) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500">
        No previous attempt
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>👻</span>
      <span
        data-testid="ghost-delta"
        className={`font-semibold ${paceColors[state.paceStatus]}`}
      >
        {state.deltaFormatted}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <div
          data-testid="ghost-progress-bar"
          className={`h-full rounded-full transition-all ${barColors[state.paceStatus]}`}
          style={{ width: `${state.progressPct}%` }}
        />
      </div>
    </div>
  )
}
