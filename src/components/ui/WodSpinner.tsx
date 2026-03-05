import { useState } from 'react'
import type { GeneratedWod } from '@/lib/wod-generator'

interface WodSpinnerProps {
  onGenerate: () => GeneratedWod
  onStartTimer?: (wod: GeneratedWod) => void
}

export function WodSpinner({ onGenerate, onStartTimer }: WodSpinnerProps) {
  const [wod, setWod] = useState<GeneratedWod | null>(null)

  function handleSpin() {
    const result = onGenerate()
    setWod(result)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleSpin}
        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg shadow-md transition-colors"
      >
        🎰 Spin the WOD
      </button>

      {wod && (
        <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{wod.name}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {wod.type}
            </span>
          </div>

          <ul className="space-y-1">
            {wod.movements.map((m) => (
              <li key={m.name} className="text-sm">
                {m.reps} {m.name}
              </li>
            ))}
          </ul>

          <em className="block text-sm text-zinc-500 dark:text-zinc-400">
            {wod.reasoning}
          </em>

          {onStartTimer && (
            <button
              onClick={() => onStartTimer(wod)}
              className="
                w-full mt-2 px-4 py-2.5 rounded-xl font-bold text-sm
                bg-accent text-white hover:bg-accent/90
                dark:bg-accent-dark dark:hover:bg-accent-dark/90
                transition-colors
              "
            >
              ⏱️ Start Timer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
