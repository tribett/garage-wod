interface AchievementBadgeProps {
  name: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'legendary'
  description: string
  unlockedAt?: string
}

const TIER_COLORS: Record<AchievementBadgeProps['tier'], string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  legendary: '#9333EA',
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AchievementBadge({ name, icon, tier, description, unlockedAt }: AchievementBadgeProps) {
  const isLocked = unlockedAt === undefined
  const borderColor = TIER_COLORS[tier]

  return (
    <div
      className={`
        inline-flex flex-col gap-1 rounded-xl border-2 px-3 py-2
        bg-white dark:bg-zinc-900
        ${isLocked ? 'opacity-40 grayscale' : ''}
      `}
      style={{ borderColor }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{isLocked ? '🔒' : icon}</span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{name}</span>
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
      {unlockedAt && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Unlocked {formatDate(unlockedAt)}
        </span>
      )}
    </div>
  )
}
