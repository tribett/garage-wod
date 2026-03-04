export const RPE_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: 'Easy', emoji: '😊', color: 'text-green-500' },
  2: { label: 'Moderate', emoji: '🙂', color: 'text-blue-500' },
  3: { label: 'Challenging', emoji: '😤', color: 'text-yellow-500' },
  4: { label: 'Hard', emoji: '😰', color: 'text-orange-500' },
  5: { label: 'Maximal', emoji: '🔥', color: 'text-red-500' },
}

export function getAverageRPE(logs: { rpe?: number }[]): number | null {
  const rated = logs.filter((l) => l.rpe != null)
  if (rated.length === 0) return null
  return Math.round((rated.reduce((sum, l) => sum + l.rpe!, 0) / rated.length) * 10) / 10
}

export function getTrainingLoadWarning(recentRPEs: number[]): string | null {
  if (recentRPEs.length < 3) return null
  const avg = recentRPEs.reduce((a, b) => a + b, 0) / recentRPEs.length
  if (avg >= 4.5) return 'High training load \u2014 consider a recovery day'
  if (avg >= 3.8) return 'Training load is elevated \u2014 listen to your body'
  return null
}
