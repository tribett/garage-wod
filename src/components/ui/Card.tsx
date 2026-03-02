import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const paddingStyles = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({
  children,
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-zinc-100
        dark:bg-zinc-900 dark:border-zinc-800
        ${paddingStyles[padding]}
        ${interactive ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-150' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
