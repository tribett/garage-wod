export interface BodyweightEntry {
  date: string // YYYY-MM-DD
  weight: number
}

export function addEntry(log: BodyweightEntry[], entry: BodyweightEntry): BodyweightEntry[] {
  const filtered = log.filter((e) => e.date !== entry.date)
  return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date))
}

export function getLatestWeight(log: BodyweightEntry[]): number | null {
  if (!log.length) return null
  return log[log.length - 1].weight
}

export function getTrend(
  log: BodyweightEntry[],
  days: number,
): {
  entries: BodyweightEntry[]
  change: number | null
} {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  const entries = log.filter((e) => e.date >= cutoffStr)
  if (entries.length < 2) return { entries, change: null }
  return { entries, change: entries[entries.length - 1].weight - entries[0].weight }
}

export function getToday(log: BodyweightEntry[]): number | null {
  const today = new Date().toISOString().slice(0, 10)
  return log.find((e) => e.date === today)?.weight ?? null
}
