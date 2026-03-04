export interface RetestSuggestion {
  wodName: string
  lastScore: string
  lastScaling?: string
  lastDate: string
  daysSince: number
}

export function getRetestSuggestions(
  logs: { title?: string; wodResult?: { score?: string; scaling?: string }; completedAt: string }[],
  thresholdDays: number = 60,
  limit: number = 3,
): RetestSuggestion[] {
  // Find named WODs (logs with title that isn't empty)
  const named = logs.filter((l) => l.title?.trim())

  // Group by title, find most recent per WOD
  const latest = new Map<string, typeof named[0]>()
  for (const log of named) {
    const key = log.title!.toLowerCase().trim()
    const existing = latest.get(key)
    if (!existing || new Date(log.completedAt) > new Date(existing.completedAt)) {
      latest.set(key, log)
    }
  }

  // Filter to those older than threshold, build suggestions
  const now = Date.now()
  const suggestions: RetestSuggestion[] = []
  for (const [, log] of latest) {
    const daysSince = Math.floor((now - new Date(log.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince >= thresholdDays) {
      suggestions.push({
        wodName: log.title!.trim(),
        lastScore: log.wodResult?.score ?? '',
        lastScaling: log.wodResult?.scaling,
        lastDate: log.completedAt,
        daysSince,
      })
    }
  }

  // Sort by daysSince DESC (longest since retest first), take limit
  return suggestions
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, limit)
}
