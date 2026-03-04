export function getCurrentMovement(
  movements: { name: string }[],
  currentRound: number,
): { name: string; index: number } | null {
  if (!movements.length || currentRound < 1) return null
  const index = (currentRound - 1) % movements.length
  return { name: movements[index].name, index }
}

export function getMovementLabel(
  movements: { name: string }[],
  currentRound: number,
  totalRounds: number,
): string {
  const current = getCurrentMovement(movements, currentRound)
  if (!current) return ''
  if (movements.length === 1) return current.name
  return `Round ${currentRound}/${totalRounds}: ${current.name}`
}
