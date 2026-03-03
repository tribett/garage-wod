import { useState, useRef, useEffect } from 'react'

interface GlossaryTooltipProps {
  term: string
  definition: string
}

/**
 * Renders a CrossFit term as a tappable element that shows its definition
 * in a floating popover. Closes on outside click or Escape.
 */
export function GlossaryTooltip({ term, definition }: GlossaryTooltipProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          text-accent dark:text-accent-light underline decoration-dotted underline-offset-2
          cursor-pointer hover:text-accent-hover transition-colors text-inherit font-inherit
        "
        aria-expanded={open}
        aria-haspopup="true"
      >
        {term}
      </button>
      {open && (
        <div
          role="tooltip"
          className="
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
            w-60 max-w-[calc(100vw-2rem)]
            bg-white dark:bg-zinc-800 rounded-xl shadow-lg
            border border-zinc-100 dark:border-zinc-700
            p-3 animate-scale-in
          "
        >
          <p className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
            {term}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {definition}
          </p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-3 h-3 rotate-45 bg-white dark:bg-zinc-800 border-b border-r border-zinc-100 dark:border-zinc-700" />
          </div>
        </div>
      )}
    </span>
  )
}
