import { useState, type ReactNode } from 'react'

interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  badge?: ReactNode
  className?: string
}

export function Accordion({ title, children, defaultOpen = false, badge, className = '' }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center justify-between py-3 text-left
          text-zinc-900 dark:text-zinc-50
          transition-colors duration-150
        "
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-sm">{title}</span>
          {badge}
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`
          grid transition-all duration-200 ease-out
          ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
