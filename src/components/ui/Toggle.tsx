interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
          ${checked ? 'bg-accent dark:bg-accent-dark' : 'bg-zinc-200 dark:bg-zinc-700'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
            transform transition-transform duration-200 ease-in-out mt-0.5
            ${checked ? 'translate-x-5.5 ml-px' : 'translate-x-0.5'}
          `}
        />
      </button>
      {label && <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>}
    </label>
  )
}
