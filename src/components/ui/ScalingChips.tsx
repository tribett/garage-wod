interface ScalingChipsProps {
  options: string[]
  /** Optional: highlight one option as the currently selected scaling */
  selected?: string
  onSelect?: (option: string) => void
}

/**
 * Displays a horizontal scrollable row of scaling options as tappable chips.
 * Options are ordered from Rx (hardest) to most accessible.
 */
export function ScalingChips({ options, selected, onSelect }: ScalingChipsProps) {
  if (options.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Scaling options">
      {options.map((option, i) => {
        const isSelected = selected === option
        const isRx = i === 0

        return (
          <button
            key={option}
            type="button"
            role="listitem"
            onClick={() => onSelect?.(option)}
            className={`
              inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
              transition-all duration-150 active:scale-[0.97]
              ${
                isSelected
                  ? 'bg-accent text-white dark:bg-accent-dark dark:text-white ring-1 ring-accent/30'
                  : isRx
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }
            `}
          >
            {isRx && (
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                Rx
              </span>
            )}
            {option}
          </button>
        )
      })}
    </div>
  )
}
