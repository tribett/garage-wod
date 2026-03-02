interface NumberInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  step?: number
  min?: number
  label?: string
  unit?: string
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  step = 5,
  min = 0,
  label,
  unit,
}: NumberInputProps) {
  const decrement = () => {
    const current = value ?? 0
    onChange(Math.max(min, current - step))
  }

  const increment = () => {
    const current = value ?? 0
    onChange(current + step)
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrement}
          className="
            w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold
            bg-zinc-100 text-zinc-600 hover:bg-zinc-200 active:scale-95
            dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700
            transition-all duration-100 select-none
          "
        >
          -
        </button>
        <div className="relative flex-1">
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value
              onChange(v === '' ? undefined : Number(v))
            }}
            placeholder={placeholder}
            className="
              w-full h-10 rounded-xl text-center text-sm font-semibold
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              transition-all duration-150
            "
          />
          {unit && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={increment}
          className="
            w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold
            bg-zinc-100 text-zinc-600 hover:bg-zinc-200 active:scale-95
            dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700
            transition-all duration-100 select-none
          "
        >
          +
        </button>
      </div>
    </div>
  )
}
