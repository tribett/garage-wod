/**
 * Formats timer elapsed milliseconds into a human-readable score string.
 *
 * - forTime / amrap / unknown → "MM:SS"
 * - emom / tabata → "completed"
 */
export function formatTimerScore(elapsedMs: number, mode: string): string {
  if (mode === 'emom' || mode === 'tabata') {
    return 'completed'
  }

  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
