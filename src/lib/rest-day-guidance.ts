/**
 * Generate a context-aware rest-day message based on the user's
 * current streak and how recently they last trained.
 */
export function getRestDayMessage(
  streak: number,
  lastWorkoutDate: string | null,
): string {
  // No workout history at all
  if (!lastWorkoutDate) {
    if (streak === 0) {
      return 'Ready to start your fitness journey? Every champion was once a beginner.'
    }
    return `${streak}-day streak going strong! Rest up and come back even stronger.`
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24),
  )

  // Haven't trained in a week+
  if (daysSince >= 7) {
    return "Welcome back! It's been a while — take it easy on your first workout back."
  }

  // Trained yesterday or today
  if (daysSince <= 1) {
    return 'Great work yesterday! Your muscles grow during rest, so enjoy the recovery.'
  }

  // Active streak with moderate gap
  if (streak > 0) {
    return `${streak}-day streak! Rest days are part of the program — you've earned this.`
  }

  return 'Rest days are just as important as training days. Your body rebuilds stronger during recovery.'
}
