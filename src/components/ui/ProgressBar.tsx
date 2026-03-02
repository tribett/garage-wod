interface ProgressBarProps {
  value: number
  max: number
  className?: string
  accentColor?: boolean
}

export function ProgressBar({ value, max, className = '', accentColor = true }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className={`h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${
          accentColor ? 'bg-accent dark:bg-accent-dark' : 'bg-emerald-500 dark:bg-emerald-400'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
