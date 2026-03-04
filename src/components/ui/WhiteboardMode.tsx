interface WhiteboardModeProps {
  wodName: string
  movements: { name: string; reps?: string; weight?: string }[]
  scoring?: string
  onClose: () => void
}

export function WhiteboardMode({ wodName, movements, scoring, onClose }: WhiteboardModeProps) {
  return (
    <div
      data-testid="whiteboard-overlay"
      className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center px-6"
      onClick={onClose}
    >
      <h1 className="text-4xl font-bold text-white mb-4">{wodName}</h1>

      {scoring && (
        <span className="text-2xl text-amber-400 mb-6">{scoring}</span>
      )}

      <ul className="space-y-3 text-center">
        {movements.map((m) => (
          <li key={m.name} className="text-2xl text-white">
            {m.reps && `${m.reps} `}
            {m.name}
            {m.weight && ` (${m.weight})`}
          </li>
        ))}
      </ul>

      <p className="absolute bottom-8 text-sm text-zinc-500">Tap to close</p>
    </div>
  )
}
