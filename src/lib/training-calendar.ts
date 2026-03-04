export interface CalendarDay {
  date: string // YYYY-MM-DD
  count: number
  intensity: 0 | 1 | 2 | 3 // 0=none, 1=light, 2=moderate, 3=heavy
}

function getIntensity(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  return 3
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Build an array of CalendarDay from (today - weeks*7) to today.
 * Counts workouts per day from logs using completedAt date.
 */
export function buildCalendarData(
  logs: { completedAt: string }[],
  weeks = 12,
): CalendarDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalDays = weeks * 7 + 1 // +1 to include today

  // Count workouts per date string
  const countMap = new Map<string, number>()
  for (const log of logs) {
    const dateStr = log.completedAt.slice(0, 10)
    countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1)
  }

  const days: CalendarDay[] = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)
    const count = countMap.get(dateStr) ?? 0
    days.push({
      date: dateStr,
      count,
      intensity: getIntensity(count),
    })
  }

  return days
}

/**
 * Iterate through days, when month changes, record month abbreviation + week index.
 */
export function getMonthLabels(
  days: CalendarDay[],
): { label: string; weekIndex: number }[] {
  const labels: { label: string; weekIndex: number }[] = []
  let lastMonth = -1

  for (let i = 0; i < days.length; i++) {
    const month = parseInt(days[i].date.slice(5, 7), 10) - 1
    if (month !== lastMonth) {
      labels.push({
        label: MONTH_ABBR[month],
        weekIndex: Math.floor(i / 7),
      })
      lastMonth = month
    }
  }

  return labels
}

/**
 * Count days with count > 0 in the last (weeksToCheck * 7) days of the array.
 */
export function getConsistencyScore(
  days: CalendarDay[],
  weeksToCheck = 4,
): {
  activeDays: number
  totalDays: number
  percentage: number
} {
  const totalDays = weeksToCheck * 7
  const slice = days.slice(-totalDays)
  const activeDays = slice.filter((d) => d.count > 0).length

  return {
    activeDays,
    totalDays,
    percentage: Math.round((activeDays / totalDays) * 100),
  }
}
