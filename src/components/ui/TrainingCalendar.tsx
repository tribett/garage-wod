import { useMemo, useState } from 'react'
import { buildCalendarData, getMonthLabels, getConsistencyScore } from '@/lib/training-calendar'
import type { CalendarDay } from '@/lib/training-calendar'
import { Card } from '@/components/ui/Card'

const INTENSITY_CLASSES: Record<CalendarDay['intensity'], string> = {
  0: 'bg-zinc-100 dark:bg-zinc-800',
  1: 'bg-accent/30 dark:bg-accent/20',
  2: 'bg-accent/60 dark:bg-accent/50',
  3: 'bg-accent dark:bg-accent-dark',
}

const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''] as const

interface TrainingCalendarProps {
  logs: { completedAt: string }[]
}

export function TrainingCalendar({ logs }: TrainingCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const days = useMemo(() => buildCalendarData(logs), [logs])
  const monthLabels = useMemo(() => getMonthLabels(days), [days])
  const consistency = useMemo(() => getConsistencyScore(days), [days])

  // Build grid: 7 rows (days of week) x N columns (weeks)
  const numWeeks = Math.ceil(days.length / 7)

  // Organize days into columns (weeks) of 7 rows each
  const grid: (CalendarDay | null)[][] = []
  for (let col = 0; col < numWeeks; col++) {
    const week: (CalendarDay | null)[] = []
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row
      week.push(idx < days.length ? days[idx] : null)
    }
    grid.push(week)
  }

  function formatTooltipDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card padding="md" className="animate-slide-up delay-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50">
          Training Activity
        </h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Last 12 weeks
        </span>
      </div>

      {/* Month labels */}
      <div className="flex ml-6 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={`${m.label}-${i}`}
            className="text-[10px] text-zinc-400 dark:text-zinc-500"
            style={{
              position: 'relative',
              left: `${m.weekIndex * 14}px`,
              marginRight: i < monthLabels.length - 1
                ? `${((monthLabels[i + 1]?.weekIndex ?? numWeeks) - m.weekIndex) * 14 - 14}px`
                : '0px',
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-0.5">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="w-3 h-3 flex items-center justify-center"
            >
              {label && (
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-none">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {grid.map((week, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-0.5">
            {week.map((day, rowIdx) => (
              <button
                key={`${colIdx}-${rowIdx}`}
                className={`w-3 h-3 rounded-[3px] transition-all duration-150 ${
                  day
                    ? `${INTENSITY_CLASSES[day.intensity]} hover:ring-1 hover:ring-zinc-400 dark:hover:ring-zinc-500`
                    : 'bg-transparent'
                } ${
                  selectedDay?.date === day?.date
                    ? 'ring-2 ring-accent dark:ring-accent-light'
                    : ''
                }`}
                onClick={() => {
                  if (day) {
                    setSelectedDay(
                      selectedDay?.date === day.date ? null : day,
                    )
                  }
                }}
                aria-label={
                  day
                    ? `${day.date}: ${day.count} workout${day.count !== 1 ? 's' : ''}`
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip for selected day */}
      {selectedDay && (
        <div className="mt-2 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 animate-fade-in">
          <span className="font-semibold">{formatTooltipDate(selectedDay.date)}</span>
          {' — '}
          {selectedDay.count === 0
            ? 'No workouts'
            : `${selectedDay.count} workout${selectedDay.count !== 1 ? 's' : ''}`}
        </div>
      )}

      {/* Consistency score */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Last 4 weeks
          </span>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {consistency.activeDays}/{consistency.totalDays} days ({consistency.percentage}%)
          </span>
        </div>
      </div>
    </Card>
  )
}
