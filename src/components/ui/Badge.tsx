import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  accent: 'bg-accent-subtle text-accent dark:bg-accent-dark-subtle dark:text-accent-light',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  muted: 'bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold font-display uppercase tracking-wide
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
