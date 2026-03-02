interface HeaderProps {
  title?: string
  subtitle?: string
  rightAction?: React.ReactNode
}

export function Header({ title = 'Garage WOD', subtitle, rightAction }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <div>
        <h1 className="font-display font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  )
}
